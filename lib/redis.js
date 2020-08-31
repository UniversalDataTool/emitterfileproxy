const { promisify } = require("util")
const Redis = require("redis")
const redis = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
  return_buffers: true,
})

redis.on("error", (error) => {
  console.log("REDIS ERROR:", error)
})

const getRedisKey = promisify(redis.get).bind(redis)
const setRedisKey = promisify(redis.set).bind(redis)
const delRedisKey = promisify(redis.del).bind(redis)
const getRedisKeys = promisify(redis.keys).bind(redis)

module.exports = { getRedisKey, setRedisKey, delRedisKey, getRedisKeys }
