/* eslint-disable @typescript-eslint/no-require-imports -- This is a Node CommonJS browser test runner. */
/* Browser checks against a running local server; no production data is submitted. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const sharp = require("sharp");
const site = require("../src/data/spotless.json");
const routes = require("../docs/research/spotless/routes.json");
const assets = require("../docs/research/spotless/asset-map.json");
const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const screenshots = path.resolve(
  __dirname,
  "../docs/research/spotless/screenshots",
);

(async () => {
  assert.equal(site.articles.length, 10);
  assert.equal(site.products.length, 8);
  for (const local of Object.values(assets)) {
    assert.ok(
      fs.statSync(path.join(__dirname, "../public", local)).size > 0,
      local,
    );
  }
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  // The clone must render from its bundled assets, with no calls to the source backend.
  const external = [];
  await context.route("**/*", async (route) => {
    const address = route.request().url();
    if (
      /^https?:/.test(address) &&
      new URL(address).origin !== new URL(base).origin
    ) {
      external.push(address);
      await route.abort();
    } else await route.continue();
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const routeResults = [];
  const localLinks = new Set();
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: "Chỉ cookie cần thiết", exact: true })
      .click();
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(
      await page.getByLabel("Cài đặt cookie", { exact: true }).count(),
      0,
      "cookie consent persists",
    );

    for (const route of routes) {
      const response = await page.goto(base + encodeURI(decodeURI(route)), {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200, route);
      assert.ok(await page.locator("h1").count(), `Missing heading: ${route}`);
      // Scroll lazy editorial media into view before checking it.
      await page.evaluate(async () => {
        for (const img of document.images) img.loading = "eager";
        await Promise.all(
          Array.from(document.images).map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((resolve) => {
                  img.onload = resolve;
                  img.onerror = resolve;
                }),
          ),
        );
      });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        broken: Array.from(document.images)
          .filter((img) => !img.naturalWidth)
          .map((img) => img.src),
        links: Array.from(document.querySelectorAll("a[href]"))
          .map((a) => a.getAttribute("href"))
          .filter((h) => h.startsWith("/") && !h.startsWith("//")),
      }));
      assert.equal(metrics.overflow, false, `Desktop overflow: ${route}`);
      assert.deepEqual(metrics.broken, [], `Missing images: ${route}`);
      metrics.links.forEach((link) =>
        localLinks.add(link.split(/[?#]/)[0] || "/"),
      );
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `Mobile overflow: ${route}`,
      );
      await page.setViewportSize({ width: 1440, height: 1000 });
      routeResults.push({
        path: route,
        status: response.status(),
        desktop: "pass",
        mobile: "pass",
      });
    }
    for (const href of localLinks) {
      if (/^\/sites\//.test(href)) continue;
      const response = await context.request.get(
        base + encodeURI(decodeURI(href)),
      );
      assert.equal(response.status(), 200, `Internal link: ${href}`);
    }

    await page.goto(base + "/collections/all");
    await page.getByRole("combobox").selectOption("price-ascending");
    await page.waitForURL("**/collections/all?sort_by=price-ascending");
    await page.waitForFunction(
      () =>
        document.querySelector(".product-card h3")?.textContent === "SẠCH COOL",
    );
    await page.goto(base + "/search?q=trimday");
    assert.ok(
      (await page.locator(".product-card").count()) >= 2,
      "search finds products",
    );
    await page.goto(base + "/search?q=khong-co-ket-qua-12345");
    assert.ok(
      await page
        .getByText("Không tìm thấy kết quả.", { exact: false })
        .isVisible(),
      "empty search state",
    );

    await page.goto(base + "/products/trimday-3-0-max");
    await page.getByRole("button", { name: "Xem ảnh 2", exact: true }).click();
    assert.equal(
      await page
        .getByRole("button", { name: "Xem ảnh 2", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page
      .getByRole("button", {
        name: "Phóng to ảnh TRIMDAY® 3.0 MAX",
        exact: true,
      })
      .click();
    assert.ok(await page.getByRole("dialog").isVisible());
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    await page.getByRole("button", { name: "So sánh", exact: true }).click();
    assert.ok(await page.getByRole("dialog").isVisible());
    await page.keyboard.press("Escape");
    const specification = page.locator(".product-accordions details").first();
    await specification.locator("summary").click();
    assert.ok(
      (await specification.innerText()).includes("7000 RPM"),
      "technical details open",
    );
    await page
      .getByRole("button", { name: "Thêm vào giỏ hàng", exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    assert.ok(
      (await dialog.innerText()).includes("750.000₫"),
      "cart uses real price",
    );
    await dialog
      .getByRole("button", {
        name: "Tăng số lượng TRIMDAY® 3.0 MAX",
        exact: true,
      })
      .click();
    assert.ok(
      (await dialog.innerText()).includes("1.500.000₫"),
      "quantity updates total",
    );
    await page.keyboard.press("Escape");
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Giỏ hàng", exact: true }).click();
    dialog = page.getByRole("dialog");
    assert.ok(
      (await dialog.innerText()).includes("1.500.000₫"),
      "cart persists after reload",
    );
    await dialog
      .getByRole("button", { name: "Xóa TRIMDAY® 3.0 MAX", exact: true })
      .click();
    assert.ok(
      await dialog.getByText("Giỏ hàng của bạn đang trống.").isVisible(),
    );
    await page.keyboard.press("Escape");
    await page.goto(base + "/products/trimday-1-0");
    assert.ok(
      await page
        .getByRole("button", { name: "Hết hàng", exact: true })
        .isDisabled(),
      "sold-out product cannot be bought",
    );

    await page.goto(base + "/pages/ho-tro");
    await page
      .getByRole("searchbox", { name: "Tìm câu trả lời" })
      .fill("bao hanh");
    assert.ok(
      (await page.locator(".info-faq-item").count()) > 0,
      "Vietnamese search supports unaccented text",
    );
    const faq = page.locator(".info-faq-item").first();
    await faq.locator("summary").click();
    assert.ok((await faq.getAttribute("open")) !== null, "FAQ opens");
    await page.goto(base + "/pages/tai-khoan");
    await page.getByLabel("Số điện thoại", { exact: true }).fill("0901234567");
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    assert.ok(
      await page.getByRole("status").isVisible(),
      "account clearly explains local status",
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    await page.getByRole("button", { name: "Mở menu", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Máy cạo", exact: true })
      .click();
    await page.waitForURL("**/collections/*");
    assert.equal(
      await page.getByRole("dialog").count(),
      0,
      "mobile navigation closes",
    );

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base);
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(80);
    }
    const forward = await page
      .locator(".scroll-clip video")
      .evaluate((v) => v.currentTime);
    for (let i = 0; i < 4; i++) {
      await page.mouse.wheel(0, -500);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(300);
    const backward = await page
      .locator(".scroll-clip video")
      .evaluate((v) => v.currentTime);
    assert.ok(
      forward > backward,
      `video responds to forward/reverse wheel: ${forward}, ${backward}`,
    );

    for (const [label, route] of [
      ["home", "/"],
      ["product", "/products/trimday-3-0-max"],
      ["collection", "/collections/all"],
      ["support", "/pages/ho-tro"],
      ["about", "/pages/ve-spotless"],
      ["blog", "/blogs/cham-soc-nam-gioi"],
      [
        "article",
        site.articles.find((a) => a.category === "cham-soc-nam-gioi").path,
      ],
    ]) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      await sharp(await page.screenshot())
        .webp({ quality: 70 })
        .toFile(`${screenshots}/local-${label}-desktop-top.webp`);
      await page.setViewportSize({ width: 390, height: 844 });
      await sharp(await page.screenshot())
        .webp({ quality: 70 })
        .toFile(`${screenshots}/local-${label}-mobile-top.webp`);
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    assert.deepEqual(errors, [], "no browser runtime errors");
    assert.deepEqual(external, [], "no external media/backend requests");
    const videoEmbeds = [];
    await page.route("https://www.youtube.com/**", async (route) => {
      videoEmbeds.push(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><title>Embed test</title>",
      });
    });
    await page.goto(
      base + site.articles.find((a) => a.category === "huong-dan-su-dung").path,
    );
    await page.locator(".source-video-button").first().click();
    assert.ok(
      (
        await page.getByRole("dialog").locator("iframe").getAttribute("src")
      ).startsWith("https://www.youtube.com/embed/"),
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await page.getByRole("dialog").count(),
      0,
      "guide video closes",
    );
    const summary = {
      routes: routeResults,
      internalLinks: localLinks.size,
      assets: Object.keys(assets).length,
      articles: site.articles.length,
      browserErrors: errors,
      externalRequests: external,
      interactions: "pass",
      videoEmbeds,
    };
    fs.writeFileSync(
      path.resolve(__dirname, "../docs/research/spotless/verification.json"),
      JSON.stringify(summary, null, 2) + "\n",
    );
    console.log(
      `PASS: ${routeResults.length} routes, ${localLinks.size} internal links, ${summary.assets} assets, desktop/mobile and commerce interactions.`,
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
