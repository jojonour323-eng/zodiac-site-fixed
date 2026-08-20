# Simulate the pair key logic
pairs = [("mars","jupiter"), ("moon","mars"), ("venus","sun"), ("moon","venus"), ("mc","venus")]
for a, b in pairs:
    pair = "-".join(sorted([a, b]))
    print(f"{a} + {b} -> {pair}")
