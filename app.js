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
const keyboard = document.getElementById("keyboard");

let activeInput = null;
let activeGroup = null;

const showKeyboard = () => {
  document.body.classList.add("keyboard-visible");
};

const hideKeyboard = () => {
  document.body.classList.remove("keyboard-visible");
  activeInput = null;
  if (activeGroup) {
    activeGroup.classList.remove("is-active");
    activeGroup = null;
  }
};

const syncInput = (input) => {
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

const updateCaret = (input) => {
  const group = input.closest(".input-group");
  if (!group) return;

  const unit = group.querySelector(".unit");
  const style = window.getComputedStyle(input);
  const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

  const canvas = updateCaret.canvas || (updateCaret.canvas = document.createElement("canvas"));
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.font = font;

  const value = input.value || "";
  const textWidth = ctx.measureText(value).width;
  const paddingLeft = parseFloat(window.getComputedStyle(group).paddingLeft) || 0;
  const unitWidth = unit ? unit.offsetWidth + 12 : 0;
  const maxX = Math.max(paddingLeft, group.clientWidth - unitWidth - 6);
  const caretX = Math.min(paddingLeft + textWidth + 2, maxX);

  group.style.setProperty("--caret-x", `${caretX}px`);
};

const setActiveInput = (input) => {
  if (activeGroup) {
    activeGroup.classList.remove("is-active");
  }
  activeInput = input;
  showKeyboard();
  input.focus();
  activeGroup = input.closest(".input-group");
  if (activeGroup) {
    activeGroup.classList.add("is-active");
  }
  if (input.value === "0") {
    input.value = "";
    syncInput(input);
  }
  updateCaret(input);
};

const showScreen = (name) => {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });

  const active = document.querySelector(`.screen[data-screen="${name}"]`);
  if (active) {
    const firstInput = active.querySelector('input[type="number"]');
    if (firstInput) {
      setTimeout(() => {
        setActiveInput(firstInput);
      }, 0);
    }
  }

  if (name === "home") {
    hideKeyboard();
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
            <input type="number" min="0" step="0.01" value="${product.price}" data-field="price" readonly inputmode="none" />
            <span class="unit">₹</span>
          </div>
        </label>
        <label class="field">
          <span>Weight</span>
          <div class="input-group">
            <input type="number" min="0" step="0.01" value="${product.weight}" data-field="weight" readonly inputmode="none" />
            <span class="unit">Kg</span>
          </div>
        </label>
      </div>
      <div class="product-total" data-total>₹${formatNumber(product.price * product.weight)}</div>
    `;

    productList.appendChild(card);
  });

  setupNumberInputs();
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

const setupNumberInputs = () => {
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    if (input.dataset.keyboardReady) return;
    input.dataset.keyboardReady = "true";
    input.setAttribute("readonly", "readonly");
    input.setAttribute("inputmode", "none");
    input.addEventListener("focus", () => setActiveInput(input));
    input.addEventListener("click", () => setActiveInput(input));
    input.addEventListener("blur", () => {
      const group = input.closest(".input-group");
      if (group) {
        group.classList.remove("is-active");
        if (activeGroup === group) {
          activeGroup = null;
        }
      }
      if (input.value === "") {
        input.value = "0";
        syncInput(input);
      }
    });
  });
};

const handleKey = (key) => {
  if (!activeInput) return;
  let value = activeInput.value;

  if (key === "backspace") {
    value = value.slice(0, -1);
  } else if (key === "enter") {
    const activeScreen = activeInput.closest(".screen");
    const inputs = activeScreen
      ? Array.from(activeScreen.querySelectorAll('input[type="number"]'))
      : [];
    const currentIndex = inputs.indexOf(activeInput);
    const nextInput = inputs[currentIndex + 1];

    if (nextInput) {
      setActiveInput(nextInput);
    } else {
      activeInput.blur();
      hideKeyboard();
    }
    return;
  } else if (key === ".") {
    if (!value.includes(".")) {
      value = value === "" ? "0." : `${value}.`;
    }
  } else {
    value = value === "0" ? key : `${value}${key}`;
  }

  activeInput.value = value;
  syncInput(activeInput);
  updateCaret(activeInput);
};

keyboard.addEventListener("pointerdown", (event) => {
  event.preventDefault();
});

keyboard.addEventListener("click", (event) => {
  const button = event.target.closest("[data-key]");
  if (!button) return;
  handleKey(button.dataset.key);
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
setupNumberInputs();

const setViewportHeight = () => {
  const vv = window.visualViewport;
  const height = Math.round(vv ? vv.height : window.innerHeight);
  document.documentElement.style.setProperty("--vvh", `${height}px`);
};

setViewportHeight();
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", setViewportHeight);
  window.visualViewport.addEventListener("scroll", setViewportHeight);
}
window.addEventListener("resize", setViewportHeight);
window.addEventListener("orientationchange", setViewportHeight);
