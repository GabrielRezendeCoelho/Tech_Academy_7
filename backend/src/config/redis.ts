import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({ url: redisUrl });

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

let connected = false;
export async function connectRedis() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
}

export default client;
