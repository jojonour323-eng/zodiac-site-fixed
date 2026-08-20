import json, urllib.request, gzip, time
time.sleep(2)
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
    d = json.loads(gzip.decompress(r.read()))
aspects = d["synastry"]["aspects"]
print(f"Total aspects: {len(aspects)}")
from collections import Counter
polarities = Counter(a.get("polarity") for a in aspects)
print("Polarities:", polarities)
print()
print("Top 15 aspects by strength:")
for a in sorted(aspects, key=lambda x: -x["strength"])[:15]:
    print(f"  {a['a_point']:10s} {a['aspect']:15s} {a['b_point']:10s}  str={a['strength']:.2f}  pol={a['polarity']:10s}  asp_angle={a['aspect_angle_deg']}")
