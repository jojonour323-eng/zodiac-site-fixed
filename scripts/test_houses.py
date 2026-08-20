import json, urllib.request, gzip, time
time.sleep(2)
API_KEY = "da577c200bdc0a52f506804fa99569360f9c68ceba3f3f37c161842855478707"
req = urllib.request.Request("https://api.freeastroapi.com/api/v1/natal/calculate",
    data=json.dumps({"year":1990,"month":5,"day":15,"hour":14,"minute":30,"time_known":True,
        "city":"New York","lat":40.7128,"lng":-74.006,"tz_str":"AUTO",
        "house_system":"placidus","zodiac_type":"tropical"}).encode(),
    headers={"Content-Type":"application/json","x-api-key":API_KEY,"Accept-Encoding":"gzip"}, method="POST")
with urllib.request.urlopen(req, timeout=30) as r:
    raw = gzip.decompress(r.read())
    d = json.loads(raw)
print("--- houses ---")
print(json.dumps(d["houses"], indent=2)[:1200])
print("\n--- angles ---")
print(json.dumps(d["angles"], indent=2)[:800])
print("\n--- aspects_summary ---")
print(json.dumps(d["aspects_summary"], indent=2)[:800])
print("\n--- confidence ---")
print(json.dumps(d["confidence"], indent=2)[:600])
