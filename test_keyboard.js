const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the local file
  const path = require('path');
  const filePath = `file://${path.join(__dirname, 'index.html')}`;
  console.log(`Navigating to ${filePath}`);
  await page.goto(filePath);

  // Go to Discount Calculator
  await page.click('button[data-go="discount"]');

  // Wait for the discount price input to be visible
  await page.waitForSelector('#discount-price', { state: 'visible' });

  // Click on the discount price input to activate it
  await page.click('#discount-price');

  // Simulate physical keyboard typing
  await page.keyboard.press('1');
  await page.keyboard.press('0');
  await page.keyboard.press('0');

  // Check the value of the input
  let priceValue = await page.$eval('#discount-price', el => el.value);
  console.log(`Discount price value after typing '100': ${priceValue}`);
  if (priceValue !== '100') {
    console.error(`Expected '100', got '${priceValue}'`);
    process.exit(1);
  }

  // Press Enter to move to next input (Discount Rate)
  await page.keyboard.press('Enter');

  // Type '1' '5' for 15% discount
  await page.keyboard.press('1');
  await page.keyboard.press('5');

  // Check the value of the rate input
  let rateValue = await page.$eval('#discount-rate', el => el.value);
  console.log(`Discount rate value after typing '15': ${rateValue}`);
  if (rateValue !== '15') {
    console.error(`Expected '15', got '${rateValue}'`);
    process.exit(1);
  }

  // Check the result
  let resultValue = await page.$eval('#discount-result', el => el.value);
  console.log(`Discount result after 15% off 100: ${resultValue}`);
  if (resultValue !== '85') {
    console.error(`Expected '85', got '${resultValue}'`);
    process.exit(1);
  }

  // Test Backspace
  await page.keyboard.press('Backspace');
  rateValue = await page.$eval('#discount-rate', el => el.value);
  console.log(`Discount rate value after Backspace: ${rateValue}`);
  if (rateValue !== '1') {
    console.error(`Expected '1', got '${rateValue}'`);
    process.exit(1);
  }

  // Test Escape to blur
  await page.keyboard.press('Escape');
  // the keyboard should be hidden and no active input
  const isKeyboardVisible = await page.evaluate(() => document.body.classList.contains('keyboard-visible'));
  console.log(`Keyboard visible after Escape: ${isKeyboardVisible}`);
  if (isKeyboardVisible) {
    console.error('Keyboard should be hidden after Escape');
    process.exit(1);
  }

  console.log('✅ Physical keyboard tests passed!');
  await browser.close();
})();
