export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(200).json({ status: 'Prompt Engine Active', version: '3.0' });
    }

    const { apiKey, model, contents } = req.body;
    
    // Master Key from Environment Variables OR User provided key
    const finalKey = apiKey || process.env.GEMINI_API_KEY;

    if (!finalKey) {
        return res.status(400).json({ error: 'No API Key found. Please configure GEMINI_API_KEY in Vercel or provide one in the UI.' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${finalKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Proxy Exception: ' + error.message });
    }
}
