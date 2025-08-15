// Wait for the entire HTML document to be loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    // Get references to all the HTML elements we need to interact with.
    const yourNameInput = document.getElementById('yourName');
    const theirNameInput = document.getElementById('theirName');
    const chatFileInput = document.getElementById('chatFile');
    const fileNameDisplay = document.getElementById('file-name-display');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const inputSection = document.getElementById('input-section');
    const resultsSection = document.getElementById('results-section');
    const errorBox = document.getElementById('error-box');
    const errorMessage = document.getElementById('error-message');

    // --- CONFIGURATION AND DATA ---
    // Constants for the calculation algorithm.
    const WEIGHTS = { sentiment: 0.15, keywords: 0.25, initiation: 0.15, questions: 0.20, velocity: 0.10, effort: 0.15 };
    const SENTIMENT_WORDS = { "love": 2, "amazing": 2, "great": 1.5, "beautiful": 1.5, "cute": 1.5, "happy": 1, "fun": 1, "good": 0.5, "nice": 0.5, "thanks": 1, "bad": -0.5, "sad": -1, "hate": -2, "terrible": -2, "shit": -1.5 };
    const ROMANTIC_KEYWORDS = ["cute", "beautiful", "handsome", "gorgeous", "miss you", "thinking of you", "❤️", "😍", "😘", "🥰", "😉"];

    // Variable to store the content of the uploaded file.
    let fileContent = '';

    // --- EVENT LISTENERS ---
    // Attach functions to be called when specific events happen.
    chatFileInput.addEventListener('change', handleFileSelect);
    calculateBtn.addEventListener('click', runAnalysis);
    resetBtn.addEventListener('click', resetUI);

    // --- CORE LOGIC ---

    /**
     * Handles the file selection, reading .txt or unzipping .zip files.
     */
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Update the UI to show the selected file's name.
        fileNameDisplay.textContent = file.name;
        fileNameDisplay.classList.remove('text-gray-600');
        fileNameDisplay.classList.add('text-rose-600', 'font-semibold');

        // If it's a ZIP file, use the JSZip library to find and read the .txt file inside.
        if (file.name.endsWith('.zip')) {
            JSZip.loadAsync(file).then(zip => {
                const txtFile = Object.keys(zip.files).find(name => name.endsWith('.txt') && !name.startsWith('__MACOSX'));
                if (txtFile) {
                    return zip.file(txtFile).async('string');
                }
                throw new Error('No .txt file found in the zip archive.');
            }).then(content => {
                fileContent = content;
            }).catch(err => {
                showError(err.message);
                fileContent = '';
            });
        } else { // If it's a .txt file, read it directly.
            const reader = new FileReader();
            reader.onload = (e) => {
                fileContent = e.target.result;
            };
            reader.readAsText(file);
        }
    }
    
    /**
     * Main function to trigger the analysis process after validation.
     */
    function runAnalysis() {
        const yourName = yourNameInput.value.trim();
        const theirName = theirNameInput.value.trim();

        // Validate that all inputs are provided.
        if (!yourName || !theirName || !fileContent) {
            showError("Please fill in both names and upload a chat file.");
            return;
        }

        try {
            const chatHistory = parseChatFile(fileContent);
            if (!chatHistory || chatHistory.length < 5) {
                 showError("Could not parse the chat file or the chat is too short to analyze.");
                 return;
            }
            
            const results = calculateRis(chatHistory, yourName, theirName);
            if(results) {
                displayResults(results);
            }
        } catch (e) {
            showError(`An error occurred during analysis: ${e.message}`);
        }
    }

    /**
     * Parses a WhatsApp-style chat string into a structured array of message objects.
     * @param {string} content The raw text content of the chat file.
     * @returns {Array|null} An array of message objects or null on failure.
     */
    function parseChatFile(content) {
        const chatHistory = [];
        const lines = content.split('\n');
        // This regex is designed to match the specific format of WhatsApp chat exports.
        const lineRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}(?:\s?[AP]M)?) - ([^:]+): (.*)/;

        for (const line of lines) {
            const match = line.match(lineRegex);
            if (match) {
                const [_, timestampStr, sender, text] = match;
                if (text.trim() === "<Media omitted>") continue; // Skip media messages

                // A robust way to parse different date/time formats into a valid Date object.
                const parts = timestampStr.replace(',', '').split(' ');
                const dateParts = parts[0].split('/');
                const timeParts = parts[1].split(':');
                const isPM = parts[2] && parts[2].toUpperCase() === 'PM';
                
                let month = parseInt(dateParts[0], 10) - 1;
                let day = parseInt(dateParts[1], 10);
                let year = parseInt(dateParts[2], 10);
                if (year < 100) year += 2000; // Handle yy vs yyyy

                let hour = parseInt(timeParts[0], 10);
                if (isPM && hour < 12) hour += 12;
                if (!isPM && hour === 12) hour = 0; // Handle 12 AM
                
                const minute = parseInt(timeParts[1], 10);
                const timestamp = new Date(year, month, day, hour, minute);

                if (!isNaN(timestamp)) { // Ensure the date is valid
                    chatHistory.push({ sender: sender.trim(), text: text.trim(), timestamp });
                }
            }
        }
        return chatHistory;
    }

    /**
     * The main calculation engine.
     * @returns {Object|null} An object containing all calculated scores.
     */
    function calculateRis(chatHistory, yourName, theirName) {
        const yourMessages = chatHistory.filter(m => m.sender === yourName);
        const theirMessages = chatHistory.filter(m => m.sender === theirName);

        if (theirMessages.length === 0 || yourMessages.length === 0) {
            showError(`Could not find messages from "${theirName}" or "${yourName}". Check if the names match the chat file exactly.`);
            return null;
        }

        // Calculate each metric by calling its dedicated helper function.
        const results = {
            sentimentScore: calculateSentiment(theirMessages),
            keywordsScore: calculateKeywords(theirMessages), // FIX: Changed from keywordScore
            initiationScore: calculateInitiation(chatHistory, yourName, theirName),
            questionsScore: calculateQuestions(theirMessages), // FIX: Changed from questionScore
            velocityScore: calculateVelocity(chatHistory, yourName, theirName),
            effortScore: calculateEffort(yourMessages, theirMessages)
        };

        // Calculate the final weighted score.
        results.finalRis = Object.keys(WEIGHTS).reduce((acc, key) => {
            const scoreKey = key + 'Score';
            const score = results[scoreKey];
            const weight = WEIGHTS[key];
            return acc + (score * weight);
        }, 0);

        return results;
    }
    
    // --- Helper functions for each metric ---
    const preprocessText = (text) => text.toLowerCase().replace(/[^\w\s❤️😍😘🥰😉]/g, '');

    function calculateSentiment(messages) {
        let totalSentiment = 0, wordCount = 0;
        messages.forEach(msg => {
            const words = preprocessText(msg.text).split(/\s+/);
            words.forEach(word => {
                totalSentiment += SENTIMENT_WORDS[word] || 0;
                wordCount++;
            });
        });
        const avgSentiment = wordCount > 0 ? totalSentiment / wordCount : 0;
        return (avgSentiment + 2) / 4; // Normalize to 0-1
    }

    function calculateKeywords(messages) {
        let keywordCount = 0;
        messages.forEach(msg => {
            const cleanedText = preprocessText(msg.text);
            ROMANTIC_KEYWORDS.forEach(kw => {
                keywordCount += (cleanedText.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g")) || []).length;
            });
        });
        return Math.min(1.0, (keywordCount / messages.length) * 5);
    }

    function calculateInitiation(chatHistory, yourName, theirName) {
        let yourInitiations = 0, theirInitiations = 0;
        const conversationBreak = 60 * 60 * 1000; // 1 hour in ms
        for (let i = 0; i < chatHistory.length; i++) {
            if (i === 0 || (chatHistory[i].timestamp - chatHistory[i-1].timestamp) > conversationBreak) {
                if (chatHistory[i].sender === yourName) yourInitiations++;
                else if (chatHistory[i].sender === theirName) theirInitiations++;
            }
        }
        const total = yourInitiations + theirInitiations;
        return total > 0 ? theirInitiations / total : 0.5;
    }

    function calculateQuestions(messages) {
        const questionCount = messages.filter(m => m.text.includes('?')).length;
        return Math.min(1.0, (questionCount / messages.length) * 3);
    }
    
    function calculateVelocity(chatHistory, yourName, theirName) {
        const responseTimes = [];
        for (let i = 1; i < chatHistory.length; i++) {
            if (chatHistory[i].sender === theirName && chatHistory[i-1].sender === yourName) {
                responseTimes.push((chatHistory[i].timestamp - chatHistory[i-1].timestamp) / 1000);
            }
        }
        if (responseTimes.length === 0) return 0.5;
        const avgSeconds = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const avgMinutes = avgSeconds / 60;
        return Math.max(0, 1 - (avgMinutes / 180));
    }

    function calculateEffort(yourMessages, theirMessages) {
        const yourAvgLen = yourMessages.reduce((sum, m) => sum + m.text.length, 0) / yourMessages.length;
        const theirAvgLen = theirMessages.reduce((sum, m) => sum + m.text.length, 0) / theirMessages.length;
        if (yourAvgLen === 0 || theirAvgLen === 0) return 0;
        return 1 - Math.abs(1 - (theirAvgLen / yourAvgLen));
    }

    // --- UI UPDATE FUNCTIONS ---
    
    /**
     * Displays the final results on the page.
     */
    function displayResults(results) {
        inputSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');

        const finalScorePercent = Math.round(results.finalRis * 100);
        document.getElementById('ris-score').textContent = `${finalScorePercent}%`;
        
        // Animate the gauge by setting the CSS variable.
        document.querySelector('.gauge-cover').style.setProperty('--progress', finalScorePercent);

        // Set interpretation text based on the final score.
        let interpretationText = "Low probability of romantic interest. 🤷";
        if (finalScorePercent > 70) {
            interpretationText = "High probability of romantic interest. 💚";
        } else if (finalScorePercent > 50) {
            interpretationText = "Moderate probability of romantic interest. 🤔";
        }
        document.getElementById('interpretation').textContent = interpretationText;

        // Create and display the progress bars for detailed scores.
        const createMetricHTML = (label, score) => `
            <div>
                <p class="text-sm text-gray-600">${label}</p>
                <div class="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div class="bg-rose-400 h-2.5 rounded-full" style="width: ${Math.round(score * 100)}%"></div>
                </div>
            </div>`;
        
        document.getElementById('sentiment-score').innerHTML = createMetricHTML('Sentiment', results.sentimentScore);
        document.getElementById('keyword-score').innerHTML = createMetricHTML('Keywords', results.keywordsScore); // FIX: Changed from keywordScore
        document.getElementById('initiation-score').innerHTML = createMetricHTML('Initiation', results.initiationScore);
        document.getElementById('question-score').innerHTML = createMetricHTML('Questions', results.questionsScore); // FIX: Changed from questionScore
        document.getElementById('velocity-score').innerHTML = createMetricHTML('Response Speed', results.velocityScore);
        document.getElementById('effort-score').innerHTML = createMetricHTML('Effort Balance', results.effortScore);
    }
    
    /**
     * Resets the UI to its initial state for a new analysis.
     */
    function resetUI() {
        resultsSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        yourNameInput.value = '';
        theirNameInput.value = '';
        chatFileInput.value = '';
        fileContent = '';
        fileNameDisplay.textContent = 'Click to select a file';
        fileNameDisplay.classList.remove('text-rose-600', 'font-semibold');
        fileNameDisplay.classList.add('text-gray-600');
        document.querySelector('.gauge-cover').style.setProperty('--progress', 0);
    }

    /**
     * Shows a temporary error message to the user.
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorBox.classList.remove('hidden');
        setTimeout(() => {
            errorBox.classList.add('hidden');
        }, 4000);
    }
});
