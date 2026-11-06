// Run with Playwright installed and the static preview server running.
// LANDING_URL may point to a different preview server.
const assert = require("node:assert/strict");
const engines = require("playwright");
const browserName = process.env.BROWSER || "chromium";
assert.ok(["chromium", "webkit", "firefox"].includes(browserName));
const url =
  process.env.LANDING_URL ||
  "http://127.0.0.1:8766/prototypes/codle-hub-studio/toy-hub/publisher-kakao-font-preview.html";

async function checkLayout(browser, width, height = 900) {
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(url + "#services");
    await page.waitForFunction(
      () => document.querySelectorAll("#services canvas").length === 4,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `${width}px: horizontal overflow`,
    );
    assert.equal(
      await page.locator("#services .service-grid > section").count(),
      6,
    );
    if (width < 1400 || height <= 800) {
      const clippedActions = await page.locator("#services .tile-actions").evaluateAll((rows) =>
        rows.filter((row) => {
          const card = row.closest(".service-card").getBoundingClientRect();
          return [...row.children].some((button) => {
            const box = button.getBoundingClientRect();
            return box.left < card.left || box.right > card.right || box.bottom > card.bottom;
          });
        }).length,
      );
      assert.equal(clippedActions, 0, `${width}px: clipped card actions`);
    }
    for (const service of [
      "subscription",
      "hackathon",
      "camp",
      "cmass",
      "info",
    ]) {
      const trigger = page.locator(`#services [data-inquiry="${service}"]`);
      // Keyboard focus reveals desktop hover actions too.
      await trigger.focus();
      await trigger.press("Enter");
      const dialog = page.locator("#inquiry-dialog");
      assert.equal(await dialog.evaluate((node) => node.open), true);
      assert.equal(
        await page.locator("#inquiry-interest").inputValue(),
        service,
      );
      await page.keyboard.press("Escape");
      assert.equal(await dialog.evaluate((node) => node.open), false);
      await page.waitForFunction(() => !document.querySelector(".hub-header").inert);
      assert.equal(
        await trigger.evaluate((node) => document.activeElement === node),
        true,
      );
    }
    await page.locator(".hub-header [data-inquiry]").click();
    await page.locator("#school-inquiry-form .inquiry-submit").click();
    assert.equal(
      await page.locator("#inquiry-school").getAttribute("aria-invalid"),
      "true",
    );
    await page.locator("#inquiry-school").fill("테스트 학교");
    await page.locator("#inquiry-contact").fill("테스트 담당자");
    await page.locator("#inquiry-phone").fill("010-1234-5678");
    await page.locator("#school-inquiry-form .inquiry-submit").click();
    assert.equal(await page.locator("#inquiry-review").isVisible(), true);
    await page.locator("#inquiry-edit").click();
    assert.equal(
      await page.locator("#inquiry-school").inputValue(),
      "테스트 학교",
    );
    await page.locator(".close-dialog").click();
    await page.waitForFunction(
      () => !document.querySelector(".hub-header").inert,
    );
    assert.equal(
      await page.locator(".hub-header").evaluate((node) => node.inert),
      false,
    );
    assert.deepEqual(errors, []);
    console.log(`PASS layout + inquiry: ${width}x${height}`);
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await engines[browserName].launch();
  console.log(`Browser: ${browserName}`);
  try {
    for (const width of [320, 390, 700, 701, 768, 1024, 1280, 1399, 1440, 1920])
      await checkLayout(browser, width);
    for (const height of [534, 800, 801]) await checkLayout(browser, 1440, height);
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await page.goto(url + "#services");
    assert.equal(
      await page
        .locator("html")
        .evaluate((node) => node.classList.contains("hub-entry-pending")),
      false,
    );
    // Firefox's automation reload can report "navigate"; use the native reload API.
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.evaluate(() => location.reload()),
    ]);
    await page.waitForFunction(() =>
      document.documentElement.classList.contains("hub-entry-pending"),
    );
    await page.locator(".mondrian-entry__skip").waitFor();
    await page.locator(".mondrian-entry__skip").click();
    await page.waitForFunction(
      () => !document.querySelector(".mondrian-entry"),
    );
    await page.waitForFunction(
      () => !document.querySelector(".hub-header").inert,
    );
    assert.equal(
      await page.locator(".hub-header").evaluate((node) => node.inert),
      false,
    );
    console.log("PASS intro: section link, reload, skip and focus unlock");
    await page.goto(url + "?intro=replay");
    await page.locator(".mondrian-entry").waitFor();
    await page.waitForFunction(
      () => !document.querySelector(".mondrian-entry"),
    );
    assert.equal(
      await page.locator(".hub-header").evaluate((node) => node.inert),
      false,
    );
    assert.equal(await page.locator(".hub-answer").textContent(), "코들에서!");
    console.log("PASS intro: natural completion and card handoff");
    await page.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
