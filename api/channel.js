const { send, json } = require("micro")

async function createChannel() {
  const channelName = Math.random().toString(36).slice(-8)
  const key = Math.random().toString(36).slice(-8)
  return { channel: channelName, key }
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
