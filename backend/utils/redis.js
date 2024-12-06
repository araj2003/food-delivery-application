const redis = require('redis')

const redisClient = redis.createClient({
    url: "redis://127.0.0.1:6379", // Update with your Redis URL if hosted
});

redisClient.connect().catch(console.error);

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

module.exports = redisClient;