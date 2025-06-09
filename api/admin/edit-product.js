export default async function handler(req, res) {
  try {
    const { id, name, price } = req.body;
    const firebaseUrl = process.env.FIREBASE_PROJECT_ID + `/products/${id}.json`;
    const response = await fetch(firebaseUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price })
    });
    if (!response.ok) throw new Error('Failed to update product');
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
}