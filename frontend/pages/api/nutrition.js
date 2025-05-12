export default async function handler(req, res) {
  const { query } = req.query;

  const response = await fetch(`https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
    headers: {
      'X-Api-Key': 'API KEY FROM NINJA API'
    }
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to fetch data' });
  }

  const data = await response.json();
  res.status(200).json(data);
}
