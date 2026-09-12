export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.ADMIN_PASSCODE) {
    res.status(500).json({ error: 'Server is missing ADMIN_PASSCODE env var' });
    return;
  }

  const { passcode } = req.body || {};
  res.status(200).json({ ok: passcode === process.env.ADMIN_PASSCODE });
}
