import json, urllib.request, gzip, time
time.sleep(3)
API_KEY = "da577c200bdc0a52f506804fa99569360f9c68ceba3f3f37c161842855478707"
BASE = "https://api.freeastroapi.com"
def call(path, body):
    req = urllib.request.Request(BASE+path, data=json.dumps(body).encode(),
        headers={"Content-Type":"application/json","x-api-key":API_KEY,"Accept-Encoding":"gzip"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            raw = r.read()
            try: raw = gzip.decompress(raw)
            except: pass
            return r.status, json.loads(raw.decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:500]

status, data = call("/api/v2/western/synastry", {
    "person_a": {"datetime":"1990-05-15T14:30:00","location":{"city":"New York, USA"},"tz_str":"AUTO"},
    "person_b": {"datetime":"1992-08-20T09:15:00","location":{"city":"Los Angeles, USA"},"tz_str":"AUTO"},
    "settings": {
        "zodiac":"tropical","aspect_set":"extended",
        "bodies":["sun","moon","mercury","venus","mars","jupiter","saturn","asc","mc"],
        "include":{"natal_snapshots":True,"aspects":True,"house_overlays":True,"scores":True,"archetype":True,"text":False}
    }
})
print("status:", status)
if isinstance(data, dict):
    print("top keys:", list(data.keys()))
    # Show structure: scores, archetype
    for k in data.keys():
        v = data[k]
        if isinstance(v, dict):
            print(f"\n--- {k} (dict keys) ---")
            print(list(v.keys())[:30])
            print(json.dumps(v, indent=2)[:1500])
        elif isinstance(v, list):
            print(f"\n--- {k} (list len={len(v)}) ---")
            if v: print(json.dumps(v[0], indent=2)[:800])
        else:
            print(f"\n--- {k} ---"); print(v)
