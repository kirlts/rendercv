import requests

try:
    res = requests.post("http://localhost:8000/api/render", json={
        "yaml": "cv:\n  name: John Doe",
        "design": "faang_software_engineer"
    })
    print("Status code:", res.status_code)
    if res.status_code != 200:
        print("Response:", res.json())
except Exception as e:
    print("Error:", e)
