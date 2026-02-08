// UI Elements
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');
const toneChips = document.querySelectorAll('.tone-chip');
const resultArea = document.getElementById('result-area');
const loader = document.getElementById('loader');
const outputText = document.getElementById('output-text');
const copyBtn = document.getElementById('copy-btn');
const settingsModal = document.getElementById('settings-modal');
const openSettings = document.getElementById('open-settings');
const closeSettings = document.getElementById('close-settings');
const saveSettings = document.getElementById('save-settings');
const apiKeyInput = document.getElementById('api-key-input');

// Tab Logic
tabLinks.forEach(link => {
    link.addEventListener('click', () => {
        const tab = link.dataset.tab;
        tabLinks.forEach(l => l.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        link.classList.add('active');
        document.getElementById(`tab-${tab}`).classList.add('active');
    });
});

// Tone Logic
toneChips.forEach(chip => {
    chip.addEventListener('click', () => {
        toneChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
    });
});

// Settings Logic
openSettings.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));

const savedKey = localStorage.getItem('gemini_api_key');
if (savedKey) apiKeyInput.value = savedKey;

saveSettings.addEventListener('click', () => {
    localStorage.setItem('gemini_api_key', apiKeyInput.value);
    settingsModal.classList.add('hidden');
    alert('Config Saved! 🥧');
});

// Generator Logic
document.getElementById('generate-btn').addEventListener('click', () => {
    const topic = document.getElementById('prompt-input').value;
    const category = document.getElementById('category-select').value;
    const tone = document.querySelector('.tone-chip.active').textContent;
    const context = document.getElementById('context-input').value;
    
    if (!topic) return alert('Enter a topic first!');

    const instruction = `As a World-Class AI Architect, rewrite this basic request into a professional, highly effective AI prompt. 
    Category: ${category}, Tone: ${tone}. 
    Context: ${context || 'None'}. 
    Original Request: ${topic}.
    Output ONLY the engineered prompt, formatted for high performance.`;

    runGeneration(instruction);
});

// Image Logic
document.getElementById('generate-image-btn').addEventListener('click', () => {
    const desc = document.getElementById('image-input').value;
    const style = document.getElementById('image-style').value;
    
    if (!desc) return alert('Describe the image first!');

    const instruction = `Transform this basic image description into a high-quality, detailed descriptive prompt for image generators like Midjourney or Stable Diffusion.
    Style: ${style}.
    Base Description: ${desc}.
    Focus on lighting, framing, composition, and technical details. Output ONLY the resulting prompt.`;

    runGeneration(instruction);
});

// Coding Logic
document.getElementById('generate-code-btn').addEventListener('click', () => {
    const lang = document.getElementById('coding-lang').value;
    const problem = document.getElementById('coding-input').value;
    
    if (!problem) return alert('Describe the coding problem first!');

    const instruction = `Create a professional coding prompt for an LLM that asks for a high-quality implementation of the following problem.
    Language/Framework: ${lang || 'Auto-detect'}.
    Problem: ${problem}.
    The resulting prompt should ask for clean code, best practices, and edge case handling. Output ONLY the prompt text.`;

    runGeneration(instruction);
});

async function runGeneration(instruction) {
    const apiKey = localStorage.getItem('gemini_api_key');
    
    loader.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        const response = await fetch(`/api/proxy?cb=${Date.now()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: apiKey, // Proxy will fallback to master key if this is empty
                model: 'google/gemini-pro-1.5',
                contents: [{ parts: [{ text: instruction }] }]
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        outputText.textContent = data.result || data.candidates[0].content.parts[0].text;
        resultArea.classList.remove('hidden');
        resultArea.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
        alert('Error: ' + e.message);
    } finally {
        loader.classList.add('hidden');
    }
}

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(outputText.textContent);
    const originalText = copyBtn.querySelector('span').textContent;
    copyBtn.querySelector('span').textContent = 'Copied!';
    setTimeout(() => copyBtn.querySelector('span').textContent = originalText, 2000);
});
