export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(200).json({ status: 'OpenRouter Engine Active', version: '7.0' });
    }

    const { apiKey, prompt, style } = req.body;
    const finalKey = apiKey || process.env.GEMINI_API_KEY;

    if (!finalKey) {
        return res.status(400).json({ error: 'OpenRouter API Key is missing.' });
    }

    const systemInstruction = `You are a world-class Prompt Engineer. Your expertise is in crafting highly effective, detailed, and professional AI prompts.
    Your task: Convert the user's basic request into a superior AI prompt.
    Requested Style: ${style}.
    Constraint: Output ONLY the engineered prompt text. No conversational filler or introductory text.`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${finalKey}`,
                'HTTP-Referer': 'https://gemini-prompt-generator-phi.vercel.app',
                'X-Title': 'Premium Prompt Architect'
            },
            body: JSON.stringify({
                model: 'google/gemini-flash-1.5-8b', // Highly stable on OpenRouter
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: `TRANSFORM THIS INPUT INTO A PROFESSIONAL PROMPT: ${prompt}` }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || 'OpenRouter Error' });
        }

        // Return a clean response
        return res.status(200).json({ 
            result: data.choices[0].message.content 
        });

    } catch (error) {
        return res.status(500).json({ error: 'Server Exception: ' + error.message });
    }
}
