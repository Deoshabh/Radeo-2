import { createClient } from 'redis';

// Create Redis client using environment variable for Upstash connection
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff for reconnection attempts (max 30 seconds)
      const delay = Math.min(Math.pow(2, retries) * 1000, 30000);
      return delay;
    }
  }
});

// Handle connection events with better error logging and handling
client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err: Error) => {
  console.error('Redis Client Error:', err.message);
  // Log only the error without crashing the application
});

client.on('reconnecting', () => {
  console.log('Redis client attempting to reconnect...');
});

// Connect to Redis with error handling
const connectRedis = async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    console.log('Application will continue with limited caching functionality');
  }
};

// Execute connection with error handling
(async () => {
  try {
    await connectRedis();
  } catch (error) {
    console.error('Redis connection wrapper error:', error);
  }
})();

// Wrap Redis operations with error handling
export const getAsync = async (key: string): Promise<string | null> => {
  try {
    return await client.get(key);
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
};

export const setAsync = async (key: string, value: string, expiresIn?: number): Promise<void> => {
  try {
    if (expiresIn) {
      await client.set(key, value, { EX: expiresIn });
    } else {
      await client.set(key, value);
    }
  } catch (error) {
    console.error(`Redis SET error for key ${key}:`, error);
  }
};

export const delAsync = async (key: string): Promise<void> => {
  try {
    await client.del(key);
  } catch (error) {
    console.error(`Redis DEL error for key ${key}:`, error);
  }
};

export default client; 