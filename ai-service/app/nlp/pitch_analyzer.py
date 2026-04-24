"""
Pitch accent lookup — returns mora-level pitch pattern for display.
Uses a small hardcoded dictionary for common words; in production
this would query a full pitch accent database.
"""

PITCH_DB: dict[str, dict] = {
    "たべる":  {"morae": ["た","べ","る"],  "pattern": [0,1,0], "name": "Nakadaka"},
    "みる":    {"morae": ["み","る"],        "pattern": [1,0],   "name": "Heiban"},
    "いく":    {"morae": ["い","く"],        "pattern": [0,1],   "name": "Odaka"},
    "くる":    {"morae": ["く","る"],        "pattern": [1,0],   "name": "Heiban"},
    "する":    {"morae": ["す","る"],        "pattern": [1,0],   "name": "Heiban"},
    "にほんご":{"morae": ["に","ほ","ん","ご"],"pattern": [2,1,1,0],"name":"Nakadaka"},
    "がくせい":{"morae": ["が","く","せ","い"],"pattern": [0,1,1,1],"name":"Heiban"},
    "せんせい":{"morae": ["せ","ん","せ","い"],"pattern": [3,1,1,1],"name":"Nakadaka"},
}


def lookup_pitch(reading: str) -> dict | None:
    """Return pitch accent data for the given hiragana reading, or None."""
    return PITCH_DB.get(reading.lower())


def get_pitch_data(reading: str) -> dict:
    """Always returns a pitch dict (fallback: flat Heiban pattern)."""
    data = lookup_pitch(reading)
    if data:
        return data
    morae = list(reading)
    return {"morae": morae, "pattern": [0] + [1] * (len(morae) - 1), "name": "Heiban"}
