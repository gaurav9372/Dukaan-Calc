const screens = Array.from(document.querySelectorAll(".screen"));
const menuButtons = document.querySelectorAll("[data-go]");
const backButtons = document.querySelectorAll("[data-back]");

const defaultDiscount = { price: 0, rate: 0 };
const defaultBreakdown = { price: 0, weight: 0 };
const defaultProducts = [{ price: 0, weight: 0 }];

const discountPrice = document.getElementById("discount-price");
const discountRate = document.getElementById("discount-rate");
const discountResult = document.getElementById("discount-result");
const discountAmount = document.getElementById("discount-amount");

const breakdownPrice = document.getElementById("breakdown-price");
const breakdownWeight = document.getElementById("breakdown-weight");
const breakdownResult = document.getElementById("breakdown-result");

const productList = document.getElementById("product-list");
const addProductButton = document.getElementById("add-product");
const fertilizerTotal = document.getElementById("fertilizer-total");
const keyboard = document.getElementById("keyboard");

let activeInput = null;
let activeGroup = null;
let repeatTimeout = null;
let repeatInterval = null;
let repeatKey = null;

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
  stopRepeat();
};

const syncInput = (input) => {
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

const getCaretIndex = (input) => {
  const stored = Number(input.dataset.caretIndex);
  if (Number.isInteger(stored)) return stored;
  return input.value.length;
};

const setCaretIndex = (input, index) => {
  const clamped = Math.max(0, Math.min(index, input.value.length));
  input.dataset.caretIndex = String(clamped);
  return clamped;
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
  const caretIndex = setCaretIndex(input, getCaretIndex(input));
  const textBefore = value.slice(0, caretIndex);
  const textWidth = ctx.measureText(textBefore).width;
  const paddingLeft = parseFloat(window.getComputedStyle(group).paddingLeft) || 0;
  const unitWidth = unit ? unit.offsetWidth + 12 : 0;
  const maxX = Math.max(paddingLeft, group.clientWidth - unitWidth - 6);
  const visibleWidth = input.clientWidth || 0;
  const scrollLeft = Math.max(0, textWidth - (visibleWidth - 6));
  input.scrollLeft = scrollLeft;
  const caretX = Math.min(paddingLeft + (textWidth - scrollLeft), maxX);

  group.style.setProperty("--caret-x", `${Math.round(caretX)}px`);
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
  setCaretIndex(input, input.value.length);
  updateCaret(input);
};

const showScreen = (name) => {
  stopRepeat();
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });

  const active = document.querySelector(`.screen[data-screen="${name}"]`);
  if (active) {
    const firstInput = active.querySelector("input[data-number]");
    if (firstInput) {
      setTimeout(() => {
        setActiveInput(firstInput);
      }, 0);
    }
  }

  if (name === "home") {
    resetAll();
    hideKeyboard();
  }
  updateFooterHeight();
};

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
};

