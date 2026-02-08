const apiKeyInput = document.getElementById('api-key');
const saveKeyBtn = document.getElementById('save-key');
const toggleApiBtn = document.getElementById('toggle-api');
const apiControls = document.getElementById('api-controls');
const promptInput = document.getElementById('prompt-input');
const styleSelect = document.getElementById('style-select');
const generateBtn = document.getElementById('generate-btn');
const loader = document.getElementById('loader');
const resultArea = document.getElementById('result-area');
const outputText = document.getElementById('output-text');
const copyBtn = document.getElementById('copy-btn');

// Toggle API Section
toggleApiBtn.addEventListener('click', () => {
    apiControls.classList.toggle('hidden');
    toggleApiBtn.textContent = apiControls.classList.contains('hidden') ? 'Settings' : 'Close';
});

// Load saved key
const savedKey = localStorage.getItem('gemini_api_key');
if (savedKey) {
    apiKeyInput.value = savedKey;
}

saveKeyBtn.addEventListener('click', () => {
    localStorage.setItem('gemini_api_key', apiKeyInput.value);
    alert('✅ OpenRouter Key Securely Saved!');
});

generateBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value;
    const userInput = promptInput.value;
    const style = styleSelect.value;

    if (!userInput) {
        alert('Prompt ဖန်တီးဖို့အတွက် အကြောင်းအရာ တစ်ခုခု အရင်ရေးပေးပါဗျ။');
        return;
    }

    loader.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        const enhancedPrompt = await callGeminiAPI(apiKey, userInput, style, "google/gemini-pro-1.5");
        outputText.textContent = enhancedPrompt;
        resultArea.classList.remove('hidden');
        resultArea.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error("Full Error:", error);
        alert('❌ Error: ' + error.message);
    } finally {
        loader.classList.add('hidden');
    }
});

async function callGeminiAPI(key, input, style, model) {
    const url = `/api/proxy?v=6`;
    
    const systemInstruction = `You are a world-class Prompt Engineer. Your expertise is in crafting highly effective, detailed, and professional AI prompts.
    Your task: Convert the user's basic request into a superior AI prompt.
    Style: ${style}.
    Constraint: Output ONLY the engineered prompt text. No conversational filler.`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apiKey: key, 
            model: model,
            contents: [{
                parts: [{ text: `${systemInstruction}\n\nUSER INPUT: ${input}` }]
            }]
        })
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message || 'API Communication Error');
    }
    
    return data.candidates[0].content.parts[0].text;
}

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(outputText.textContent);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✨ Copied to Clipboard!';
    setTimeout(() => copyBtn.textContent = originalText, 2000);
});
