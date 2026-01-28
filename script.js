// Состояние калькулятора
const CalculatorState = {
    currentValue: '0',
    expression: '',
    memory: 0,
    history: [],
    lastOperation: null,
    shouldResetDisplay: false,
    isDarkTheme: false
};

// Элементы DOM
const elements = {
    result: document.getElementById('result'),
    expression: document.getElementById('expression'),
    historyList: document.getElementById('history-list'),
    historyPanel: document.getElementById('history-panel'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.querySelector('#theme-toggle i'),
    themeText: document.querySelector('#theme-toggle span')
};

// Инициализация
function initCalculator() {
    // Загружаем сохраненные данные
    loadSavedData();
    
    // Настраиваем тему
    setupTheme();
    
    // Инициализируем кнопки
    setupButtons();
    
    // Настраиваем клавиатуру
    setupKeyboard();
    
    // Обновляем дисплей
    updateDisplay();
    
    // Показываем подсказку
    showHint('Калькулятор готов к работе!');
}

// Загрузка сохраненных данных
function loadSavedData() {
    const savedTheme = localStorage.getItem('calculator-theme');
    const savedHistory = localStorage.getItem('calculator-history');
    
    if (savedTheme === 'dark') {
        CalculatorState.isDarkTheme = true;
    }
    
    if (savedHistory) {
        CalculatorState.history = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

// Настройка темы
function setupTheme() {
    if (CalculatorState.isDarkTheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
        elements.themeIcon.className = 'fas fa-sun';
        elements.themeText.textContent = 'Светлая';
    }
    
    elements.themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    CalculatorState.isDarkTheme = !CalculatorState.isDarkTheme;
    
    if (CalculatorState.isDarkTheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
        elements.themeIcon.className = 'fas fa-sun';
        elements.themeText.textContent = 'Светлая';
        showHint('Переключено на тёмную тему');
    } else {
        document.documentElement.removeAttribute('data-theme');
        elements.themeIcon.className = 'fas fa-moon';
        elements.themeText.textContent = 'Тёмная';
        showHint('Переключено на светлую тему');
    }
    
    localStorage.setItem('calculator-theme', CalculatorState.isDarkTheme ? 'dark' : 'light');
    
    // Анимация переключения темы
    document.body.style.transition = 'background 0.5s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 500);
}

// Настройка кнопок
function setupButtons() {
    // Цифры
    document.querySelectorAll('.key.num').forEach(button => {
        button.addEventListener('click', () => {
            const number = button.getAttribute('data-num');
            inputNumber(number);
            createClickEffect(event);
        });
    });
    
    // Операции
    document.querySelectorAll('.key.op').forEach(button => {
        button.addEventListener('click', () => {
            const operation = button.getAttribute('data-op');
            inputOperation(operation);
            createClickEffect(event);
            updateOperationIndicator(operation);
        });
    });
    
    // Десятичная точка
    document.querySelector('[data-action="decimal"]').addEventListener('click', (e) => {
        inputDecimal();
        createClickEffect(e);
    });
    
    // Равно
    document.querySelector('[data-action="calculate"]').addEventListener('click', (e) => {
        calculate();
        createClickEffect(e);
        
        // Анимация кнопки "="
        const equalsBtn = e.currentTarget;
        equalsBtn.style.animation = 'glow 0.5s ease';
        setTimeout(() => {
            equalsBtn.style.animation = '';
        }, 500);
    });
    
    // Специальные функции
    document.querySelectorAll('.func-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = button.getAttribute('data-action');
            handleSpecialFunction(action);
            createClickEffect(e);
        });
    });
    
    // История
    document.getElementById('show-history').addEventListener('click', () => {
        elements.historyPanel.classList.add('active');
    });
    
    document.getElementById('close-history').addEventListener('click', () => {
        elements.historyPanel.classList.remove('active');
    });
    
    document.getElementById('clear-history').addEventListener('click', () => {
        CalculatorState.history = [];
        updateHistoryDisplay();
        localStorage.removeItem('calculator-history');
        showHint('История очищена');
    });
    
    // Индикаторы операций
    document.querySelectorAll('.op-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const operation = tag.getAttribute('data-op');
            inputOperation(operation);
            updateOperationIndicator(operation);
        });
    });
}

// Обновление индикатора операций
function updateOperationIndicator(operation) {
    document.querySelectorAll('.op-tag').forEach(tag => {
        tag.classList.remove('active');
        if (tag.getAttribute('data-op') === operation) {
            tag.classList.add('active');
        }
    });
}

