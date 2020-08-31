const { send, json } = require("micro")
const query = require("micro-query")
const {
  setRedisKey,
  getRedisKey,
  delRedisKey,
  getRedisKeys,
} = require("../lib/redis.js")

module.exports = async (req, res) => {
  let { channel } = { ...req.query, ...query(req) }

  let requests = []
  for (let i = 0; i < 100; i++) {
    requests = (await getRedisKeys(`${channel}:request:*`)).map((a) =>
      a.toString()
    )
    if (requests.length !== 0) break
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  send(res, 200, {
    requestedFiles: requests.map((a) => a.split(":")[2]),
  })
}
