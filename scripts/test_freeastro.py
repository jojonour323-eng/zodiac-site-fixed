import json, urllib.request, os

API_KEY = "da577c200bdc0a52f506804fa99569360f9c68ceba3f3f37c161842855478707"
BASE = "https://api.freeastroapi.com"

def call(path, body):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-api-key": API_KEY, "Accept-Encoding": "gzip"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            import gzip
            try:
                raw = gzip.decompress(raw)
            except Exception:
                pass
            return r.status, json.loads(raw.decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:800]
    except Exception as e:
        return -1, str(e)

# Test 1: natal chart
print("=== natal/calculate ===")
status, data = call("/api/v1/natal/calculate", {
    "year": 1990, "month": 5, "day": 15, "hour": 14, "minute": 30,
    "time_known": True, "city": "New York", "lat": 40.7128, "lng": -74.006,
    "tz_str": "AUTO", "house_system": "placidus", "zodiac_type": "tropical"
})
print("status:", status)
if isinstance(data, dict):
    print("top keys:", list(data.keys()))
    print(json.dumps(data, indent=2)[:3500])
else:
    print(data)

# Test 2: synastry
print("\n=== synastry ===")
status, data = call("/api/v2/western/synastry", {
    "person_a": {"datetime": "1990-05-15T14:30:00", "location": {"city": "New York, USA"}, "tz_str": "AUTO"},
    "person_b": {"datetime": "1992-08-20T09:15:00", "location": {"city": "Los Angeles, USA"}, "tz_str": "AUTO"},
    "settings": {
        "zodiac": "tropical",
        "aspect_set": "extended",
        "bodies": ["sun","moon","mercury","venus","mars","jupiter","saturn","asc","mc"],
        "include": {"natal_snapshots": True, "aspects": True, "house_overlays": True, "scores": True, "archetype": True, "text": False}
    }
})
print("status:", status)
if isinstance(data, dict):
    print("top keys:", list(data.keys()))
    print(json.dumps(data, indent=2)[:3500])
else:
    print(data)
