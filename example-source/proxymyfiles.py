from dotenv import load_dotenv
import time

load_dotenv(verbose=True)

import requests
import os

import threading

# server_url = "http://localhost:3000"
server_url = "https://emitterfileproxy.universaldatatool.com"

access = requests.get(server_url + "/api/channel").json()

got_file_time = 0


def thread_func():
    global got_file_time
    while True:
        res = requests.get(server_url + "/api/{}".format(access["channel"])).json()
        for filename in res["requestedFiles"]:
            got_file_time = time.time()
            requests.post(
                server_url + "/api/{}/{}".format(access["channel"], filename),
                files={"file": open("./bird.jpg", "rb")},
            )
        time.sleep(0.1)


x = threading.Thread(target=thread_func, daemon=True)
x.start()

time.sleep(0.5)
start = time.time()
file_content = requests.get(
    server_url + "/api/{}/bird.jpg".format(access["channel"])
).content
end = time.time()

print("request time (s):", end - start)
print("time to ack (s):", got_file_time - start)

if len(file_content) < 100:
    print(file_content)

print("len(file_content)", len(file_content))

print("END")
