import { test, expect } from "../fixtures/test-data";

test.describe("Update Customer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customers");
  });

  test("should navigate to customer detail page", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();

    await expect(page).toHaveURL(/\/customers\/.+/);
    await expect(page.getByText(/customer details/i)).toBeVisible();
  });

  test("should open edit customer dialog", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();

    const editButton = page.getByRole("button", { name: /edit/i });
    await editButton.click();

    await expect(page.getByText(/edit customer/i)).toBeVisible();
  });

  test("should update customer information", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();

    const editButton = page.getByRole("button", { name: /edit/i });
    await editButton.click();

    const updatedName = "Updated Customer Name";
    await page.getByLabel(/name/i).clear();
    await page.getByLabel(/name/i).fill(updatedName);

    await page.getByRole("button", { name: /save/i }).click();

    await expect(page.getByText("Customer updated successfully")).toBeVisible();
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test("should validate required fields on update", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();

    const editButton = page.getByRole("button", { name: /edit/i });
    await editButton.click();

    await page.getByLabel(/name/i).clear();
    await page.getByRole("button", { name: /save/i }).click();

    await expect(page.getByText(/name is required/i)).toBeVisible();
  });

  test("should cancel update", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();

    const editButton = page.getByRole("button", { name: /edit/i });
    await editButton.click();

    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(page.getByText(/edit customer/i)).not.toBeVisible();
  });

  test("should reflect changes in list view", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();

    const editButton = page.getByRole("button", { name: /edit/i });
    await editButton.click();

    const updatedName = "Updated in List";
    await page.getByLabel(/name/i).clear();
    await page.getByLabel(/name/i).fill(updatedName);

    await page.getByRole("button", { name: /save/i }).click();

    await page.waitForTimeout(1000);
    await page.goBack();

    await expect(page.getByText(updatedName)).toBeVisible();
  });
});
