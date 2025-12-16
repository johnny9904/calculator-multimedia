let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetDisplay = false;

const canvas = document.getElementById('visualCanvas');
const ctx = canvas.getContext('2d');
let animationFrame = null;
let canvasAnimation = null;

let recognition = null;
let isListening = false;

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        window.speechSynthesis.speak(utterance);
    }
}

function initCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawInitialCanvas();
}

function drawInitialCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Visual Feedback Area', canvas.width / 2, canvas.height / 2);
}

function animateCalculation(result) {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
    const startTime = Date.now();
    const duration = 2000;
    const startY = canvas.height / 2;
    const endY = canvas.height / 2;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const alpha = Math.sin(progress * Math.PI);
        ctx.fillStyle = `rgba(102, 126, 234, ${alpha})`;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`= ${result}`, canvas.width / 2, startY);
        
        drawParticles(progress);
        
        if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                drawInitialCanvas();
            }, 500);
        }
    }
    
    animate();
}

function drawParticles(progress) {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const radius = progress * 40;
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = canvas.height / 2 + Math.sin(angle) * radius;
        
        ctx.fillStyle = `rgba(118, 75, 162, ${1 - progress})`;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animateVoiceListening() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
    let pulseRadius = 0;
    const maxRadius = 30;
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        pulseRadius = (pulseRadius + 2) % maxRadius;
        const alpha = 1 - (pulseRadius / maxRadius);
        
        ctx.strokeStyle = `rgba(255, 107, 107, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎤', canvas.width / 2, canvas.height / 2 + 10);
        
        if (isListening) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            drawInitialCanvas();
        }
    }
    
    animate();
}

function updateDisplay() {
    const display = document.getElementById('display');
    display.textContent = currentInput;
}

function updateExpression() {
    const expression = document.getElementById('expression');
    if (previousInput && operator) {
        expression.textContent = `${previousInput} ${getOperatorSymbol(operator)}`;
    } else {
        expression.textContent = '';
    }
}

function getOperatorSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷',
        '%': '%'
    };
    return symbols[op] || op;
}

function appendNumber(number) {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    
    if (currentInput === '0') {
        currentInput = number;
    } else {
        currentInput += number;
    }
    
    updateDisplay();
}

function appendDecimal() {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    
    if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    
    updateDisplay();
}

function appendOperator(op) {
    if (operator && !shouldResetDisplay) {
        calculate();
    }
    
    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
    updateExpression();
}

function calculate() {
    if (!operator || !previousInput) return;
    
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result;
    
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                result = 'Error';
            } else {
                result = prev / current;
            }
            break;
        case '%':
            result = prev % current;
            break;
        default:
            return;
    }
    
    if (result === 'Error') {
        currentInput = 'Error';
    } else {
        result = Math.round(result * 100000000) / 100000000;
        currentInput = result.toString();
    }
    
    animateCalculation(result);
    
    if (result === 'Error') {
        speakText('Error: Cannot divide by zero');
    } else {
        const expressionText = `${previousInput} ${getOperatorSymbol(operator)} ${current} equals ${result}`;
        speakText(`The answer is ${result}`);
    }
    
    previousInput = '';
    operator = null;
    shouldResetDisplay = true;
    updateDisplay();
    updateExpression();
}

function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
    updateExpression();
    drawInitialCanvas();
}

function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

function initVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Your browser does not support speech recognition. Please use Chrome or Edge.');
        return null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
        isListening = true;
        updateVoiceUI(true);
        animateVoiceListening();
    };
    
    recognition.onresult = (event) => {
        let fullTranscript = '';
        let hasFinal = false;
        
        for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            fullTranscript += transcript + ' ';
            
            if (result.isFinal) {
                hasFinal = true;
            }
        }
        
        fullTranscript = fullTranscript.trim().toLowerCase();
        
        const hasOperator = fullTranscript.includes('plus') || fullTranscript.includes('add') ||
                           fullTranscript.includes('minus') || fullTranscript.includes('subtract') ||
                           fullTranscript.includes('times') || fullTranscript.includes('multiply') ||
                           fullTranscript.includes('divide') || fullTranscript.includes('+') ||
                           fullTranscript.includes('-') || fullTranscript.includes('*') ||
                           fullTranscript.includes('/');
        
        if (fullTranscript && (hasFinal || hasOperator)) {
            processVoiceCommand(fullTranscript);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
            updateVoiceFeedback('No speech detected. Try again.');
        } else if (event.error === 'not-allowed') {
            updateVoiceFeedback('Microphone permission denied.');
            toggleVoiceRecognition();
        }
    };
    
    recognition.onend = () => {
        isListening = false;
        if (document.getElementById('voiceBtn').classList.contains('listening')) {
            setTimeout(() => {
                if (document.getElementById('voiceBtn').classList.contains('listening')) {
                    recognition.start();
                }
            }, 100);
        } else {
            updateVoiceUI(false);
            drawInitialCanvas();
        }
    };
    
    return recognition;
}

function processVoiceCommand(transcript) {
    const lowerTranscript = transcript.toLowerCase().trim();
    updateVoiceFeedback(`Heard: "${lowerTranscript}"`);
    
    if (lowerTranscript.includes('clear')) {
        clearAll();
        return;
    }
    
    const numberMap = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
        'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
        'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
        'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
        'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30,
        'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
        'eighty': 80, 'ninety': 90, 'hundred': 100
    };
    
    function extractNumbers(text) {
        const numbers = [];
        
        const digitMatches = text.match(/\d+/g);
        if (digitMatches) {
            digitMatches.forEach(match => {
                const index = text.indexOf(match);
                numbers.push({ value: parseInt(match), word: match, index: index });
            });
        }
        
        for (const [word, value] of Object.entries(numberMap)) {
            const index = text.indexOf(word);
            if (index !== -1) {
                const alreadyFound = numbers.some(n => n.value === value);
                if (!alreadyFound) {
                    numbers.push({ value: value, word: word, index: index });
                }
            }
        }
        
        const uniqueNumbers = [];
        const seen = new Set();
        for (const num of numbers) {
            if (!seen.has(num.value)) {
                uniqueNumbers.push(num);
                seen.add(num.value);
            }
        }
        
        uniqueNumbers.sort((a, b) => a.index - b.index);
        
        return uniqueNumbers.map(n => n.value);
    }
    
    function extractOperator(text) {
        if (text.includes('plus') || text.includes('add')) return '+';
        if (text.includes('minus') || text.includes('subtract')) return '-';
        if (text.includes('times') || text.includes('multiply') || text.includes('multiplied')) return '*';
        if (text.includes('divide') || text.includes('divided by')) return '/';
        if (text.includes('percent') || text.includes('modulo')) return '%';
        
        if (text.includes('+')) return '+';
        if (text.includes('-') && !text.match(/\d+-\d+/)) return '-';
        if (text.includes('*') || text.includes('×')) return '*';
        if (text.includes('/') || text.includes('÷')) return '/';
        if (text.includes('%')) return '%';
        
        return null;
    }
    
    const isCalculation = lowerTranscript.includes('equals') || 
                         lowerTranscript.includes('calculate') || 
                         lowerTranscript.includes('equal') ||
                         lowerTranscript.includes('what is') ||
                         lowerTranscript.includes('what\'s');
    
    const numbers = extractNumbers(lowerTranscript);
    const extractedOperator = extractOperator(lowerTranscript);
    
    if (numbers.length >= 2 && extractedOperator) {
        clearAll();
        
        previousInput = numbers[0].toString();
        currentInput = previousInput;
        operator = extractedOperator; 
        shouldResetDisplay = false;
        updateDisplay();
        updateExpression();
        
        currentInput = numbers[1].toString();
        updateDisplay();
        

        calculate();
        return;
    }
    
    if (isCalculation && extractedOperator && previousInput && currentInput !== '0') {
        calculate();
        return;
    }
    
    if (isCalculation && extractedOperator && numbers.length === 1) {
        if (previousInput) {
            currentInput = numbers[0].toString();
            updateDisplay();
            calculate();
        }
        return;
    }
    
    if (numbers.length === 1 && !extractedOperator && !isCalculation) {
        if (shouldResetDisplay || currentInput === '0') {
            currentInput = numbers[0].toString();
            shouldResetDisplay = false;
        } else {
            currentInput += numbers[0].toString();
        }
        updateDisplay();
        return;
    }
    
    if (extractedOperator && numbers.length === 0 && !isCalculation) {
        appendOperator(extractedOperator);
        return;
    }
    
    if (isCalculation && extractedOperator && previousInput && numbers.length === 0) {
        calculate();
        return;
    }
    
    if (extractedOperator) {
        appendOperator(extractedOperator);
    } else if (isCalculation) {
        calculate();
    } else if (lowerTranscript.includes('point') || lowerTranscript.includes('decimal')) {
        appendDecimal();
    }
}

function toggleVoiceRecognition() {
    if (!recognition) {
        recognition = initVoiceRecognition();
        if (!recognition) return;
    }
    
    const voiceBtn = document.getElementById('voiceBtn');
    
    if (isListening) {
        recognition.stop();
        voiceBtn.classList.remove('listening');
        voiceBtn.querySelector('#voiceStatus').textContent = 'Start Voice';
        updateVoiceFeedback('Voice recognition stopped');
    } else {
        recognition.start();
        voiceBtn.classList.add('listening');
        voiceBtn.querySelector('#voiceStatus').textContent = 'Stop Voice';
        updateVoiceFeedback('Listening... Speak your command');
    }
}

function updateVoiceUI(listening) {
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceFeedback = document.getElementById('voiceFeedback');
    
    if (listening) {
        voiceBtn.classList.add('listening');
        voiceStatus.textContent = 'Stop Voice';
        voiceFeedback.classList.add('active');
    } else {
        voiceBtn.classList.remove('listening');
        voiceStatus.textContent = 'Start Voice';
        voiceFeedback.classList.remove('active');
    }
}

function updateVoiceFeedback(message) {
    const feedback = document.getElementById('voiceFeedback');
    feedback.textContent = message;
}

window.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    updateDisplay();
    
    window.addEventListener('resize', () => {
        initCanvas();
    });
});

