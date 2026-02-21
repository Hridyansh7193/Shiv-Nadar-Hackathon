"""Service for interacting with the npm registry API.

Fetches package metadata, version history, repository URLs,
and downloads + extracts tarball source for diffing.
"""

import io
import re
import tarfile
from typing import Any

import requests
from packaging.version import Version, InvalidVersion

from utils import get_logger

logger = get_logger(__name__)

NPM_REGISTRY = "https://registry.npmjs.org"
REQUEST_TIMEOUT = 15  # seconds


class NpmService:
    """Handles all npm registry interactions."""

    @staticmethod
    def fetch_package_metadata(package_name: str) -> dict[str, Any] | None:
        """Fetch full metadata for a package from the npm registry."""
        url = f"{NPM_REGISTRY}/{package_name}"
        try:
            resp = requests.get(url, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException as exc:
            logger.warning("Failed to fetch metadata for %s: %s", package_name, exc)
            return None

    @staticmethod
    def get_latest_version(metadata: dict[str, Any]) -> str | None:
        """Extract the 'latest' dist-tag version."""
        return metadata.get("dist-tags", {}).get("latest")

    @staticmethod
    def get_previous_version(
        metadata: dict[str, Any], current_version: str
    ) -> str | None:
        """Find the version published immediately before `current_version`.

        Sorts all published versions semantically and returns the one
        right before the given version.
        """
        versions_dict = metadata.get("versions", {})
        parsed: list[tuple[Version, str]] = []
        for v in versions_dict:
            try:
                parsed.append((Version(v), v))
            except InvalidVersion:
                continue

        parsed.sort(key=lambda x: x[0])
        version_strings = [v[1] for v in parsed]

        # Clean the current version (strip ^, ~, etc.)
        clean = NpmService.clean_version(current_version)
        if clean in version_strings:
            idx = version_strings.index(clean)
            if idx > 0:
                return version_strings[idx - 1]
        elif version_strings:
            # If exact match not found, return second-to-last
            return version_strings[-2] if len(version_strings) >= 2 else None

        return None

    @staticmethod
    def get_repository_url(metadata: dict[str, Any]) -> str | None:
        """Extract the GitHub repository URL from package metadata."""
        repo = metadata.get("repository")
        if isinstance(repo, dict):
            url = repo.get("url", "")
        elif isinstance(repo, str):
            url = repo
        else:
            return None

        # Normalize git+https://github.com/user/repo.git → https://github.com/user/repo
        url = re.sub(r"^git\+", "", url)
        url = re.sub(r"\.git$", "", url)
        url = url.replace("git://", "https://")
        url = url.replace("ssh://git@", "https://")
        return url if url.startswith("http") else None

    @staticmethod
    def fetch_tarball_source(
        package_name: str, version: str
    ) -> dict[str, str]:
        """Download and extract JS/JSON source files from an npm tarball.

        Returns a dict mapping relative file paths to their text content.
        Only includes .js, .mjs, .cjs, .ts, and .json files under 500 KB.
        """
        url = f"{NPM_REGISTRY}/{package_name}/-/{package_name.split('/')[-1]}-{version}.tgz"
        logger.info("Fetching tarball: %s", url)

        try:
            resp = requests.get(url, timeout=30, stream=True)
            resp.raise_for_status()
        except requests.RequestException as exc:
            logger.warning("Failed to download tarball for %s@%s: %s", package_name, version, exc)
            return {}

        sources: dict[str, str] = {}
        allowed_extensions = (".js", ".mjs", ".cjs", ".ts", ".json")
        max_file_size = 500_000  # 500 KB

        try:
            with tarfile.open(fileobj=io.BytesIO(resp.content), mode="r:gz") as tar:
                for member in tar.getmembers():
                    if not member.isfile():
                        continue
                    if not member.name.endswith(allowed_extensions):
                        continue
                    if member.size > max_file_size:
                        continue

                    f = tar.extractfile(member)
                    if f is None:
                        continue
                    try:
                        content = f.read().decode("utf-8", errors="replace")
                        # Strip the leading "package/" prefix that npm tarballs use
                        relative_path = re.sub(r"^package/", "", member.name)
                        sources[relative_path] = content
                    except Exception:
                        continue
        except (tarfile.TarError, EOFError) as exc:
            logger.warning("Failed to extract tarball for %s@%s: %s", package_name, version, exc)

        logger.info("Extracted %d files from %s@%s", len(sources), package_name, version)
        return sources

    @staticmethod
    def clean_version(version_str: str) -> str:
        """Strip semver range operators (^, ~, >=, etc.) to get a bare version."""
        return re.sub(r"^[^\d]*", "", version_str.strip())

    @staticmethod
    def parse_dependencies(package_json: dict[str, Any]) -> list[dict[str, str]]:
        """Extract all dependencies and devDependencies from a package.json dict.

        Returns a list of {"name": ..., "version": ...} dicts.
        """
        deps: list[dict[str, str]] = []
        for section in ("dependencies", "devDependencies"):
            for name, version in package_json.get(section, {}).items():
                deps.append({"name": name, "version": version})
        return deps
