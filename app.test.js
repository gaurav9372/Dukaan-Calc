const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

describe('Fertilizer Calculator - updateFertilizerTotal', () => {
  let productList;
  let fertilizerTotal;
  let addProductButton;

  beforeEach(() => {
    // Set up the DOM
    document.documentElement.innerHTML = html.toString();

    // Clear modules cache to ensure fresh state for app.js
    jest.resetModules();

    // Require app.js which will initialize the DOM
    require('./app.js');

    // Get references to elements
    productList = document.getElementById('product-list');
    fertilizerTotal = document.getElementById('fertilizer-total');
    addProductButton = document.getElementById('add-product');
  });

  afterEach(() => {
    document.documentElement.innerHTML = '';
  });

  const getCards = () => productList.querySelectorAll('.product-card');

  const setInputValue = (input, value) => {
    input.value = value;
    // Trigger the input event so app.js updates calculations
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  it('calculates initial total correctly (0)', () => {
    expect(fertilizerTotal.value).toBe('0');

    const cards = getCards();
    expect(cards.length).toBe(1);

    const totalEl = cards[0].querySelector('[data-total]');
    expect(totalEl.textContent).toBe('₹0');
  });

  it('updates total correctly when price and weight of a single product change', () => {
    const cards = getCards();
    const priceInput = cards[0].querySelector("[data-field='price']");
    const weightInput = cards[0].querySelector("[data-field='weight']");

    setInputValue(priceInput, '150');
    setInputValue(weightInput, '2');

    const totalEl = cards[0].querySelector('[data-total]');
    expect(totalEl.textContent).toBe('₹300'); // 150 * 2
    expect(fertilizerTotal.value).toBe('300');
  });

  it('updates total correctly with multiple products', () => {
    // Add a second product
    addProductButton.click();

    const cards = getCards();
    expect(cards.length).toBe(2);

    // Set first product: 100 * 2 = 200
    const p1Price = cards[0].querySelector("[data-field='price']");
    const p1Weight = cards[0].querySelector("[data-field='weight']");
    setInputValue(p1Price, '100');
    setInputValue(p1Weight, '2');

    // Set second product: 50 * 3 = 150
    const p2Price = cards[1].querySelector("[data-field='price']");
    const p2Weight = cards[1].querySelector("[data-field='weight']");
    setInputValue(p2Price, '50');
    setInputValue(p2Weight, '3');

    const t1 = cards[0].querySelector('[data-total]');
    const t2 = cards[1].querySelector('[data-total]');

    expect(t1.textContent).toBe('₹200');
    expect(t2.textContent).toBe('₹150');
    expect(fertilizerTotal.value).toBe('350'); // 200 + 150
  });

  it('handles invalid or empty inputs gracefully (defaults to 0)', () => {
    const cards = getCards();
    const priceInput = cards[0].querySelector("[data-field='price']");
    const weightInput = cards[0].querySelector("[data-field='weight']");

    // First set valid inputs
    setInputValue(priceInput, '100');
    setInputValue(weightInput, '5');
    expect(fertilizerTotal.value).toBe('500');

    // Now set invalid input (empty string)
    setInputValue(priceInput, '');

    const totalEl = cards[0].querySelector('[data-total]');
    expect(totalEl.textContent).toBe('₹0');
    expect(fertilizerTotal.value).toBe('0');

    // Set non-numeric input (if somehow entered, JS Number() gives NaN, OR operator gives 0)
    setInputValue(priceInput, 'abc');
    expect(totalEl.textContent).toBe('₹0');
    expect(fertilizerTotal.value).toBe('0');
  });

  it('formats large numbers correctly', () => {
    const cards = getCards();
    const priceInput = cards[0].querySelector("[data-field='price']");
    const weightInput = cards[0].querySelector("[data-field='weight']");

    // Setting float values to check formatting (from formatNumber function)
    setInputValue(priceInput, '10.555');
    setInputValue(weightInput, '2');

    // 10.555 * 2 = 21.11, rounded to 21.11
    const totalEl = cards[0].querySelector('[data-total]');
    expect(totalEl.textContent).toBe('₹21.11');
    expect(fertilizerTotal.value).toBe('21.11');
  });
});
