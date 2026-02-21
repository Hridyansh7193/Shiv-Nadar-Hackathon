"""Service for analyzing code diffs for malicious patterns.

Provides a heuristic rule-based analyzer that scores diffs on a 0-100 scale.
Optionally delegates to OpenAI for deeper analysis when an API key is available.
"""

import json
import os
import re

import requests

from models.schemas import RiskIndicator
from utils import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Suspicious pattern definitions
# Each tuple: (compiled regex, category, severity weight, human description)
# ---------------------------------------------------------------------------
SUSPICIOUS_PATTERNS: list[tuple[re.Pattern, str, int, str]] = [
    # Network calls
    (re.compile(r"\bfetch\s*\(", re.IGNORECASE), "network", 25, "fetch() call detected"),
    (re.compile(r"\baxios[\.\(]", re.IGNORECASE), "network", 25, "axios call detected"),
    (re.compile(r"\bhttp\.request\s*\(", re.IGNORECASE), "network", 30, "http.request() call detected"),
    (re.compile(r"\bhttps?\.get\s*\(", re.IGNORECASE), "network", 25, "HTTP GET request detected"),
    (re.compile(r"\bXMLHttpRequest\b", re.IGNORECASE), "network", 25, "XMLHttpRequest usage detected"),
    (re.compile(r"\bnew\s+WebSocket\s*\(", re.IGNORECASE), "network", 30, "WebSocket connection detected"),
    (re.compile(r"\bnet\.connect\s*\(", re.IGNORECASE), "network", 35, "net.connect() call detected"),
    (re.compile(r"\bdns\.resolve\s*\(", re.IGNORECASE), "network", 20, "DNS resolution detected"),

    # Environment variable access
    (re.compile(r"\bprocess\.env\b"), "env", 20, "process.env access detected"),
    (re.compile(r"\bos\.environ\b"), "env", 20, "os.environ access detected"),
    (re.compile(r"\bdotenv\b", re.IGNORECASE), "env", 10, "dotenv usage detected"),

    # Base64 encoding (potential data exfiltration / obfuscation)
    (re.compile(r"\batob\s*\("), "encoding", 20, "atob() base64 decoding detected"),
    (re.compile(r"\bbtoa\s*\("), "encoding", 15, "btoa() base64 encoding detected"),
    (re.compile(r"Buffer\.from\s*\([^)]*,\s*['\"]base64['\"]"), "encoding", 25, "Buffer.from base64 detected"),
    (re.compile(r"\.toString\s*\(\s*['\"]base64['\"]"), "encoding", 20, "toString('base64') detected"),

    # Command / child process execution
    (re.compile(r"\bchild_process\b"), "exec", 40, "child_process module usage detected"),
    (re.compile(r"\bexec\s*\("), "exec", 35, "exec() call detected"),
    (re.compile(r"\bexecSync\s*\("), "exec", 40, "execSync() call detected"),
    (re.compile(r"\bspawn\s*\("), "exec", 35, "spawn() call detected"),
    (re.compile(r"\beval\s*\("), "exec", 40, "eval() call detected"),
    (re.compile(r"\bFunction\s*\("), "exec", 35, "Function() constructor detected"),
    (re.compile(r"\bvm\.runInNewContext\b"), "exec", 40, "vm.runInNewContext detected"),

    # Obfuscation signals
    (re.compile(r"\\x[0-9a-fA-F]{2}(?:\\x[0-9a-fA-F]{2}){3,}"), "obfuscation", 30, "Hex-encoded string detected"),
    (re.compile(r"\\u[0-9a-fA-F]{4}(?:\\u[0-9a-fA-F]{4}){3,}"), "obfuscation", 30, "Unicode escape sequence detected"),
    (re.compile(r"String\.fromCharCode\s*\("), "obfuscation", 25, "String.fromCharCode() detected"),

    # File system access (potential data theft)
    (re.compile(r"\bfs\.readFile\b"), "filesystem", 15, "fs.readFile detected"),
    (re.compile(r"\bfs\.writeFile\b"), "filesystem", 20, "fs.writeFile detected"),
    (re.compile(r"\.ssh|\.npmrc|\.env", re.IGNORECASE), "filesystem", 30, "Sensitive file path reference detected"),
]


