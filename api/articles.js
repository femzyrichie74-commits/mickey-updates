import { Redis } from '@upstash/redis';

const STORAGE_KEY = 'mickey-updates-articles';

function getRedis() {
  const url =
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_REST_API_URL ||
    process.env.KV_REST_API_URL;

  const token =
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_REST_API_TOKEN ||
    process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    const err = new Error(
      'Missing Upstash Redis env vars (checked UPSTASH_REDIS_REST_KV_REST_API_URL/TOKEN, UPSTASH_REDIS_REST_URL/TOKEN, UPSTASH_REDIS_REST_API_URL/TOKEN, KV_REST_API_URL/TOKEN).'
    );
    err.code = 'MISSING_ENV';
    throw err;
  }

  return new Redis({ url, token });
}

export default async function handler(req, res) {
  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    res.status(500).json({ error: 'Redis setup failed', debug: String(err && err.message ? err.message : err) });
    return;
  }

  if (req.method === 'GET') {
    try {
      const articles = (await redis.get(STORAGE_KEY)) || [];
      res.status(200).json({ articles });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load articles', debug: String(err && err.message ? err.message : err) });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const { passcode, articles } = req.body || {};

      if (!process.env.ADMIN_PASSCODE) {
        res.status(500).json({ error: 'Server is missing ADMIN_PASSCODE env var' });
        return;
      }

      if (passcode !== process.env.ADMIN_PASSCODE) {
        res.status(401).json({ error: 'Incorrect passcode' });
        return;
      }

      if (!Array.isArray(articles)) {
        res.status(400).json({ error: 'articles must be an array' });
        return;
      }

      await redis.set(STORAGE_KEY, articles);
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save articles', debug: String(err && err.message ? err.message : err) });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
      }