// Настройка клавиатуры
function setupKeyboard() {
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        
        // Цифры
        if (/^[0-9]$/.test(key)) {
            inputNumber(key);
            animatePressedKey(key);
        }
        
        // Операции
        else if (['+', '-', '*', '/', '%', '(', ')'].includes(key)) {
            let operation = key;
            if (key === '*') operation = '×';
            if (key === '/') operation = '÷';
            inputOperation(operation);
            updateOperationIndicator(operation);
            animatePressedKey(operation);
        }
        
        // Десятичная точка
        else if (key === '.' || key === ',') {
            inputDecimal();
            animatePressedKey('.');
        }
        
        // Равно и Enter
        else if (key === '=' || key === 'Enter') {
            event.preventDefault();
            calculate();
            animatePressedKey('=');
        }
        
        // Очистка (Escape)
        else if (key === 'Escape') {
            handleSpecialFunction('clear');
        }
        
        // Удаление (Backspace)
        else if (key === 'Backspace') {
            backspace();
        }
    });
}

// Анимация нажатия клавиши
function animatePressedKey(key) {
    let button;
    
    if (/^[0-9]$/.test(key)) {
        button = document.querySelector(`.key.num[data-num="${key}"]`);
    } else if (['+', '-', '×', '÷', '%', '(', ')'].includes(key)) {
        button = document.querySelector(`.key.op[data-op="${key}"]`);
    } else if (key === '.') {
        button = document.querySelector('[data-action="decimal"]');
    } else if (key === '=') {
        button = document.querySelector('[data-action="calculate"]');
    }
    
    if (button) {
        button.style.transform = 'translateY(-2px) scale(0.95)';
        button.style.transition = 'transform 0.1s';
        
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }
}

// Ввод числа
function inputNumber(number) {
    if (CalculatorState.shouldResetDisplay) {
        CalculatorState.currentValue = '';
        CalculatorState.shouldResetDisplay = false;
    }
    
    if (CalculatorState.currentValue === '0') {
        CalculatorState.currentValue = number;
    } else {
        CalculatorState.currentValue += number;
    }
    
    updateDisplay();
}

// Ввод операции
function inputOperation(operation) {
    if (CalculatorState.currentValue === 'Ошибка') {
        CalculatorState.currentValue = '0';
    }
    
    if (CalculatorState.shouldResetDisplay && CalculatorState.lastOperation) {
        CalculatorState.expression = CalculatorState.currentValue + ' ' + operation + ' ';
    } else {
        CalculatorState.expression += CalculatorState.currentValue + ' ' + operation + ' ';
    }
    
    CalculatorState.shouldResetDisplay = true;
    CalculatorState.lastOperation = operation;
    updateDisplay();
}

// Ввод десятичной точки
function inputDecimal() {
    if (CalculatorState.shouldResetDisplay) {
        CalculatorState.currentValue = '0.';
        CalculatorState.shouldResetDisplay = false;
    } else if (!CalculatorState.currentValue.includes('.')) {
        CalculatorState.currentValue += '.';
    }
    
    updateDisplay();
}

