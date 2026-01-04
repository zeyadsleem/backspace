import { test, expect } from "../fixtures/test-data";

test.describe("Delete Customer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customers");
  });

  test("should show delete button on customer detail", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();

    const deleteButton = page.getByRole("button", { name: /delete/i });
    await expect(deleteButton).toBeVisible();
  });

  test("should show delete confirmation dialog", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();

    const deleteButton = page.getByRole("button", { name: /delete/i });
    await deleteButton.click();

    await expect(page.getByText(/delete customer/i)).toBeVisible();
    await expect(page.getByText(/are you sure you want to delete/i)).toBeVisible();
  });

  test("should delete customer after confirmation", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    const customerName = await firstRow.locator("td").first().textContent();

    await firstRow.click();

    const deleteButton = page.getByRole("button", { name: /delete/i });
    await deleteButton.click();

    await page.getByRole("button", { name: /confirm/i }).click();

    await expect(page.getByText("Customer deleted successfully")).toBeVisible();
    await expect(page).toHaveURL("/customers");

    await page.waitForTimeout(1000);

    if (customerName) {
      await expect(page.getByText(customerName)).not.toBeVisible();
    }
  });

  test("should cancel delete operation", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();

    const deleteButton = page.getByRole("button", { name: /delete/i });
    await deleteButton.click();

    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(page.getByText(/delete customer/i)).not.toBeVisible();
    await expect(page).toHaveURL(/\/customers\/.+/);
  });

  test("should not delete customer when cancelled", async ({ page }) => {
    const firstRow = page.locator("tbody tr").first();
    const customerName = await firstRow.locator("td").first().textContent();

    await firstRow.click();

    const deleteButton = page.getByRole("button", { name: /delete/i });
    await deleteButton.click();

    await page.getByRole("button", { name: /cancel/i }).click();

    await page.waitForTimeout(500);

    if (customerName) {
      await expect(page.getByText(customerName)).toBeVisible();
    }
  });
});
