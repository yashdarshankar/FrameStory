import requests
try:
    response = requests.post("http://localhost:8000/register", data={"username": "tester123", "password": "password"})
    print("Status:", response.status_code)
    print("Output:", response.text)
except Exception as e:
    print(e)
