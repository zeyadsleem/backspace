import { test, expect } from "@playwright/test";

test.describe("Customer Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customers");
  });

  test("should create a visitor successfully", async ({ page }) => {
    // Open customer form
    await page.click('[data-testid="add-customer-button"]');

    // Should default to visitor tab
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText("زائر");

    // Fill form
    await page.fill('[name="name"]', "أحمد محمد");
    await page.fill('[name="phone"]', "01012345678");
    await page.fill('[name="email"]', "ahmed@example.com");
    await page.fill('[name="notes"]', "زائر جديد");

    // Wait for phone validation
    await expect(page.locator("text=Vodafone")).toBeVisible();

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success dialog
    await expect(page.locator("text=تم إنشاء العميل بنجاح")).toBeVisible();

    // Should show customer in list
    await expect(page.locator("text=أحمد محمد")).toBeVisible();
  });

  test("should create a member with subscription", async ({ page }) => {
    // Open customer form
    await page.click('[data-testid="add-customer-button"]');

    // Switch to member tab
    await page.click('[role="tab"]:has-text("مشترك")');

    // Should show plan selection
    await expect(page.locator("text=اختر نوع الاشتراك")).toBeVisible();

    // Select weekly plan
    await page.click("text=أسبوعي");

    // Should move to form step
    await expect(page.locator("text=أدخل بيانات العميل")).toBeVisible();

    // Fill form
    await page.fill('[name="name"]', "فاطمة أحمد");
    await page.fill('[name="phone"]', "01112345678");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success
    await expect(page.locator("text=تم إنشاء العميل بنجاح")).toBeVisible();
  });

  test("should validate phone number in real-time", async ({ page }) => {
    await page.click('[data-testid="add-customer-button"]');

    const phoneInput = page.locator('[name="phone"]');

    // Invalid phone
    await phoneInput.fill("123");
    await expect(page.locator("text=رقم هاتف مصري غير صالح")).toBeVisible();

    // Valid phone
    await phoneInput.fill("01012345678");
    await expect(page.locator("text=Vodafone")).toBeVisible();
    await expect(page.locator("svg.lucide-check")).toBeVisible();
  });

  test("should handle form validation errors", async ({ page }) => {
    await page.click('[data-testid="add-customer-button"]');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator("text=الاسم يجب أن يكون حرفين على الأقل")).toBeVisible();

    // Submit button should be disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test("should allow going back in member flow", async ({ page }) => {
    await page.click('[data-testid="add-customer-button"]');

    // Switch to member tab
    await page.click('[role="tab"]:has-text("مشترك")');

    // Select a plan
    await page.click("text=شهري");

    // Should be on form step
    await expect(page.locator("text=أدخل بيانات العميل")).toBeVisible();

    // Click back button
    await page.click('button:has-text("رجوع")');

    // Should be back to plan selection
    await expect(page.locator("text=اختر نوع الاشتراك")).toBeVisible();
  });

  test("should edit existing customer", async ({ page }) => {
    // Assuming there's a customer in the list
    await page.click('[data-testid="customer-actions-menu"]');
    await page.click("text=تعديل");

    // Should open in edit mode
    await expect(page.locator("text=تعديل بيانات العميل")).toBeVisible();

    // Form should be pre-filled
    await expect(page.locator('[name="name"]')).not.toHaveValue("");

    // Update name
    await page.fill('[name="name"]', "اسم محدث");

    // Submit
    await page.click('button[type="submit"]');

    // Should show success
    await expect(page.locator("text=تم تحديث العميل بنجاح")).toBeVisible();
  });
});
