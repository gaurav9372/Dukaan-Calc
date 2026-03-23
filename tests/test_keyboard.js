const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Mock context for updateCaret
window.HTMLCanvasElement.prototype.getContext = () => {
  return {
    measureText: () => ({ width: 0 }),
    font: '',
  };
};

// Also mock ResizeObserver which might be used
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

window.eval(script);

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, testName) {
    if (actual === expected) {
        console.log(`✅ ${testName}`);
        passed++;
    } else {
        console.error(`❌ ${testName}: Expected "${expected}", but got "${actual}"`);
        failed++;
    }
}

// simulate focus
const discountPrice = document.getElementById("discount-price");
discountPrice.focus();
discountPrice.dispatchEvent(new window.Event("focus"));

// trigger keydown
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: '5' }));
assertEqual(discountPrice.value, '5', 'Should accept 5');

document.dispatchEvent(new window.KeyboardEvent('keydown', { key: '0' }));
assertEqual(discountPrice.value, '50', 'Should accept 0');

document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Backspace' }));
assertEqual(discountPrice.value, '5', 'Should accept Backspace');

console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
    process.exit(1);
}
