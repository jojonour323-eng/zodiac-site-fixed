import json, urllib.request, gzip, time
time.sleep(3)
API_KEY = "da577c200bdc0a52f506804fa99569360f9c68ceba3f3f37c161842855478707"
req = urllib.request.Request("https://api.freeastroapi.com/api/v2/western/synastry",
    data=json.dumps({
        "person_a": {"datetime":"1990-05-15T14:30:00","location":{"city":"New York, USA"},"tz_str":"AUTO"},
        "person_b": {"datetime":"1992-08-20T09:15:00","location":{"city":"Los Angeles, USA"},"tz_str":"AUTO"},
        "settings": {"zodiac":"tropical","aspect_set":"extended",
            "bodies":["sun","moon","mercury","venus","mars","jupiter","saturn","asc","mc"],
            "include":{"natal_snapshots":True,"aspects":True,"house_overlays":True,"scores":True,"archetype":True,"text":True}}
    }).encode(),
    headers={"Content-Type":"application/json","x-api-key":API_KEY,"Accept-Encoding":"gzip"}, method="POST")
with urllib.request.urlopen(req, timeout=40) as r:
    raw = gzip.decompress(r.read())
    d = json.loads(raw)
syn = d["synastry"]
print("=== scores ===")
print(json.dumps(syn["scores"], indent=2))
print("\n=== archetype ===")
print(json.dumps(syn["archetype"], indent=2)[:2500])
print("\n=== highlights ===")
print(json.dumps(syn["highlights"], indent=2)[:2500])
print("\n=== text ===")
print(json.dumps(syn["text"], indent=2)[:1500] if syn.get("text") else None)