class AiService:
    """Analyzes diffs for suspicious/malicious patterns."""

    @staticmethod
    def analyze_diff(
        diff_text: str,
        dependency_name: str,
        added_lines: list[str] | None = None,
    ) -> dict:
        """Analyze a diff and return risk assessment.

        Uses heuristic pattern matching. If OPENAI_API_KEY is set,
        additionally queries OpenAI for a second opinion.

        Args:
            diff_text: The unified diff string.
            dependency_name: Name of the package being analyzed.
            added_lines: Pre-extracted added lines (optimization).

        Returns:
            dict with keys: risk_score, risk_level, reason, indicators
        """
        if added_lines is None:
            added_lines = []
            for line in diff_text.splitlines():
                if line.startswith("+") and not line.startswith("+++"):
                    added_lines.append(line[1:])

        # Run heuristic analysis
        indicators = AiService._heuristic_scan(added_lines)
        risk_score = AiService._calculate_score(indicators)
        risk_level = AiService._score_to_level(risk_score)
        reason = AiService._build_reason(indicators, dependency_name)

        # Optionally enhance with OpenAI
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key and diff_text.strip():
            ai_result = AiService._openai_analysis(
                diff_text, dependency_name, openai_key
            )
            if ai_result:
                # Merge: take the higher risk score
                if ai_result.get("risk_score", 0) > risk_score:
                    risk_score = ai_result["risk_score"]
                    risk_level = AiService._score_to_level(risk_score)
                if ai_result.get("reason"):
                    reason = f"{reason} | AI: {ai_result['reason']}"

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "reason": reason,
            "indicators": indicators,
        }

    @staticmethod
    def _heuristic_scan(added_lines: list[str]) -> list[RiskIndicator]:
        """Scan added lines against all suspicious patterns."""
        indicators: list[RiskIndicator] = []
        seen: set[str] = set()  # Deduplicate by pattern description

        for line in added_lines:
            for pattern, category, severity, description in SUSPICIOUS_PATTERNS:
                if description in seen:
                    continue
                if pattern.search(line):
                    # Truncate evidence to 120 chars for readability
                    evidence = line.strip()[:120]
                    indicators.append(
                        RiskIndicator(
                            pattern=description,
                            category=category,
                            severity=severity,
                            evidence=evidence,
                        )
                    )
                    seen.add(description)

        return indicators

    @staticmethod
    def _calculate_score(indicators: list[RiskIndicator]) -> int:
        """Calculate aggregate risk score from indicators.

        Uses a diminishing-returns formula so multiple low-severity
        hits don't instantly max out the score, but high-severity
        hits escalate quickly.
        """
        if not indicators:
            return 0

        # Sort by severity descending
        sorted_indicators = sorted(indicators, key=lambda i: i.severity, reverse=True)

        score = 0.0
        for idx, indicator in enumerate(sorted_indicators):
            # Each subsequent indicator contributes less (diminishing factor)
            weight = 1.0 / (1.0 + idx * 0.3)
            score += indicator.severity * weight

        # Clamp to 0-100
        return min(100, max(0, int(score)))

    @staticmethod
    def _score_to_level(score: int) -> str:
        """Convert numeric score to human-readable risk level."""
        if score >= 80:
            return "CRITICAL"
        if score >= 50:
            return "HIGH"
        if score >= 25:
            return "MEDIUM"
        return "LOW"

    @staticmethod
    def _build_reason(indicators: list[RiskIndicator], dep_name: str) -> str:
        """Build a concise human-readable reason string."""
        if not indicators:
            return f"No suspicious patterns detected in {dep_name} update"

        # Group by category
        categories: dict[str, list[str]] = {}
        for ind in indicators:
            categories.setdefault(ind.category, []).append(ind.pattern)

        parts: list[str] = []
        category_labels = {
            "network": "new network calls",
            "env": "environment variable access",
            "encoding": "base64 encoding/decoding",
            "exec": "command execution",
            "obfuscation": "code obfuscation",
            "filesystem": "file system access",
        }
        for cat, patterns in categories.items():
            label = category_labels.get(cat, cat)
            parts.append(f"{label} ({len(patterns)} pattern{'s' if len(patterns) > 1 else ''})")

        return f"Detected in {dep_name}: " + "; ".join(parts)

    @staticmethod
    def _openai_analysis(
        diff_text: str, dependency_name: str, api_key: str
    ) -> dict | None:
        """Query OpenAI to analyze the diff for supply-chain risks.

        Returns a dict with risk_score and reason, or None on failure.
        """
        # Truncate diff to avoid token limits
        truncated_diff = diff_text[:8000]

        prompt = (
            f"You are a security analyst reviewing a code diff for the npm package '{dependency_name}'. "
            "Analyze the following diff for supply-chain attack indicators:\n"
            "- New network calls (fetch, axios, http)\n"
            "- Environment variable exfiltration\n"
            "- Base64 obfuscation\n"
            "- child_process or eval usage\n"
            "- Accessing sensitive files (.ssh, .npmrc, .env)\n\n"
            f"Diff:\n```\n{truncated_diff}\n```\n\n"
            "Respond with JSON only: {\"risk_score\": <0-100>, \"reason\": \"<brief explanation>\"}"
        )

        try:
            resp = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "max_tokens": 200,
                },
                timeout=20,
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            # Parse the JSON from the response
            return json.loads(content)
        except Exception as exc:
            logger.warning("OpenAI analysis failed for %s: %s", dependency_name, exc)
            return None
