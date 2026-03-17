const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
const js = fs.readFileSync(path.resolve(__dirname, './app.js'), 'utf8');

describe('calcDiscount', () => {
  let dom;
  let document;
  let window;
  let priceInput;
  let rateInput;
  let resultInput;
  let amountSpan;

  beforeEach(() => {
    // Setup JSDOM
    dom = new JSDOM(html, { runScripts: 'dangerously' });
    window = dom.window;
    document = window.document;

    // Execute app.js in the JSDOM environment
    const scriptEl = document.createElement('script');
    scriptEl.textContent = js;
    document.body.appendChild(scriptEl);

    // Get references to the DOM elements
    priceInput = document.getElementById('discount-price');
    rateInput = document.getElementById('discount-rate');
    resultInput = document.getElementById('discount-result');
    amountSpan = document.getElementById('discount-amount');
  });

  const triggerInputEvent = (element) => {
    element.dispatchEvent(new window.Event('input'));
  };

  test('happy path: calculates standard discount correctly', () => {
    priceInput.value = '1000';
    rateInput.value = '15';
    triggerInputEvent(priceInput);

    expect(resultInput.value).toBe('850');
    expect(amountSpan.textContent).toBe('Discount Amount: ₹150');
  });

  test('edge case: 0% discount', () => {
    priceInput.value = '1000';
    rateInput.value = '0';
    triggerInputEvent(priceInput);

    expect(resultInput.value).toBe('1000');
    expect(amountSpan.textContent).toBe('Discount Amount: ₹0');
  });

  test('edge case: 100% discount', () => {
    priceInput.value = '1000';
    rateInput.value = '100';
    triggerInputEvent(priceInput);

    expect(resultInput.value).toBe('0');
    expect(amountSpan.textContent).toBe('Discount Amount: ₹1000');
  });

  test('decimal inputs: rounds correctly to 2 decimal places', () => {
    priceInput.value = '1000.50';
    rateInput.value = '12.5';
    triggerInputEvent(priceInput);

    expect(resultInput.value).toBe('875.44');
    expect(amountSpan.textContent).toBe('Discount Amount: ₹125.06');
  });

  test('invalid inputs: handles non-numeric inputs gracefully', () => {
    priceInput.value = 'invalid';
    rateInput.value = 'invalid';
    triggerInputEvent(priceInput);

    expect(resultInput.value).toBe('0');
    expect(amountSpan.textContent).toBe('Discount Amount: ₹0');
  });

  test('empty inputs: handles empty strings as 0', () => {
    priceInput.value = '';
    rateInput.value = '';
    triggerInputEvent(priceInput);

    expect(resultInput.value).toBe('0');
    expect(amountSpan.textContent).toBe('Discount Amount: ₹0');
  });
});
