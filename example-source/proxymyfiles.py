from dotenv import load_dotenv
import time

load_dotenv(verbose=True)

import requests
from emitter import Client
import os

access = requests.get("http://localhost:3000/api/channel").json()

print("got access", access)

emitter = Client()

print("connecting...")
emitter.connect(
    host=os.getenv("EMITTER_HOST"), port=int(os.getenv("EMITTER_PORT")), secure=False,
)

print("subscribing...")
print(access["channel"])
print(
    "try requesting", "http://localhost:3000/api/{}/file.txt".format(access["channel"]),
)
emitter.subscribe(access["key"], access["channel"] + "/request")


def respond_with_file(packet):
    print(packet.as_binary())
    packet = packet.as_binary().decode("ascii")
    print(packet)
    file, respondHash = packet.split(",")
    print(""" "{}", "{}" """.format(file, respondHash))
    print("responding to request for", file)
    print(access["channel"] + "/" + respondHash)
    emitter.publish(
        access["key"], access["channel"] + "/" + respondHash, "this is the file",
    )


emitter.on_message = lambda x: respond_with_file(x)


print("starting loop...")
emitter.loop_start()

file_content = requests.get(
    "http://localhost:3000/api/{}/file.txt".format(access["channel"])
).text

print("file_content", file_content)

while True:
    time.sleep(1)
    emitter.loop_start()
