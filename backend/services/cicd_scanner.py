"""
Sentinel Source – CI/CD Scanner
Scans package.json and sends results to Slack
"""
import asyncio
import sys
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SENTINEL_API_URL = os.getenv("SENTINEL_API_URL", "http://localhost:8000")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")


async def send_slack_alert(results: dict):
    """Send scan results to Slack channel"""

    if not SLACK_WEBHOOK_URL:
        print("⚠️ No Slack webhook URL found — skipping alert")
        return

    dependencies = results.get("results", [])
    high_risk = [d for d in dependencies if d.get("risk_score", 0) >= 75]
    suspicious = [d for d in dependencies if 50 <= d.get("risk_score", 0) < 75]
    safe = [d for d in dependencies if d.get("risk_score", 0) < 50]

    if high_risk:
        color = "#FF0000"
        status = "🔴 HIGH RISK DETECTED — BUILD BLOCKED"
    elif suspicious:
        color = "#FFA500"
        status = "🟡 SUSPICIOUS PACKAGES FOUND"
    else:
        color = "#36a64f"
        status = "🟢 ALL PACKAGES SAFE"

    package_lines = []
    for dep in dependencies:
        score = dep.get("risk_score", 0)
        name = dep.get("dependency", "unknown")
        reason = dep.get("reason", "")
        risk = dep.get("risk_level", "LOW")

        if score >= 75:
            emoji = "🔴"
        elif score >= 50:
            emoji = "🟡"
        else:
            emoji = "🟢"

        package_lines.append(
            f"{emoji} *{name}* — {risk} ({score}/100)\n   _{reason}_"
        )

    message = {
        "attachments": [
            {
                "color": color,
                "title": "🛡️ Sentinel Source — Dependency Security Scan",
                "text": status,
                "fields": [
                    {
                        "title": "Project",
                        "value": results.get("project_name", "unknown"),
                        "short": True
                    },
                    {
                        "title": "Total Packages",
                        "value": str(results.get("total_dependencies", 0)),
                        "short": True
                    },
                    {
                        "title": "🔴 High Risk",
                        "value": str(len(high_risk)),
                        "short": True
                    },
                    {
                        "title": "🟡 Suspicious",
                        "value": str(len(suspicious)),
                        "short": True
                    },
                    {
                        "title": "🟢 Safe",
                        "value": str(len(safe)),
                        "short": True
                    },
                    {
                        "title": "Package Results",
                        "value": "\n".join(package_lines) if package_lines else "No packages found",
                        "short": False
                    }
                ],
                "footer": "Sentinel Source — AI Dependency Firewall"
            }
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                SLACK_WEBHOOK_URL,
                json=message,
                timeout=10.0
            )
            if response.status_code == 200:
                print("✅ Slack alert sent successfully!")
            else:
                print(f"❌ Slack alert failed: {response.status_code} — {response.text}")
    except Exception as e:
        print(f"❌ Slack alert error: {e}")


async def run_scan(package_json_path: str):
    """Send package.json to Sentinel Source API and get results"""

    if not os.path.exists(package_json_path):
        print(f"❌ File not found: {package_json_path}")
        sys.exit(1)

    print(f"🔍 Scanning {package_json_path}...")
    print(f"🌐 Sending to: {SENTINEL_API_URL}/analyze")

    try:
        async with httpx.AsyncClient() as client:
            with open(package_json_path, "rb") as f:
                response = await client.post(
                    f"{SENTINEL_API_URL}/analyze",
                    files={"file": (package_json_path, f, "application/json")},
                    timeout=120.0
                )
    except httpx.ConnectError:
        print(f"❌ Cannot connect to backend at {SENTINEL_API_URL}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Request failed: {e}")
        sys.exit(1)

    if response.status_code != 200:
        print(f"❌ Scan failed: {response.status_code} — {response.text}")
        sys.exit(1)

    results = response.json()

    print("\n" + "="*50)
    print("📊 SENTINEL SOURCE SCAN RESULTS")
    print("="*50)
    print(f"Project:        {results.get('project_name', 'unknown')}")
    print(f"Total Packages: {results.get('total_dependencies', 0)}")
    print(f"High Risk:      {results.get('high_risk_count', 0)}")
    print("-"*50)

    for dep in results.get("results", []):
        score = dep.get("risk_score", 0)
        name = dep.get("dependency", "unknown")
        reason = dep.get("reason", "")

        if score >= 75:
            emoji = "🔴"
        elif score >= 50:
            emoji = "🟡"
        else:
            emoji = "🟢"

        print(f"{emoji} {name} — Score: {score}/100")
        print(f"   Reason: {reason}")
        print()

    print("="*50)

    await send_slack_alert(results)

    high_risk_count = results.get("high_risk_count", 0)
    if high_risk_count > 0:
        print(f"\n🔴 {high_risk_count} HIGH RISK PACKAGE(S) FOUND — BLOCKING BUILD!")
        sys.exit(1)
    else:
        print("\n✅ All packages safe — build continues!")
        sys.exit(0)


if __name__ == "__main__":
    package_path = sys.argv[1] if len(sys.argv) > 1 else "package.json"
    asyncio.run(run_scan(package_path))