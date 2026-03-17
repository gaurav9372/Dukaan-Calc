/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('renderProducts', () => {
  let renderProducts;
  let productList;
  let fertilizerTotal;
  let app;

  beforeEach(() => {
    // Set up DOM
    const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
    document.documentElement.innerHTML = html;

    // Require app (which relies on DOM being present)
    jest.resetModules();
    app = require('./app.js');
    renderProducts = app.renderProducts;

    productList = document.getElementById('product-list');
    fertilizerTotal = document.getElementById('fertilizer-total');
  });

  it('renders products correctly', () => {
    const products = [
      { price: 100, weight: 2 },
      { price: 50, weight: 1.5 }
    ];

    renderProducts(products);

    const cards = productList.querySelectorAll('.product-card');
    expect(cards.length).toBe(2);

    // Check first card
    const card1Price = cards[0].querySelector('[data-field="price"]').value;
    const card1Weight = cards[0].querySelector('[data-field="weight"]').value;
    const card1Total = cards[0].querySelector('[data-total]').textContent;

    expect(card1Price).toBe("100");
    expect(card1Weight).toBe("2");
    expect(card1Total).toBe("₹200");

    // Check second card
    const card2Price = cards[1].querySelector('[data-field="price"]').value;
    const card2Weight = cards[1].querySelector('[data-field="weight"]').value;
    const card2Total = cards[1].querySelector('[data-total]').textContent;

    expect(card2Price).toBe("50");
    expect(card2Weight).toBe("1.5");
    expect(card2Total).toBe("₹75");

    // Check fertilizer total
    expect(fertilizerTotal.value).toBe("275");
  });

  it('clears existing products before rendering', () => {
    renderProducts([{ price: 10, weight: 1 }]);
    expect(productList.querySelectorAll('.product-card').length).toBe(1);

    renderProducts([{ price: 20, weight: 2 }, { price: 30, weight: 3 }]);
    expect(productList.querySelectorAll('.product-card').length).toBe(2);
  });

  it('calls setupNumberInputs correctly on rendered inputs', () => {
    renderProducts([{ price: 10, weight: 1 }]);
    const input = productList.querySelector('input[data-number]');

    expect(input).not.toBeNull();
    expect(input.getAttribute('readonly')).toBe('readonly');
    expect(input.getAttribute('inputmode')).toBe('none');
    expect(input.dataset.keyboardReady).toBe('true');
  });

  it('handles empty products array', () => {
    renderProducts([]);
    expect(productList.innerHTML).toBe("");
    expect(fertilizerTotal.value).toBe("0");
  });

  it('handles products with zero price and weight', () => {
    renderProducts([{ price: 0, weight: 0 }]);
    const cards = productList.querySelectorAll('.product-card');
    expect(cards.length).toBe(1);

    const total = cards[0].querySelector('[data-total]').textContent;
    expect(total).toBe("₹0");
    expect(fertilizerTotal.value).toBe("0");
  });

  it('assigns correct dataset index to each card', () => {
    const products = [
      { price: 10, weight: 1 },
      { price: 20, weight: 2 },
      { price: 30, weight: 3 }
    ];

    renderProducts(products);
    const cards = productList.querySelectorAll('.product-card');

    expect(cards[0].dataset.index).toBe("0");
    expect(cards[1].dataset.index).toBe("1");
    expect(cards[2].dataset.index).toBe("2");
  });
});