const calcDiscount = () => {
  const price = Number(discountPrice.value) || 0;
  const rate = Number(discountRate.value) || 0;
  const amount = (price * rate) / 100;
  const newPrice = price - amount;
  discountResult.value = formatNumber(newPrice);
  if (discountAmount) {
    discountAmount.textContent = `Discount Amount: ₹${formatNumber(amount)}`;
  }
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
      <div class="product-head">
        <div class="product-title">Product ${index + 1}</div>
        <div class="product-total" data-total>₹${formatNumber(product.price * product.weight)}</div>
      </div>
      <div class="product-row">
        <div class="input-group">
          <input type="text" value="${product.price}" data-field="price" data-number readonly inputmode="none" />
          <span class="unit">₹</span>
        </div>
        <div class="input-group">
          <input type="text" value="${product.weight}" data-field="weight" data-number readonly inputmode="none" />
          <span class="unit">Kg</span>
        </div>
      </div>
    `;

    productList.appendChild(card);
  });

  setupNumberInputs();
  updateFertilizerTotal();
  ensureActiveInput();
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

const placeCaretFromEvent = (input, event) => {
  const group = input.closest(".input-group");
  if (!group) return;

  const rect = group.getBoundingClientRect();
  const paddingLeft = parseFloat(window.getComputedStyle(group).paddingLeft) || 0;
  const unit = group.querySelector(".unit");
  const unitWidth = unit ? unit.offsetWidth + 12 : 0;
  const maxX = Math.max(paddingLeft, rect.width - unitWidth - 6);
  const clickX = Math.min(Math.max(event.clientX - rect.left, paddingLeft), maxX);
  const relativeX = Math.max(0, clickX - paddingLeft + input.scrollLeft);

  const style = window.getComputedStyle(input);
  const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const canvas = updateCaret.canvas || (updateCaret.canvas = document.createElement("canvas"));
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.font = font;

  const value = input.value || "";
  if (value.length === 0) {
    setCaretIndex(input, 0);
    updateCaret(input);
    return;
  }

  const widths = [];
  for (let i = 0; i < value.length; i += 1) {
    widths[i] = ctx.measureText(value.slice(0, i + 1)).width;
  }

  let index = 0;
  for (let i = 0; i < widths.length; i += 1) {
    const prev = i === 0 ? 0 : widths[i - 1];
    const mid = prev + (widths[i] - prev) / 2;
    if (relativeX <= mid) {
      index = i;
      break;
    }
    index = i + 1;
  }

  setCaretIndex(input, index);
  updateCaret(input);
};

const setupNumberInputs = () => {
  document.querySelectorAll("input[data-number]").forEach((input) => {
    if (input.dataset.keyboardReady) return;
    input.dataset.keyboardReady = "true";
    input.setAttribute("readonly", "readonly");
    input.setAttribute("inputmode", "none");
    input.addEventListener("focus", () => setActiveInput(input));
    input.addEventListener("click", (event) => {
      setActiveInput(input);
      placeCaretFromEvent(input, event);
    });
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

const ensureActiveInput = () => {
  if (activeInput && document.body.contains(activeInput)) return;
  activeInput = null;
  if (activeGroup) {
    activeGroup.classList.remove("is-active");
    activeGroup = null;
  }
  if (document.body.classList.contains("keyboard-visible")) {
    const activeScreen = document.querySelector(".screen.active");
    const nextInput = activeScreen ? activeScreen.querySelector("input[data-number]") : null;
    if (nextInput) {
      setActiveInput(nextInput);
    } else {
      hideKeyboard();
    }
  }
};

const handleKey = (key) => {
  if (!activeInput) return;
  let value = activeInput.value;
  let caretIndex = getCaretIndex(activeInput);

  if (key === "backspace") {
    if (caretIndex > 0) {
      value = value.slice(0, caretIndex - 1) + value.slice(caretIndex);
      caretIndex -= 1;
    }
  } else if (key === "enter") {
    const activeScreen = activeInput.closest(".screen");
    const inputs = activeScreen
      ? Array.from(activeScreen.querySelectorAll("input[data-number]"))
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
      if (value === "") {
        value = "0.";
        caretIndex = value.length;
      } else {
        value = value.slice(0, caretIndex) + "." + value.slice(caretIndex);
        caretIndex += 1;
      }
    }
  } else {
    if (value === "0") {
      value = key;
      caretIndex = value.length;
    } else {
      value = value.slice(0, caretIndex) + key + value.slice(caretIndex);
      caretIndex += 1;
    }
  }

  activeInput.value = value;
  setCaretIndex(activeInput, caretIndex);
  syncInput(activeInput);
  updateCaret(activeInput);
};

keyboard.addEventListener("pointerdown", (event) => {
  const button = event.target.closest("[data-key]");
  if (!button) return;
  event.preventDefault();
  const key = button.dataset.key;
  repeatKey = key;
  handleKey(key);

  clearTimeout(repeatTimeout);
  clearInterval(repeatInterval);
  repeatTimeout = setTimeout(() => {
    repeatInterval = setInterval(() => {
      if (repeatKey === "backspace") {
        if (!activeInput) return;
        activeInput.value = "";
        setCaretIndex(activeInput, 0);
        syncInput(activeInput);
        updateCaret(activeInput);
      } else {
        handleKey(repeatKey);
      }
    }, 70);
  }, 350);
});

const stopRepeat = () => {
  clearTimeout(repeatTimeout);
  clearInterval(repeatInterval);
  repeatTimeout = null;
  repeatInterval = null;
  repeatKey = null;
};

keyboard.addEventListener("pointerup", stopRepeat);
keyboard.addEventListener("pointerleave", stopRepeat);
keyboard.addEventListener("pointercancel", stopRepeat);
window.addEventListener("pointerup", stopRepeat);

keyboard.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

document.addEventListener("pointerdown", (event) => {
  const group = event.target.closest(".input-group");
  if (!group) return;
  const input = group.querySelector("input[data-number]");
  if (!input) return;
  setActiveInput(input);
  placeCaretFromEvent(input, event);
});

const resetButtons = document.querySelectorAll("[data-reset]");
const footerEls = Array.from(document.querySelectorAll(".screen-footer"));
resetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.reset;
    const screen = button.closest(".screen");
    const firstInput = screen ? screen.querySelector("input[data-number]") : null;
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
    if (firstInput) {
      setActiveInput(firstInput);
    }
  });
});

const updateFooterHeight = () => {
  if (!footerEls.length) return;
  const maxHeight = footerEls.reduce(
    (max, el) => Math.max(max, el.offsetHeight),
    0
  );
  if (maxHeight > 0) {
    document.documentElement.style.setProperty("--footer-h", `${maxHeight}px`);
  }
};

const resetAll = () => {
  discountPrice.value = defaultDiscount.price;
  discountRate.value = defaultDiscount.rate;
  calcDiscount();

  breakdownPrice.value = defaultBreakdown.price;
  breakdownWeight.value = defaultBreakdown.weight;
  calcBreakdown();

  renderProducts(defaultProducts);
};

calcDiscount();
calcBreakdown();
renderProducts(defaultProducts);
setupNumberInputs();
updateFooterHeight();

if (window.ResizeObserver && footerEls.length) {
  const footerObserver = new ResizeObserver(updateFooterHeight);
  footerEls.forEach((el) => footerObserver.observe(el));
}

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
window.addEventListener("resize", updateFooterHeight);
window.addEventListener("orientationchange", updateFooterHeight);

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    renderProducts,
    formatNumber,
    updateFertilizerTotal,
    setupNumberInputs,
    ensureActiveInput,
    calcDiscount,
    calcBreakdown
  };
}
