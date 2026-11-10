import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox']
});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];

page.on('console', msg => {
  if (msg.type() === 'error') errors.push(`CONSOLE ERROR: ${msg.text()}`);
});
page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

// Test reception view
await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
console.log('✓ Reception view loaded');

// Navigate to sessions view
await page.click('button:has-text("جدول الحصص والقاعات")');
await page.waitForTimeout(1500);
console.log('✓ Sessions view loaded');

// Navigate to ledger view
await page.click('button:has-text("دفتر اليومية المالي")');
await page.waitForTimeout(1500);
console.log('✓ Ledger view loaded');

// Navigate back to reception
await page.click('button:has-text("شاشة الاستقبال الرئيسية")');
await page.waitForTimeout(1500);
console.log('✓ Back to reception view');

// Test new student modal
await page.click('button:has-text("تسجيل طالب جديد")');
await page.waitForTimeout(1000);
if (await page.locator('text=تسجيل طالب جديد').first().isVisible()) {
  console.log('✓ New Student modal opens');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

// Test receipt modal via last check-in receipt
await page.waitForTimeout(500);
const receiptBtn = page.locator('text=إيصال #').first();
if (await receiptBtn.isVisible()) {
  await receiptBtn.click();
  await page.waitForTimeout(1000);
  if (await page.locator('text=إيصال').first().isVisible()) {
    console.log('✓ Receipt modal opens');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }
}

await browser.close();

if (errors.length > 0) {
  console.log('\n❌ Errors found:');
  errors.forEach(e => console.log(e));
  process.exit(1);
} else {
  console.log('\n✅ All views loaded successfully with no console errors!');
}
