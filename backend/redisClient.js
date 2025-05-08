import redis from "redis";

let redisClient;

async function getRedisClient() {
    if (!redisClient) {
        redisClient = redis.createClient();
        redisClient.on('error', (err) => console.error('Redis Client Error:', err));
        await redisClient.connect();
    }
    return redisClient;
}

export default getRedisClient;