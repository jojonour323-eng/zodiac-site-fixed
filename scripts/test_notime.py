import json, urllib.request, gzip, time
time.sleep(2)
API_KEY = "da577c200bdc0a52f506804fa99569360f9c68ceba3f3f37c161842855478707"
req = urllib.request.Request("https://api.freeastroapi.com/api/v1/natal/calculate",
    data=json.dumps({"year":1990,"month":5,"day":15,"hour":12,"minute":0,"time_known":False,
        "city":"New York, USA","tz_str":"AUTO","house_system":"placidus","zodiac_type":"tropical"}).encode(),
    headers={"Content-Type":"application/json","x-api-key":API_KEY,"Accept-Encoding":"gzip"}, method="POST")
with urllib.request.urlopen(req, timeout=30) as r:
    d = json.loads(gzip.decompress(r.read()))
print("top keys:", list(d.keys()))
print("has houses:", "houses" in d, "is list:", isinstance(d.get("houses"), list), "len:", len(d.get("houses",[])) if isinstance(d.get("houses"), list) else None)
print("has angles:", "angles" in d, "val:", d.get("angles"))
print("has planets:", "planets" in d, "len:", len(d.get("planets",[])))
print("confidence:", d.get("confidence"))
