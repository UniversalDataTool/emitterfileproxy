const { send, json } = require("micro")
const query = require("micro-query")
const { upload, move } = require("micro-upload")
const { setRedisKey, getRedisKey, delRedisKey } = require("../../lib/redis.js")

const SECONDS_TO_CACHE = 60 * 60

const FILE_MAX_WAIT = 20000 // 20s

module.exports = upload(async (req, res) => {
  let { channel, file } = { ...req.query, ...query(req) }

  if (file.includes(".")) {
    file = file.split(".").slice(0, -1).join(".")
  }

  if (req.method === "POST") {
    if (!req.files || !req.files.file) {
      res.send(res, 400)
      return
    }
    await delRedisKey(`${channel}:request:${file}`)
    await setRedisKey([
      `${channel}:bin:${file}`,
      req.files.file.data,
      "EX",
      SECONDS_TO_CACHE,
    ])
    send(res, 200)
  } else {
    // Wait for the redis key to become available...
    let fileData = await getRedisKey(`${channel}:bin:${file}`)

    if (!fileData) {
      await setRedisKey([`${channel}:request:${file}`, true, "EX", 120])
    }

    let startTime = Date.now()
    for (let i = 0; ; i++) {
      fileData = await getRedisKey(`${channel}:bin:${file}`)
      if (fileData) break
      if (Date.now() - startTime > FILE_MAX_WAIT) break
      await new Promise((resolve) => setTimeout(resolve, i ** 1.5 * 50))
    }

    if (!fileData) {
      return send(
        res,
        404,
        "File not found. Maybe you closed your notebook/whatever was hosting the file"
      )
    }

    res.end(fileData)
  }
})
