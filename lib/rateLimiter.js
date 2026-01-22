import redis from "./redis.js";

export async function rateLimit(key, limit = 5, ttl = 300) {
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, ttl);
  }

  return count <= limit;
}
