from pydantic import BaseModel, Field


class DependencyInfo(BaseModel):
    """Represents a parsed dependency from package.json."""
    name: str
    current_version: str
    latest_version: str | None = None
    previous_version: str | None = None
    repository_url: str | None = None


class RiskIndicator(BaseModel):
    """A single risk indicator found in the diff."""
    pattern: str = Field(description="The pattern that was matched")
    category: str = Field(description="Category: network, env, encoding, exec, obfuscation")
    severity: int = Field(ge=0, le=100, description="Severity weight of this indicator")
    evidence: str = Field(description="The line or snippet that triggered the match")


class DependencyRisk(BaseModel):
    """Risk assessment result for a single dependency."""
    dependency: str
    current_version: str
    latest_version: str | None = None
    previous_version: str | None = None
    risk_level: str = Field(description="LOW, MEDIUM, HIGH, or CRITICAL")
    risk_score: int = Field(ge=0, le=100, description="Numeric risk score 0-100")
    reason: str = Field(description="Human-readable explanation of the risk")
    indicators: list[RiskIndicator] = Field(default_factory=list)
    diff_available: bool = False
    error: str | None = None


class AnalysisResponse(BaseModel):
    """Top-level response for the /analyze endpoint."""
    project_name: str | None = None
    total_dependencies: int
    high_risk_count: int
    results: list[DependencyRisk]
