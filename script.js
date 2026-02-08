const apiKeyInput = document.getElementById('api-key');
const saveKeyBtn = document.getElementById('save-key');
const toggleApiBtn = document.getElementById('toggle-api');
const apiControls = document.getElementById('api-controls');
const promptInput = document.getElementById('prompt-input');
const modelSelect = document.getElementById('model-select');
const styleSelect = document.getElementById('style-select');
const generateBtn = document.getElementById('generate-btn');
const loader = document.getElementById('loader');
const resultArea = document.getElementById('result-area');
const outputText = document.getElementById('output-text');
const copyBtn = document.getElementById('copy-btn');

// Toggle API Section
toggleApiBtn.addEventListener('click', () => {
    apiControls.classList.toggle('hidden');
});

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
        console.error("Full Error:", error);
        if (error.message.includes('No API Key found')) {
            alert('စနစ်ထဲမှာ Master Key မရှိသေးတဲ့အတွက် သားကြီးရဲ့ ကိုယ်ပိုင် API Key ကို Custom API Settings ထဲမှာ အရင်ထည့်ပေးပါဗျ။');
        } else if (error.message.includes('location')) {
            alert('Location Error: မြန်မာနိုင်ငံ IP ဖြစ်နေတဲ့အတွက် Gemini က ခွင့်မပြုပါဘူး။ VPN ခံသုံးပေးပါဗျ။');
        } else {
            alert('Error Detail: ' + error.message);
        }
    } finally {
        loader.classList.add('hidden');
    }
});

async function callGeminiAPI(key, input, style, model) {
    console.log(`Calling Gemini API via Proxy v3.0...`);
    
    const url = `/api/proxy?cb=${Date.now()}`;
    
    const systemInstruction = `You are a professional Prompt Engineer. Your task is to transform the user's basic idea into a high-quality, professional, and effective prompt for AI models. Style requested: ${style}. Output only the final prompt text without any explanations.`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apiKey: key, // Can be empty if master key exists
            model: model,
            contents: [{
                parts: [{ text: `${systemInstruction}\n\nUser Idea: ${input}` }]
            }]
        })
    });

    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message || 'API Error');
    }
    
    return data.candidates[0].content.parts[0].text;
}

// Removing the fallbackBeta as the proxy handles the primary logic

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(outputText.textContent);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = originalText, 2000);
});
