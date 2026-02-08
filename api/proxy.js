// Vercel Serverless Function as a Proxy
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { apiKey, model, contents } = req.body;

    if (!apiKey) {
        return res.status(400).json({ error: 'API Key is required' });
    }

    // This URL is called from Vercel's servers (usually US/EU), bypassing local blocks
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Proxy Error: ' + error.message });
    }
}
