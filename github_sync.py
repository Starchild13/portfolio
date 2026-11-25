"""github_sync.py — GitHub Portfolio Synchronization Utility.

This module provides functions to fetch, inspect, and synchronize public
GitHub repositories and screenshot assets for the Starchild13 portfolio.
Strictly formatted according to PEP 8 standards (all lines <= 79 chars).
"""

import json
import os
from typing import Any, Dict, List


GITHUB_USERNAME = "Starchild13"
RAW_BASE = "https://raw.githubusercontent.com/Starchild13"

# Verified screenshot locations discovered across Starchild13 README files
KNOWN_SCREENSHOTS: Dict[str, List[str]] = {
    "TickerBoard": [
        f"{RAW_BASE}/TickerBoard/master/screenshots/Class.png",
        f"{RAW_BASE}/TickerBoard/master/screenshots/Amb.png",
        f"{RAW_BASE}/TickerBoard/master/screenshots/Cybe.png",
        f"{RAW_BASE}/TickerBoard/master/screenshots/Emer.png",
    ],
    "Card-Studio": [
        f"{RAW_BASE}/Card-Studio/master/docs/screenshots/HomeScreen.png",
        f"{RAW_BASE}/Card-Studio/master/docs/screenshots/PreviewScreen.png",
        f"{RAW_BASE}/Card-Studio/master/docs/screenshots/CarouselLayout.png",
        f"{RAW_BASE}/Card-Studio/master/docs/screenshots/ColourScreen.png",
        f"{RAW_BASE}/Card-Studio/master/docs/screenshots/3PictureLayout.png",
        (
            f"{RAW_BASE}/Card-Studio/master"
            "/docs/screenshots/HomeWithCardSaved.png"
        ),
        f"{RAW_BASE}/Card-Studio/master/docs/screenshots/GridLayout.png",
        f"{RAW_BASE}/Card-Studio/master/docs/screenshots/SaveScreen.png",
        f"{RAW_BASE}/Card-Studio/master/docs/screenshots/TextScreen.png",
    ],
    "Photos": [
        f"{RAW_BASE}/Photos/master/screenshots/app_screenshot.png",
    ],
    "moodie": [
        f"{RAW_BASE}/moodie/master/doc/screenshots/Home.png",
        f"{RAW_BASE}/moodie/master/doc/screenshots/Discover_Moodie.png",
        f"{RAW_BASE}/moodie/master/doc/screenshots/All.png",
        f"{RAW_BASE}/moodie/master/doc/screenshots/Positive.png",
        f"{RAW_BASE}/moodie/master/doc/screenshots/Mixed.png",
        f"{RAW_BASE}/moodie/master/doc/screenshots/Difficult.png",
        f"{RAW_BASE}/moodie/master/doc/screenshots/Reflections.png",
        f"{RAW_BASE}/moodie/master/doc/screenshots/Reveal_Moodie.png",
        f"{RAW_BASE}/moodie/master/doc/screenshots/Save_Moodie.png",
        f"{RAW_BASE}/moodie/master/doc/screenshots/Mood_Board.png",
    ],
    "BusinessCard": [
        f"{RAW_BASE}/BusinessCard/master/screenshots/main_card.png",
        f"{RAW_BASE}/BusinessCard/master/screenshots/sessionize_profile.png",
        f"{RAW_BASE}/BusinessCard/master/screenshots/twitter_profile.png",
        f"{RAW_BASE}/BusinessCard/master/screenshots/github_profile.png",
        f"{RAW_BASE}/BusinessCard/master/screenshots/email_composer.png",
        f"{RAW_BASE}/BusinessCard/master/screenshots/share_contact.png",
    ],
    "NoteEncryptWithVoice": [
        f"{RAW_BASE}/NoteEncryptWithVoice/master/docs/images/layout_list.png",
        f"{RAW_BASE}/NoteEncryptWithVoice/master/docs/images/layout_grid.png",
        f"{RAW_BASE}/NoteEncryptWithVoice/master/docs/images/layout_map.png",
        (
            f"{RAW_BASE}/NoteEncryptWithVoice/master"
            "/docs/images/layout_mountain.png"
        ),
        f"{RAW_BASE}/NoteEncryptWithVoice/master/docs/images/layout_river.png",
        (
            f"{RAW_BASE}/NoteEncryptWithVoice/master"
            "/docs/images/layout_waterfall.png"
        ),
    ],
    "Namer": [
        f"{RAW_BASE}/Namer/master/assets/home_screen_framed.png",
        f"{RAW_BASE}/Namer/master/assets/favorites_screen_framed.png",
    ],
    "RetrofitEm": [
        f"{RAW_BASE}/RetrofitEm/master/screenshots/success_state.png",
    ],
    "BingoApp": [
        (
            f"{RAW_BASE}/BingoApp/master/composeApp/src/commonMain"
            "/composeResources/drawable/android_home.png"
        ),
        (
            f"{RAW_BASE}/BingoApp/master/composeApp/src/commonMain"
            "/composeResources/drawable/android_game.png"
        ),
        (
            f"{RAW_BASE}/BingoApp/master/composeApp/src/commonMain"
            "/composeResources/drawable/android_win.png"
        ),
        (
            f"{RAW_BASE}/BingoApp/master/composeApp/src/commonMain"
            "/composeResources/drawable/ios_home.png"
        ),
        (
            f"{RAW_BASE}/BingoApp/master/composeApp/src/commonMain"
            "/composeResources/drawable/ios_game.png"
        ),
        (
            f"{RAW_BASE}/BingoApp/master/composeApp/src/commonMain"
            "/composeResources/drawable/home_web.png"
        ),
    ],
    "Flow-Row-example": [
        f"{RAW_BASE}/Flow-Row-example/master/screenshots/Portrait.png",
        f"{RAW_BASE}/Flow-Row-example/master/screenshots/Landscape.png",
    ],
    "Flow-Column-Example": [
        f"{RAW_BASE}/Flow-Column-Example/master/screenshots/portrait.png",
        f"{RAW_BASE}/Flow-Column-Example/master/screenshots/landscape.png",
    ],
    "Dice_Roller_Star13": [
        f"{RAW_BASE}/Dice_Roller_Star13/master/screenshots/XML_Dice.png",
    ],
    "Dice_Roller13": [
        f"{RAW_BASE}/Dice_Roller13/master/screenshots/dice_roller.png",
    ],
}


