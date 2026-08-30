import json, urllib.request, gzip, time
time.sleep(2)
API_KEY = "da577c200bdc0a52f506804fa99569360f9c68ceba3f3f37c161842855478707"
req = urllib.request.Request("https://api.freeastroapi.com/api/v1/natal/calculate",
    data=json.dumps({"year":1990,"month":5,"day":15,"hour":14,"minute":30,"time_known":True,
        "city":"New York, USA","tz_str":"AUTO","house_system":"placidus","zodiac_type":"tropical"}).encode(),
    headers={"Content-Type":"application/json","x-api-key":API_KEY,"Accept-Encoding":"gzip"}, method="POST")
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.loads(gzip.decompress(r.read()))
        print("OK")
        print("city:", d["subject"]["location"]["city"])
        print("lat/lng:", d["subject"]["location"]["lat"], d["subject"]["location"]["lng"])
        print("sun sign:", [p for p in d["planets"] if p["id"]=="sun"][0]["sign_id"])
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read().decode()[:500])
