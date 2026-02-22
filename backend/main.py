import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uuid

# Ensure the backend directory is on sys.path so services/models/utils resolve
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from database import engine, Base, get_db
from models.schemas import AnalysisResponse, DependencyRisk
from services.npm_service import NpmService
from services.diff_service import DiffService
from services.ai_service import AiService
from utils import get_logger

logger = get_logger("sentinel_source")

# ---------------------------------------------------------------------------
# Create tables on startup
# ---------------------------------------------------------------------------
Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Sentinel Source – The Dependency Firewall",
    description=(
        "Upload a package.json file to analyze npm dependency updates "
        "for malicious code changes, supply-chain risks, and suspicious patterns."
    ),
    version="1.0.0",
)

# CORS – configurable via CORS_ORIGINS env var
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Max concurrent npm fetches per request
MAX_WORKERS = 8


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "Sentinel Source", "version": "1.0.0"}


@app.post("/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_package_json(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Accept a package.json upload and analyze every dependency for risks."""

    # ── Validate upload ──────────────────────────────────────────────────
    if not file.filename or not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Please upload a .json file")

    try:
        raw = await file.read()
        package_data = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {exc}")

    project_name = package_data.get("name", "unknown")
    deps = NpmService.parse_dependencies(package_data)

    if not deps:
        raise HTTPException(
            status_code=400,
            detail="No dependencies or devDependencies found in the uploaded file",
        )

    logger.info(
        "Analyzing %d dependencies for project '%s'", len(deps), project_name
    )

    # ── Analyze dependencies concurrently ────────────────────────────────
    results: list[DependencyRisk] = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {
            pool.submit(_analyze_single_dependency, dep): dep for dep in deps
        }
        for future in as_completed(futures):
            dep = futures[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as exc:
                logger.error("Error analyzing %s: %s", dep["name"], exc)
                results.append(
                    DependencyRisk(
                        dependency=dep["name"],
                        current_version=dep["version"],
                        risk_level="LOW",
                        risk_score=0,
                        reason=f"Analysis failed: {exc}",
                        error=str(exc),
                    )
                )

    # Sort by risk score descending
    results.sort(key=lambda r: r.risk_score, reverse=True)

    high_risk_count = sum(1 for r in results if r.risk_score >= 50)

    # ── Save scan to database ─────────────────────────────────────────────
    try:
        from models.scan_models import Scan, Dependency

        # Calculate overall score
        if results:
            overall_score = sum(r.risk_score for r in results) / len(results)
        else:
            overall_score = 0.0

        # Save scan
        scan = Scan(
            id=uuid.uuid4(),
            overall_score=overall_score,
            total_packages=float(len(results)),
            high_risk_count=float(high_risk_count),
        )
        db.add(scan)
        db.flush()

        # Save each dependency result
        for r in results:
            dep_record = Dependency(
                id=uuid.uuid4(),
                scan_id=scan.id,
                name=r.dependency,
                old_version=r.previous_version or "",
                new_version=r.latest_version or "",
                risk_level=r.risk_level,
                risk_reason=r.reason,
                severity_score=float(r.risk_score),
            )
            db.add(dep_record)

        db.commit()
        logger.info("✅ Scan saved to database with ID: %s", scan.id)

    except Exception as e:
        db.rollback()
        logger.error("❌ Failed to save scan to database: %s", e)

    return AnalysisResponse(
        project_name=project_name,
        total_dependencies=len(results),
        high_risk_count=high_risk_count,
        results=results,
    )


# ---------------------------------------------------------------------------
# Scan History Endpoint
# ---------------------------------------------------------------------------
@app.get("/scans", tags=["History"])
async def get_scan_history(db: Session = Depends(get_db)):
    """Get all previous scan results from database."""
    try:
        from models.scan_models import Scan
        scans = db.query(Scan).order_by(Scan.created_at.desc()).all()
        return {
            "scans": [
                {
                    "id": str(s.id),
                    "created_at": str(s.created_at),
                    "overall_score": s.overall_score,
                    "total_packages": s.total_packages,
                    "high_risk_count": s.high_risk_count,
                }
                for s in scans
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/scans/{scan_id}", tags=["History"])
async def get_scan_detail(scan_id: str, db: Session = Depends(get_db)):
    """Get detailed results for a specific scan."""
    try:
        from models.scan_models import Scan, Dependency
        scan = db.query(Scan).filter(Scan.id == uuid.UUID(scan_id)).first()
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")

        dependencies = db.query(Dependency).filter(
            Dependency.scan_id == scan.id
        ).all()

        return {
            "scan_id": str(scan.id),
            "created_at": str(scan.created_at),
            "overall_score": scan.overall_score,
            "total_packages": scan.total_packages,
            "high_risk_count": scan.high_risk_count,
            "dependencies": [
                {
                    "name": d.name,
                    "old_version": d.old_version,
                    "new_version": d.new_version,
                    "risk_level": d.risk_level,
                    "risk_reason": d.risk_reason,
                    "severity_score": d.severity_score,
                }
                for d in dependencies
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
def _analyze_single_dependency(dep: dict) -> DependencyRisk:
    """Full analysis pipeline for a single dependency."""
    name = dep["name"]
    version = dep["version"]
    clean_version = NpmService.clean_version(version)

    logger.info("Processing %s@%s", name, version)

    metadata = NpmService.fetch_package_metadata(name)
    if metadata is None:
        return DependencyRisk(
            dependency=name,
            current_version=version,
            risk_level="LOW",
            risk_score=0,
            reason=f"Could not fetch npm metadata for {name}",
            error="npm registry unreachable or package not found",
        )

    latest_version = NpmService.get_latest_version(metadata)
    previous_version = NpmService.get_previous_version(metadata, version)

    old_ver = previous_version or clean_version
    new_ver = latest_version or clean_version

    if old_ver == new_ver:
        return DependencyRisk(
            dependency=name,
            current_version=version,
            latest_version=latest_version,
            previous_version=previous_version,
            risk_level="LOW",
            risk_score=0,
            reason=f"{name} is already at the latest version ({new_ver})",
        )

    logger.info("Downloading %s: %s → %s", name, old_ver, new_ver)
    old_sources = NpmService.fetch_tarball_source(name, old_ver)
    new_sources = NpmService.fetch_tarball_source(name, new_ver)

    if not old_sources and not new_sources:
        return DependencyRisk(
            dependency=name,
            current_version=version,
            latest_version=latest_version,
            previous_version=previous_version,
            risk_level="LOW",
            risk_score=0,
            reason=f"Could not download source for {name}",
            error="Tarball download failed for both versions",
        )

    diff_text = DiffService.generate_diff(
        old_sources,
        new_sources,
        old_label=f"{name}@{old_ver}",
        new_label=f"{name}@{new_ver}",
    )

    if not diff_text.strip():
        return DependencyRisk(
            dependency=name,
            current_version=version,
            latest_version=latest_version,
            previous_version=previous_version,
            risk_level="LOW",
            risk_score=0,
            reason=f"No code changes detected between {old_ver} and {new_ver}",
            diff_available=False,
        )

    added_lines = DiffService.get_added_lines(diff_text)
    analysis = AiService.analyze_diff(diff_text, name, added_lines)

    return DependencyRisk(
        dependency=name,
        current_version=version,
        latest_version=latest_version,
        previous_version=previous_version,
        risk_level=analysis["risk_level"],
        risk_score=analysis["risk_score"],
        reason=analysis["reason"],
        indicators=analysis["indicators"],
        diff_available=True,
    )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "_main_":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    logger.info("Starting Sentinel Source on %s:%d", host, port)
    uvicorn.run("main:app", host=host, port=port, reload=True)