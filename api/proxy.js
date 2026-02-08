export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Health check / version check
    if (req.method === 'GET') {
        return res.status(200).json({ status: 'Proxy Active', version: '3.1', timestamp: new Date().toISOString() });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { apiKey, model, contents } = req.body;
    const finalKey = apiKey || process.env.GEMINI_API_KEY;

    if (!finalKey) {
        return res.status(400).json({ error: 'No API Key found. Please set GEMINI_API_KEY in Vercel environment variables.' });
    }

    // Attempting v1beta as it is the most feature-rich endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${finalKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();

        // Handle the case where Google returns an error (like 404 for model not found)
        if (!response.ok) {
            console.error('Google API Error:', data);
            return res.status(response.status).json({ 
                error: data.error?.message || 'Google API Error', 
                details: data,
                proxy_version: '3.1'
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Proxy Server Error: ' + error.message, proxy_version: '3.1' });
    }
}
