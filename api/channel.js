const { send, json } = require("micro")
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

async function createChannel() {
  console.log("attempting to connect to emitter...")
  const channelName = Math.random().toString(36).slice(-8)
  const { key, channel } = await new Promise((resolve) => {
    client.on("keygen", (k) => {
      console.log("got ", k)
      resolve(k)
    })
    console.log("sending keygen...")
    client.keygen({
      key: process.env.EMITTER_SECRET,
      channel: channelName + "/#/",
      type: "rw",
      ttl: 7 * 24 * 60 * 60,
    })
    console.log("waiting...")
  })
  return { key, channel: channelName }
}

module.exports = async (req, res) => {
  // if (req.method !== "POST") {
  //   send(res, 400, "Bad Method")
  //   return
  // }

  // TODO captcha test

  const { key, channel } = await createChannel()
  send(res, 200, { key, channel })
}
