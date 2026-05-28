import Redis from 'ioredis';

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null, // Required by BullMQ
    });

    redisInstance.on('connect', () => console.log('✅ Redis connected'));
    redisInstance.on('error', (err) => console.error('❌ Redis error:', err.message));
  }
  return redisInstance;
}

// Separate connection for BullMQ (cannot share with commands connection)
export function getBullRedis(): any {
  return new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  }) as any;
}

// Cache helpers
const CACHE_TTL = 60 * 60; // 1 hour

export async function cacheSet(key: string, value: unknown): Promise<void> {
  const redis = getRedis();
  await redis.setex(`vedaai:${key}`, CACHE_TTL, JSON.stringify(value));
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const data = await redis.get(`vedaai:${key}`);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`vedaai:${key}`);
}