def load_cached_repositories(cache_path: str) -> List[Dict[str, Any]]:
    """Load cached repository JSON data from local filesystem.

    Args:
        cache_path: Filepath containing GitHub API JSON response.

    Returns:
        List of repository metadata dictionaries.
    """
    if not os.path.exists(cache_path):
        return []

    with open(cache_path, "r", encoding="utf-8") as file_handle:
        raw_text = file_handle.read()

    start_idx = raw_text.find("[")
    if start_idx == -1:
        return []

    return json.loads(raw_text[start_idx:])


def enrich_repository_data(
    repos: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Enrich raw GitHub repositories with verified screenshots and tags.

    Args:
        repos: List of raw repository dictionaries from GitHub API.

    Returns:
        Enriched list of repository objects formatted for the portfolio.
    """
    enriched: List[Dict[str, Any]] = []

    for repo in repos:
        name = repo.get("name", "")
        screenshots = KNOWN_SCREENSHOTS.get(name, [])

        category = "Android & Kotlin"
        lang = repo.get("language") or "Kotlin"
        topics = repo.get("topics") or []

        if "flutter" in topics or "dart" in topics or lang == "Dart":
            category = "Flutter & Cross-Platform"
        elif lang in ("C++", "HTML"):
            if "flutter" in topics or "namer-app" in topics:
                category = "Flutter & Cross-Platform"
            else:
                category = "Experimental & Web"

        desc = repo.get("description")
        default_desc = "Open source project by Starchild13."

        item = {
            "id": repo.get("id"),
            "name": name,
            "full_name": repo.get("full_name"),
            "html_url": repo.get("html_url"),
            "description": desc if desc else default_desc,
            "language": lang,
            "stars": repo.get("stargazers_count", 0),
            "forks": repo.get("forks_count", 0),
            "topics": topics,
            "updated_at": repo.get("updated_at"),
            "pushed_at": repo.get("pushed_at"),
            "default_branch": repo.get("default_branch", "master"),
            "screenshots": screenshots,
            "category": category,
        }
        enriched.append(item)

    return enriched


def export_portfolio_data(
    data: List[Dict[str, Any]], output_path: str
) -> bool:
    """Save enriched project data into JSON for static consumption.

    Args:
        data: Enriched repository records.
        output_path: Destination JSON file path.

    Returns:
        True if written successfully, False otherwise.
    """
    try:
        with open(output_path, "w", encoding="utf-8") as file_handle:
            json.dump(data, file_handle, indent=2)
        return True
    except IOError as err:
        print(f"Error exporting portfolio data: {err}")
        return False
