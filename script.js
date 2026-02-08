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

toggleApiBtn.addEventListener('click', () => {
    apiControls.classList.toggle('hidden');
    toggleApiBtn.textContent = apiControls.classList.contains('hidden') ? 'Settings' : 'Close';
});

const savedKey = localStorage.getItem('gemini_api_key');
if (savedKey) { apiKeyInput.value = savedKey; }

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
        const response = await fetch(`/api/proxy?v=7`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey, prompt: userInput, style })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        outputText.textContent = data.result;
        resultArea.classList.remove('hidden');
        resultArea.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('❌ Error: ' + error.message);
    } finally {
        loader.classList.add('hidden');
    }
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(outputText.textContent);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✨ Copied to Clipboard!';
    setTimeout(() => copyBtn.textContent = originalText, 2000);
});
