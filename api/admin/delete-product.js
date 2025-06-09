export default async function handler(req, res) {
  try {
    const { id } = req.body;
    const firebaseUrl = process.env.FIREBASE_PROJECT_ID + `/products/${id}.json`;
    const response = await fetch(firebaseUrl, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete product');
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
}