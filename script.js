const apiKeyInput = document.getElementById('api-key');
const saveKeyBtn = document.getElementById('save-key');
const promptInput = document.getElementById('prompt-input');
const modelSelect = document.getElementById('model-select');
const styleSelect = document.getElementById('style-select');
const generateBtn = document.getElementById('generate-btn');
const loader = document.getElementById('loader');
const resultArea = document.getElementById('result-area');
const outputText = document.getElementById('output-text');
const copyBtn = document.getElementById('copy-btn');

// Load saved key
const savedKey = localStorage.getItem('gemini_api_key');
if (savedKey) {
    apiKeyInput.value = savedKey;
}

saveKeyBtn.addEventListener('click', () => {
    localStorage.setItem('gemini_api_key', apiKeyInput.value);
    alert('API Key Saved Successfully!');
});

generateBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value;
    const userInput = promptInput.value;
    const style = styleSelect.value;
    const model = modelSelect.value;

    if (!apiKey) {
        alert('Please enter your Gemini API Key first!');
        return;
    }
    if (!userInput) {
        alert('Please enter what you want to generate a prompt for!');
        return;
    }

    loader.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        const enhancedPrompt = await callGeminiAPI(apiKey, userInput, style, model);
        outputText.textContent = enhancedPrompt;
        resultArea.classList.remove('hidden');
    } catch (error) {
        if (error.message.includes('location')) {
            alert('Location Error: Gemini API က မြန်မာနိုင်ငံမှာ သုံးလို့မရသေးပါဘူး။ VPN ကို USA ဒါမှမဟုတ် Singapore server နဲ့ ပြောင်းချိတ်ပြီး Website ကို Refresh ပြန်လုပ်ပေးပါဗျ။');
        } else {
            alert('Error: ' + error.message + '\n\nအကြံပြုချက်: တခြား Model တစ်ခုကို ရွေးပြီး ထပ်စမ်းကြည့်ပေးပါဗျ။');
        }
    } finally {
        loader.classList.add('hidden');
    }
});

async function callGeminiAPI(key, input, style, model) {
    console.log(`Calling Gemini API with model: ${model}...`);
    
    // Attempting v1 first as it is more standard for newer models
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;
    
    const systemInstruction = `You are a professional Prompt Engineer. Your task is to transform the user's basic idea into a high-quality, professional, and effective prompt for AI models. 
    Style requested: ${style}. 
    Output only the final prompt text without any explanations.`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemInstruction}\n\nUser Idea: ${input}` }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            // If v1 fails with 404, try v1beta as a fallback
            if (data.error.code === 404) {
                console.log("v1 not found, trying v1beta fallback...");
                return await callGeminiAPIv1Beta(key, input, style, model);
            }
            throw new Error(data.error.message);
        }
        
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        if (e.message.includes('v1beta')) throw e; // Don't loop
        return await callGeminiAPIv1Beta(key, input, style, model);
    }
}

async function callGeminiAPIv1Beta(key, input, style, model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const systemInstruction = `You are a professional Prompt Engineer. Your task is to transform the user's basic idea into a high-quality, professional, and effective prompt for AI models. Style requested: ${style}. Output only the final prompt text without any explanations.`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `${systemInstruction}\n\nUser Idea: ${input}` }]
            }]
        })
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message + " (v1beta fallback)");
    }
    return data.candidates[0].content.parts[0].text;
}

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(outputText.textContent);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = originalText, 2000);
});
