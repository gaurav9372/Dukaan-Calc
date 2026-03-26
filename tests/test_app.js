const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Load HTML and JS
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

// Initialize JSDOM
const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;
const document = window.document;

// Mock canvas for JSDOM
window.HTMLCanvasElement.prototype.getContext = () => ({
    measureText: () => ({ width: 0 }),
    font: ''
});

// Execute the app.js script inside the jsdom environment
window.eval(script);

// Get the formatNumber function
const formatNumber = window.formatNumber;

if (!formatNumber) {
    console.error("formatNumber function is not attached to window.");
    process.exit(1);
}

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, testName) {
    if (actual === expected) {
        console.log(`✅ ${testName}`);
        passed++;
    } else {
        console.error(`❌ ${testName}: Expected ${expected}, but got ${actual}`);
        failed++;
    }
}

console.log('Running tests for formatNumber...\n');

// Integers
assertEqual(formatNumber(10), "10", "Should format positive integer correctly");
assertEqual(formatNumber(0), "0", "Should format zero correctly");
assertEqual(formatNumber(-5), "-5", "Should format negative integer correctly");

// Floats
assertEqual(formatNumber(10.5), "10.50", "Should format float with one decimal correctly");
assertEqual(formatNumber(0.1), "0.10", "Should format small float correctly");
assertEqual(formatNumber(-5.5), "-5.50", "Should format negative float correctly");

// Rounding
assertEqual(formatNumber(10.555), "10.56", "Should round up at 3rd decimal place");
assertEqual(formatNumber(10.554), "10.55", "Should round down at 3rd decimal place");
assertEqual(formatNumber(10.00), "10", "Should return integer string for exact float integers");
assertEqual(formatNumber(10.001), "10", "Should round down float near integer");
assertEqual(formatNumber(9.999), "10", "Should round up float near integer");

// Errors & Non-Finite
assertEqual(formatNumber(Infinity), "0", "Should handle Infinity");
assertEqual(formatNumber(-Infinity), "0", "Should handle -Infinity");
assertEqual(formatNumber(NaN), "0", "Should handle NaN");
assertEqual(formatNumber(null), "0", "Should handle null");
assertEqual(formatNumber(undefined), "0", "Should handle undefined");
assertEqual(formatNumber('invalid'), "0", "Should handle strings");

console.log('\nRunning tests for keyboard navigation...\n');

// Set active input for test
const discountPriceInput = document.getElementById("discount-price");
discountPriceInput.dataset.number = "";
window.setActiveInput(discountPriceInput);

document.dispatchEvent(new window.KeyboardEvent('keydown', { key: '1' }));
assertEqual(discountPriceInput.value, '1', "Should handle physical '1' keydown");

document.dispatchEvent(new window.KeyboardEvent('keydown', { key: '5' }));
assertEqual(discountPriceInput.value, '15', "Should handle physical '5' keydown");

document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Backspace' }));
assertEqual(discountPriceInput.value, '1', "Should handle physical 'Backspace' keydown");

document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter' }));
assertEqual(discountPriceInput.value, '1', "Value should remain unchanged on 'Enter'");


console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
    process.exit(1);
}