// Вычисление
function calculate() {
    if (!CalculatorState.expression && !CalculatorState.lastOperation) return;
    
    try {
        let expression = CalculatorState.expression + CalculatorState.currentValue;
        
        // Заменяем символы для вычисления
        expression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/,/g, '.')
            .replace(/[^-()\d/*+.]/g, '');
        
        // Безопасное вычисление
        const result = Function('"use strict"; return (' + expression + ')')();
        
        // Форматируем результат
        let formattedResult;
        if (Number.isInteger(result)) {
            formattedResult = result.toString();
        } else {
            formattedResult = parseFloat(result.toFixed(10)).toString();
            
            // Удаляем лишние нули
            formattedResult = formattedResult.replace(/(\.\d*?)0+$/, '$1');
            if (formattedResult.endsWith('.')) {
                formattedResult = formattedResult.slice(0, -1);
            }
        }
        
        // Сохраняем в историю
        const historyEntry = {
            expression: CalculatorState.expression + CalculatorState.currentValue,
            result: formattedResult,
            timestamp: new Date().toLocaleTimeString()
        };
        
        CalculatorState.history.unshift(historyEntry);
        if (CalculatorState.history.length > 10) {
            CalculatorState.history.pop();
        }
        
        // Обновляем состояние
        CalculatorState.currentValue = formattedResult;
        CalculatorState.expression = '';
        CalculatorState.lastOperation = null;
        CalculatorState.shouldResetDisplay = true;
        
        // Обновляем отображение
        updateDisplay();
        updateHistoryDisplay();
        
        // Сохраняем историю
        localStorage.setItem('calculator-history', JSON.stringify(CalculatorState.history));
        
        // Показываем результат с анимацией
        showResultAnimation(formattedResult);
        
    } catch (error) {
        CalculatorState.currentValue = 'Ошибка';
        CalculatorState.expression = '';
        CalculatorState.shouldResetDisplay = true;
        updateDisplay();
        showHint('Некорректное выражение');
    }
}

// Специальные функции
function handleSpecialFunction(action) {
    switch (action) {
        case 'clear':
            CalculatorState.currentValue = '0';
            CalculatorState.expression = '';
            CalculatorState.lastOperation = null;
            showHint('Дисплей очищен');
            break;
            
        case 'mc':
            CalculatorState.memory = 0;
            showHint('Память очищена');
            break;
            
        case 'mr':
            CalculatorState.currentValue = CalculatorState.memory.toString();
            CalculatorState.shouldResetDisplay = true;
            showHint('Извлечено из памяти: ' + CalculatorState.memory);
            break;
            
        case 'm-plus':
            CalculatorState.memory += parseFloat(CalculatorState.currentValue) || 0;
            showHint('Добавлено в память: ' + CalculatorState.currentValue);
            break;
            
        case 'm-minus':
            CalculatorState.memory -= parseFloat(CalculatorState.currentValue) || 0;
            showHint('Вычтено из памяти: ' + CalculatorState.currentValue);
            break;
    }
    
    updateDisplay();
}

// Удаление последнего символа
function backspace() {
    if (CalculatorState.currentValue.length > 1) {
        CalculatorState.currentValue = CalculatorState.currentValue.slice(0, -1);
    } else {
        CalculatorState.currentValue = '0';
    }
    updateDisplay();
}

// Обновление дисплея
function updateDisplay() {
    elements.result.textContent = CalculatorState.currentValue;
    elements.expression.textContent = CalculatorState.expression;
    
    // Анимация обновления
    elements.result.style.transform = 'scale(1.05)';
    elements.result.style.opacity = '0.8';
    
    setTimeout(() => {
        elements.result.style.transform = 'scale(1)';
        elements.result.style.opacity = '1';
    }, 100);
}

// Обновление истории
function updateHistoryDisplay() {
    elements.historyList.innerHTML = '';
    
    CalculatorState.history.forEach((entry, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.style.animationDelay = `${index * 0.1}s`;
        
        historyItem.innerHTML = `
            <div class="history-expression">${entry.expression}</div>
            <div class="history-result">= ${entry.result}</div>
            <div class="history-time">${entry.timestamp}</div>
        `;
        
        historyItem.addEventListener('click', () => {
            CalculatorState.currentValue = entry.result;
            CalculatorState.expression = entry.expression.split('=')[0];
            CalculatorState.shouldResetDisplay = true;
            updateDisplay();
            elements.historyPanel.classList.remove('active');
            showHint('Выражение восстановлено из истории');
        });
        
        elements.historyList.appendChild(historyItem);
    });
}

// Анимация результата
function showResultAnimation(result) {
    const resultElement = elements.result;
    
    // Анимация увеличения
    resultElement.style.transform = 'scale(1.2)';
    resultElement.style.color = 'var(--success)';
    
    setTimeout(() => {
        resultElement.style.transform = 'scale(1)';
        resultElement.style.color = '';
    }, 300);
    
    // Показываем подсказку
    showHint('Результат: ' + result);
}

// Создание эффекта клика
function createClickEffect(event) {
    const effect = document.getElementById('click-effect');
    
    effect.style.left = `${event.clientX}px`;
    effect.style.top = `${event.clientY}px`;
    effect.style.opacity = '1';
    effect.style.transform = 'translate(-50%, -50%) scale(1)';
    effect.style.background = 'radial-gradient(circle, rgba(67, 97, 238, 0.3) 0%, transparent 70%)';
    
    setTimeout(() => {
        effect.style.opacity = '0';
        effect.style.transform = 'translate(-50%, -50%) scale(3)';
    }, 10);
    
    setTimeout(() => {
        effect.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 600);
}

// Показ подсказки
function showHint(message) {
    const hintElement = document.querySelector('.hint span');
    const originalText = hintElement.textContent;
    
    hintElement.textContent = message;
    hintElement.style.color = 'var(--accent)';
    
    setTimeout(() => {
        hintElement.textContent = originalText;
        hintElement.style.color = '';
    }, 3000);
}

// Запускаем калькулятор когда страница загрузится
document.addEventListener('DOMContentLoaded', initCalculator);

// Добавляем красивый логотип в консоль
console.log(`
%cNeoCalc 🧮✨
%cЭлегантный калькулятор
Версия 1.0.0
`, 
'color: #4361ee; font-size: 24px; font-weight: bold;',
'color: #6c757d; font-size: 14px;'
);