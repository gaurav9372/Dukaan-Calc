const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// We use the real HTML and JS to ensure the real codebase is tested
const htmlContent = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
const jsContent = fs.readFileSync(path.resolve(__dirname, 'app.js'), 'utf8');

describe('calcBreakdown functionality', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Setup JSDOM
    dom = new JSDOM(htmlContent, { runScripts: "outside-only" });
    window = dom.window;
    document = window.document;

    // Add necessary mocks that JSDOM lacks for this app.js
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Add canvas mock to prevent getContext errors
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = (tagName) => {
      const el = originalCreateElement(tagName);
      if (tagName.toLowerCase() === 'canvas') {
        el.getContext = () => ({
          measureText: () => ({ width: 0 })
        });
      }
      return el;
    };

    // Evaluate app.js within the JSDOM context
    window.eval(jsContent);
  });

  it('calculates price per kg correctly (normal values)', () => {
    const priceInput = document.getElementById('breakdown-price');
    const weightInput = document.getElementById('breakdown-weight');
    const resultInput = document.getElementById('breakdown-result');

    // Simulate user input
    priceInput.value = '100';
    priceInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    weightInput.value = '2';
    weightInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    expect(resultInput.value).toBe('50');
  });

  it('handles zero weight without dividing by zero error', () => {
    const priceInput = document.getElementById('breakdown-price');
    const weightInput = document.getElementById('breakdown-weight');
    const resultInput = document.getElementById('breakdown-result');

    priceInput.value = '100';
    priceInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    weightInput.value = '0';
    weightInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    expect(resultInput.value).toBe('0');
  });

  it('handles invalid inputs gracefully', () => {
    const priceInput = document.getElementById('breakdown-price');
    const weightInput = document.getElementById('breakdown-weight');
    const resultInput = document.getElementById('breakdown-result');

    priceInput.value = 'abc';
    priceInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    weightInput.value = 'xyz';
    weightInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    expect(resultInput.value).toBe('0');
  });

  it('formats decimals correctly', () => {
    const priceInput = document.getElementById('breakdown-price');
    const weightInput = document.getElementById('breakdown-weight');
    const resultInput = document.getElementById('breakdown-result');

    priceInput.value = '100';
    priceInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    weightInput.value = '3';
    weightInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    expect(resultInput.value).toBe('33.33');
  });
});
