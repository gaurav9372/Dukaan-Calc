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

console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);

console.log("\nRunning physical keyboard tests...");

// Setup DOM for testing physical keyboard
const html2 = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
const js2 = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");

const dom2 = new JSDOM(html2, { runScripts: "dangerously" });
const window2 = dom2.window;
const document2 = window2.document;

// Mock features
window2.HTMLCanvasElement.prototype.getContext = () => ({
  measureText: () => ({ width: 10 }),
});
window2.getComputedStyle = () => ({
  fontWeight: "normal",
  fontSize: "16px",
  fontFamily: "Arial",
  paddingLeft: "10px",
});
window2.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

dom2.window.eval(js2);

setTimeout(() => {
  let passed = 0;
  let total = 0;

  const runTest = (name, testFn) => {
    total++;
    try {
      testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ ${name}`);
      console.error(e);
    }
  };

  runTest("Should handle numeric input from physical keyboard", () => {
    const input = document2.getElementById("discount-price");
    input.focus();

    // reset to empty
    input.value = "";
    document2.dispatchEvent(new window2.KeyboardEvent("keydown", { key: "1", bubbles: true }));
    document2.dispatchEvent(new window2.KeyboardEvent("keydown", { key: "5", bubbles: true }));
    document2.dispatchEvent(new window2.KeyboardEvent("keydown", { key: ".", bubbles: true }));
    document2.dispatchEvent(new window2.KeyboardEvent("keydown", { key: "5", bubbles: true }));

    if (input.value !== "15.5") {
      throw new Error(`Expected '15.5', got '${input.value}'`);
    }
  });

  runTest("Should handle Backspace from physical keyboard", () => {
    const input = document2.getElementById("discount-price");
    input.focus();

    // The previous value is 15.5
    document2.dispatchEvent(new window2.KeyboardEvent("keydown", { key: "Backspace", bubbles: true }));

    if (input.value !== "15.") {
      throw new Error(`Expected '15.', got '${input.value}'`);
    }
  });

  runTest("Should handle Escape from physical keyboard", () => {
    const input = document2.getElementById("discount-price");
    input.focus();

    if (!document2.body.classList.contains("keyboard-visible")) {
      throw new Error("Keyboard should be visible when input is focused");
    }

    document2.dispatchEvent(new window2.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    if (document2.body.classList.contains("keyboard-visible")) {
      throw new Error("Keyboard should be hidden after Escape");
    }
  });

  console.log(`\nKeyboard tests completed: ${passed} passed, ${total - passed} failed.`);
  if (failed > 0 || total - passed > 0) {
      process.exit(1);
  }
}, 200);
