const { send, json } = require("micro")
const query = require("micro-query")
const { Emitter } = require("emitter-io")

if (!process.env.EMITTER_HOST || !process.env.EMITTER_SECRET) {
  throw new Error(
    "Need EMITTER_HOST & EMITTER_SECRET to work. Run with docker. Instructions at emitter.io"
  )
}
const client = require("emitter-io").connect({
  host: process.env.EMITTER_HOST,
  port: parseInt(process.env.EMITTER_PORT) || 8080,
  secure: false,
})

const getKey = async (channelName) => {
  const { key, channel } = await new Promise((resolve) => {
    client.on("keygen", (k) => {
      console.log({ k })
      resolve(k)
    })
    client.keygen({
      key: process.env.EMITTER_SECRET,
      channel: channelName + "/#/",
      type: "rw",
      ttl: 60,
    })
  })
  return { key, channel }
}

module.exports = async (req, res) => {
  let { channel, file } = { ...req.query, ...query(req) }

  // First i have to create a key capable of publishing...
  const { key } = await getKey(channel)

  const listenHash = Math.random().toString(36).slice(-8)

  console.log("publishing on", channel + "/request")
  client.publish({
    key,
    channel: channel + "/request",
    message: [file, listenHash].join(","),
  })

  client.subscribe({ channel: channel + "/" + listenHash, key })

  const data = await new Promise((resolve) => {
    client.on("message", (m) => {
      console.log("got message")
      resolve(m)
    })
  })

  client.disconnect()

  res.end(data.asBinary())
}
