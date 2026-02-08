const apiKeyInput = document.getElementById('api-key');
const saveKeyBtn = document.getElementById('save-key');
const promptInput = document.getElementById('prompt-input');
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
        const enhancedPrompt = await callGeminiAPI(apiKey, userInput, style);
        outputText.textContent = enhancedPrompt;
        resultArea.classList.remove('hidden');
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        loader.classList.add('hidden');
    }
});

async function callGeminiAPI(key, input, style) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    
    const systemInstruction = `You are a professional Prompt Engineer. Your task is to transform the user's basic idea into a high-quality, professional, and effective prompt for AI models. 
    Style requested: ${style}. 
    Output only the final prompt text without any explanations.`;

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
        throw new Error(data.error.message);
    }
    return data.candidates[0].content.parts[0].text;
}

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(outputText.textContent);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = originalText, 2000);
});
