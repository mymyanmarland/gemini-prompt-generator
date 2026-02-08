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
        return res.status(200).json({ status: 'Universal Proxy Active', version: '4.0' });
    }

    const { apiKey, model, contents } = req.body;
    const finalKey = apiKey || process.env.GEMINI_API_KEY;

    if (!finalKey) {
        return res.status(400).json({ error: 'No API Key found.' });
    }

    // Check if it's an OpenRouter Key
    if (finalKey.startsWith('sk-or-')) {
        console.log("Routing to OpenRouter...");
        const openRouterModel = model.includes('/') ? model : `google/${model}`;
        
        // Convert Gemini contents to OpenAI messages
        const messages = contents.map(c => ({
            role: c.role === 'model' ? 'assistant' : 'user',
            content: c.parts[0].text
        }));

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${finalKey}`,
                    'HTTP-Referer': 'https://gemini-prompt-generator-phi.vercel.app',
                    'X-Title': 'Gemini Prompt Architect'
                },
                body: JSON.stringify({
                    model: openRouterModel,
                    messages: messages
                })
            });

            const data = await response.json();
            if (!response.ok) return res.status(response.status).json(data);
            
            // Format OpenRouter response back to Gemini style for the frontend
            return res.status(200).json({
                candidates: [{
                    content: {
                        parts: [{ text: data.choices[0].message.content }]
                    }
                }]
            });
        } catch (error) {
            return res.status(500).json({ error: 'OpenRouter Proxy Error: ' + error.message });
        }
    }

    // Default: Google AI Studio Endpoint
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
        return res.status(500).json({ error: 'Google Proxy Error: ' + error.message });
    }
}
