import { test, expect } from "@playwright/test";

test("ページの表示テスト", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page).toHaveTitle(/最初のページ/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Playwrightハンズオン"
  );
  await expect(page.getByRole("button", { name: "操作ボタン" })).toBeVisible();
});
