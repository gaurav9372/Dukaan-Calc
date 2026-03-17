const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('calcBreakdown Edge Cases', () => {
  let dom;
  let document;

  beforeEach(() => {
    // Load the HTML and JS files
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    const script = fs.readFileSync(path.resolve(__dirname, '../app.js'), 'utf8');

    // Set up JSDOM environment
    dom = new JSDOM(html, { runScripts: "dangerously" });
    document = dom.window.document;

    // Evaluate the JS script within the JSDOM
    const scriptEl = document.createElement('script');
    scriptEl.textContent = script;
    document.body.appendChild(scriptEl);
  });

  it('calculates price per kg correctly for valid positive inputs', () => {
    const priceInput = document.getElementById('breakdown-price');
    const weightInput = document.getElementById('breakdown-weight');
    const resultInput = document.getElementById('breakdown-result');

    priceInput.value = '100';
    weightInput.value = '2';
    // Dispatch input event to trigger calcBreakdown
    priceInput.dispatchEvent(new dom.window.Event('input'));

    expect(resultInput.value).toBe('50');
  });

  it('handles negative weight edge case to prevent invalid result', () => {
    const priceInput = document.getElementById('breakdown-price');
    const weightInput = document.getElementById('breakdown-weight');
    const resultInput = document.getElementById('breakdown-result');

    priceInput.value = '100';
    weightInput.value = '-5';
    weightInput.dispatchEvent(new dom.window.Event('input'));

    // Should be 0 since weight > 0 check in calcBreakdown fails
    expect(resultInput.value).toBe('0');
  });

  it('handles zero weight edge case to prevent division by zero', () => {
    const priceInput = document.getElementById('breakdown-price');
    const weightInput = document.getElementById('breakdown-weight');
    const resultInput = document.getElementById('breakdown-result');

    priceInput.value = '100';
    weightInput.value = '0';
    weightInput.dispatchEvent(new dom.window.Event('input'));

    expect(resultInput.value).toBe('0');
  });

  it('handles invalid inputs that parse to NaN as 0', () => {
    const priceInput = document.getElementById('breakdown-price');
    const weightInput = document.getElementById('breakdown-weight');
    const resultInput = document.getElementById('breakdown-result');

    priceInput.value = 'abc';
    weightInput.value = 'xyz';
    weightInput.dispatchEvent(new dom.window.Event('input'));

    expect(resultInput.value).toBe('0');
  });
});
