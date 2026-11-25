"""main.py — Main Entry Point for Portfolio Automation.

Demonstrates repository synchronization, screenshot discovery, and portfolio
asset building for Starchild13.
Complies with PEP 8 style guide.
"""

from github_sync import (
    enrich_repository_data,
    export_portfolio_data,
    fetch_live_repositories,
    load_cached_repositories,
)


def example_sync_repositories() -> None:
    """Showcase fetching all repositories with screenshot discovery."""
    brain_dir = (
        "/Users/jessicarandall/.gemini/antigravity/brain/"
        "8114c40b-fd82-4e82-8a37-5a75855c1147/.system_generated/steps/37/"
    )
    cache_file = brain_dir + "content.md"
    project_dir = "/Users/jessicarandall/Documents/antigravity/valiant-tesla/"
    output_file = project_dir + "projects_data.json"

    print("Executing GitHub repository synchronization for Starchild13...")
    raw_repos = fetch_live_repositories("Starchild13", output_file)
    if not raw_repos:
        raw_repos = load_cached_repositories(cache_file)
    print(f"Loaded {len(raw_repos)} repositories.")

    enriched_repos = enrich_repository_data(raw_repos)
    print(
        f"Enriched {len(enriched_repos)} repositories with tags."
    )

    with_screenshots = [r for r in enriched_repos if r["screenshots"]]
    print(
        f"Discovered {len(with_screenshots)} repositories with screenshots."
    )

    success = export_portfolio_data(enriched_repos, output_file)
    if success:
        print(f"Successfully exported data to: {output_file}")
    else:
        print("Failed to export repository data.")


def main() -> None:
    """Entry point to showcase portfolio synchronization functionality."""
    example_sync_repositories()


if __name__ == "__main__":
    main()
