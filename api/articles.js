import { Redis } from '@upstash/redis';

const redisUrl =
  process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.UPSTASH_REDIS_REST_API_URL ||
  process.env.KV_REST_API_URL;

const redisToken =
  process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.UPSTASH_REDIS_REST_API_TOKEN ||
  process.env.KV_REST_API_TOKEN;

const redis = new Redis({ url: redisUrl, token: redisToken });
const STORAGE_KEY = 'mickey-updates-articles';

export default async function handler(req, res) {
  if (!redisUrl || !redisToken) {
    res.status(500).json({
      error: 'Missing Upstash Redis env vars. Check the exact variable names in Vercel → Settings → Environment Variables and compare to api/articles.js.'
    });
    return;
  }

  if (req.method === 'GET') {
    try {
      const articles = (await redis.get(STORAGE_KEY)) || [];
      res.status(200).json({ articles });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load articles' });
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
      res.status(500).json({ error: 'Failed to save articles' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
  }
