"""Service for generating diffs between two versions of a package.

Uses Python's built-in difflib to produce unified diffs that can
be analyzed for suspicious changes.
"""

import difflib

from utils import get_logger

logger = get_logger(__name__)

# Maximum total diff lines to prevent memory issues on huge packages
MAX_DIFF_LINES = 5000


class DiffService:
    """Generates unified diffs between two source trees."""

    @staticmethod
    def generate_diff(
        old_sources: dict[str, str],
        new_sources: dict[str, str],
        old_label: str = "old",
        new_label: str = "new",
    ) -> str:
        """Generate a unified diff across all files in two source trees.

        Args:
            old_sources: {filepath: content} for the older version.
            new_sources: {filepath: content} for the newer version.
            old_label: Label prefix for the old version (e.g. "lodash@4.17.20").
            new_label: Label prefix for the new version (e.g. "lodash@4.17.21").

        Returns:
            A single string containing the unified diff of all changed files.
        """
        all_files = sorted(set(list(old_sources.keys()) + list(new_sources.keys())))
        diff_parts: list[str] = []
        total_lines = 0

        for filepath in all_files:
            if total_lines >= MAX_DIFF_LINES:
                diff_parts.append(
                    f"\n... diff truncated at {MAX_DIFF_LINES} lines ...\n"
                )
                break

            old_content = old_sources.get(filepath, "")
            new_content = new_sources.get(filepath, "")

            if old_content == new_content:
                continue

            old_lines = old_content.splitlines(keepends=True)
            new_lines = new_content.splitlines(keepends=True)

            diff = difflib.unified_diff(
                old_lines,
                new_lines,
                fromfile=f"{old_label}/{filepath}",
                tofile=f"{new_label}/{filepath}",
                lineterm="",
            )

            file_diff = list(diff)
            if file_diff:
                diff_parts.extend(file_diff)
                total_lines += len(file_diff)

        result = "\n".join(diff_parts)
        logger.info(
            "Generated diff: %d lines across %d files (%s → %s)",
            total_lines,
            len(all_files),
            old_label,
            new_label,
        )
        return result

    @staticmethod
    def get_added_lines(diff_text: str) -> list[str]:
        """Extract only the newly added lines (lines starting with '+') from a diff.

        Ignores the '+++ filename' header lines.
        """
        added: list[str] = []
        for line in diff_text.splitlines():
            if line.startswith("+") and not line.startswith("+++"):
                added.append(line[1:])  # Strip the leading '+'
        return added
