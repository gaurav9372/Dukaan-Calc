const screens = Array.from(document.querySelectorAll(".screen"));
const menuButtons = document.querySelectorAll("[data-go]");
const backButtons = document.querySelectorAll("[data-back]");

const defaultDiscount = { price: 0, rate: 0 };
const defaultBreakdown = { price: 0, weight: 0 };
const defaultProducts = [{ price: 0, weight: 0 }];

const discountPrice = document.getElementById("discount-price");
const discountRate = document.getElementById("discount-rate");
const discountResult = document.getElementById("discount-result");

const breakdownPrice = document.getElementById("breakdown-price");
const breakdownWeight = document.getElementById("breakdown-weight");
const breakdownResult = document.getElementById("breakdown-result");

const productList = document.getElementById("product-list");
const addProductButton = document.getElementById("add-product");
const fertilizerTotal = document.getElementById("fertilizer-total");

const showScreen = (name) => {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });

  const active = document.querySelector(`.screen[data-screen="${name}"]`);
  if (active) {
    const firstInput = active.querySelector('input[type="number"]');
    if (firstInput) {
      setTimeout(() => {
        firstInput.focus();
        if (firstInput.value === "0") {
          firstInput.value = "";
        }
      }, 0);
    }
  }
};

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
};

const calcDiscount = () => {
  const price = Number(discountPrice.value) || 0;
  const rate = Number(discountRate.value) || 0;
  const newPrice = price - (price * rate) / 100;
  discountResult.value = formatNumber(newPrice);
};

const calcBreakdown = () => {
  const price = Number(breakdownPrice.value) || 0;
  const weight = Number(breakdownWeight.value) || 0;
  const perKg = weight > 0 ? price / weight : 0;
  breakdownResult.value = formatNumber(perKg);
};

const renderProducts = (products) => {
  productList.innerHTML = "";
  products.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.index = index;

    card.innerHTML = `
      <div class="product-title">Product ${index + 1}</div>
      <div class="product-row">
        <label class="field">
          <span>Price</span>
          <div class="input-group">
            <input type="number" min="0" step="0.01" value="${product.price}" data-field="price" />
            <span class="unit">₹</span>
          </div>
        </label>
        <label class="field">
          <span>Weight</span>
          <div class="input-group">
            <input type="number" min="0" step="0.01" value="${product.weight}" data-field="weight" />
            <span class="unit">Kg</span>
          </div>
        </label>
      </div>
      <div class="product-total" data-total>₹${formatNumber(product.price * product.weight)}</div>
    `;

    productList.appendChild(card);
  });

  updateFertilizerTotal();
};

const updateFertilizerTotal = () => {
  const cards = productList.querySelectorAll(".product-card");
  let total = 0;
  cards.forEach((card) => {
    const price = Number(card.querySelector("[data-field='price']").value) || 0;
    const weight = Number(card.querySelector("[data-field='weight']").value) || 0;
    const subtotal = price * weight;
    total += subtotal;
    const totalEl = card.querySelector("[data-total]");
    totalEl.textContent = `₹${formatNumber(subtotal)}`;
  });
  fertilizerTotal.value = formatNumber(total);
};

menuButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.go));
});

backButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen("home"));
});

[discountPrice, discountRate].forEach((input) => {
  input.addEventListener("input", calcDiscount);
});

[breakdownPrice, breakdownWeight].forEach((input) => {
  input.addEventListener("input", calcBreakdown);
});

document.addEventListener(
  "focusin",
  (event) => {
    if (event.target.matches('input[type="number"]')) {
      if (event.target.value === "0") {
        event.target.value = "";
      }
    }
  },
  true
);

productList.addEventListener("input", (event) => {
  if (event.target.matches("input")) {
    updateFertilizerTotal();
  }
});

addProductButton.addEventListener("click", () => {
  const cards = productList.querySelectorAll(".product-card");
  const newProduct = { price: 0, weight: 0 };
  renderProducts([
    ...Array.from(cards).map((card) => ({
      price: Number(card.querySelector("[data-field='price']").value) || 0,
      weight: Number(card.querySelector("[data-field='weight']").value) || 0,
    })),
    newProduct,
  ]);
});

const resetButtons = document.querySelectorAll("[data-reset]");
resetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.reset;
    if (target === "discount") {
      discountPrice.value = defaultDiscount.price;
      discountRate.value = defaultDiscount.rate;
      calcDiscount();
    }
    if (target === "breakdown") {
      breakdownPrice.value = defaultBreakdown.price;
      breakdownWeight.value = defaultBreakdown.weight;
      calcBreakdown();
    }
    if (target === "fertilizer") {
      renderProducts(defaultProducts);
    }
  });
});

calcDiscount();
calcBreakdown();
renderProducts(defaultProducts);

const setViewportHeight = () => {
  const vv = window.visualViewport;
  const height = Math.round(vv ? vv.height : window.innerHeight);
  document.documentElement.style.setProperty("--vvh", `${height}px`);

  if (vv) {
    const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    document.documentElement.style.setProperty("--kb", `${Math.round(keyboard)}px`);
    document.body.classList.toggle("keyboard-open", keyboard > 0);
  } else {
    document.documentElement.style.setProperty("--kb", "0px");
    document.body.classList.remove("keyboard-open");
  }
};

setViewportHeight();
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", setViewportHeight);
  window.visualViewport.addEventListener("scroll", setViewportHeight);
}
window.addEventListener("resize", setViewportHeight);
window.addEventListener("orientationchange", setViewportHeight);
