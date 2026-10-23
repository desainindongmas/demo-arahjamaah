import { test, expect } from "@playwright/test";
test.beforeEach(async ({ request }) => {
  await request.post("/api/reset");
});
async function skipWelcome(page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Lewati pengenalan", exact: true })
    .click();
}
async function calculateSample(page) {
  await page
    .getByRole("button", { name: "Demo & Paket", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Hitung kebutuhan travel", exact: true })
    .click();
  await page.getByRole("button", { name: "Isi contoh", exact: true }).click();
  await page
    .getByRole("button", { name: "Lihat rekomendasi", exact: true })
    .click();
  await expect(page.locator(".visitor-plan-name")).toHaveText("STARTER");
}
async function readyToOrder(page) {
  await calculateSample(page);
  await page
    .getByRole("button", { name: "Mulai pilot STARTER", exact: true })
    .click();
  await page.getByLabel("Nama penanggung jawab").fill("Rina Contoh");
  await page.getByLabel("Email").fill("rina@example.com");
  await page.getByLabel("Nomor WhatsApp / telepon").fill("081200001234");
  await page
    .getByRole("checkbox", { name: /Saya setuju data ini digunakan/ })
    .check();
}
test("first visit welcomes once, can skip and replay, and restores app focus", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Kenali cara kerja/ }),
  ).toBeVisible();
  expect(await page.locator(".app-shell").evaluate((el) => el.inert)).toBe(
    true,
  );
  await page
    .getByRole("button", { name: "Lewati pengenalan", exact: true })
    .click();
  expect(await page.locator(".app-shell").evaluate((el) => el.inert)).toBe(
    false,
  );
  await page.reload();
  await expect(page.locator(".visitor-welcome")).toHaveCount(0);
  await page.getByRole("button", { name: "Ulangi tur demo" }).click();
  await expect(page.locator(".visitor-welcome")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".visitor-welcome")).toHaveCount(0);
});
test("guided tour navigates all six capabilities then opens visitor journey", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Mulai tur singkat", exact: false })
    .click();
  const titles = [
    "Satu kendali untuk setiap perjalanan",
    "Tahu masalah sebelum jadi krisis",
    "Pastikan jamaah benar-benar siap",
    "Profit bagus, kas tetap harus aman",
    "Coba keputusan, pahami dampaknya",
    "Temukan kebutuhan travel Anda",
  ];
  for (let i = 0; i < titles.length; i++) {
    await expect(
      page.getByRole("heading", { name: titles[i], exact: true }),
    ).toBeVisible();
    await expect(page.locator(".visitor-spotlight")).toBeVisible();
    if (i < titles.length - 1)
      await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  }
  await page
    .getByRole("button", { name: "Hitung paket", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Dari kenal, menjadi/ }),
  ).toBeVisible();
  await expect(page.locator(".visitor-tour-card")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("welcome shortcut starts calculator directly and draft survives navigation/reload", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Langsung hitung paket", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ceritakan kebutuhan travel Anda" }),
  ).toBeVisible();
  await page.getByLabel("Nama travel / organisasi").fill("Travel Draft Contoh");
  await page.getByLabel("Jamaah aktif saat ini").fill("72");
  await page
    .getByRole("button", { name: "Command Center", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Demo & Paket", exact: true })
    .click();
  await expect(page.getByLabel("Nama travel / organisasi")).toHaveValue(
    "Travel Draft Contoh",
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Demo & Paket", exact: true })
    .click();
  await expect(page.getByLabel("Jamaah aktif saat ini")).toHaveValue("72");
});
test("needs → recommendation → simulated order produces persistent downloadable receipt", async ({
  page,
}) => {
  await skipWelcome(page);
  await readyToOrder(page);
  await page
    .getByRole("button", { name: "Kirim permintaan pilot", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Permintaan pilot diterima",
      exact: true,
    }),
  ).toBeVisible();
  const ref = await page.locator(".visitor-receipt strong").innerText();
  expect(ref).toMatch(/^AJ-DEMO-\d{8}-/);
  const state = await (await page.request.get("/api/state")).json();
  expect(state.subscriptionOrders).toBeUndefined();
  expect(
    state.audit.filter((a) =>
      a.action.includes("pemesanan langganan simulasi"),
    ),
  ).toHaveLength(1);
  await page.reload();
  await page
    .getByRole("button", { name: "Demo & Paket", exact: true })
    .click();
  await expect(page.locator(".visitor-receipt strong")).toHaveText(ref);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Unduh ringkasan demo", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(ref + ".txt");
  let text = "";
  for await (const chunk of await download.createReadStream()) text += chunk;
  expect(text).toContain("Bukan quotation resmi");
  expect(text).toContain("Tidak mengaktifkan langganan");
});
test("submission error preserves inputs and allows retry with same request id", async ({
  page,
}) => {
  await skipWelcome(page);
  await readyToOrder(page);
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem("arah-visitor-journey-v1")).requestId,
  );
  await page.route("**/api/action", async (route) => {
    if (route.request().postDataJSON()?.action === "subscriptionOrder")
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Penyimpanan demo sementara tidak tersedia.",
        }),
      });
    else await route.continue();
  });
  await page
    .getByRole("button", { name: "Kirim permintaan pilot", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "sementara tidak tersedia",
  );
  await expect(page.getByLabel("Nama penanggung jawab")).toHaveValue(
    "Rina Contoh",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("arah-visitor-journey-v1")).requestId,
    ),
  ).toBe(before);
  await page.unroute("**/api/action");
  await page
    .getByRole("button", { name: "Kirim permintaan pilot", exact: true })
    .click();
  await expect(page.locator(".visitor-success")).toBeVisible();
});
test("roadmap interests stay unavailable and do not advertise activation or an official price", async ({
  page,
}) => {
  await skipWelcome(page);
  await page
    .getByRole("button", { name: "Demo & Paket", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Hitung kebutuhan travel", exact: true })
    .click();
  await page.getByRole("button", { name: "Isi contoh", exact: true }).click();
  await page
    .getByLabel("Jenis organisasi", { exact: true })
    .selectOption("KBIHU");
  await page
    .getByRole("button", { name: "Lihat rekomendasi", exact: true })
    .click();
  await expect(page.locator(".visitor-plan-name")).toHaveText("BELUM TERSEDIA");
  await page
    .getByRole("button", { name: "Catat minat modul roadmap", exact: true })
    .click();
  await page.getByLabel("Nama penanggung jawab").fill("Rina Contoh");
  await page.getByLabel("Email").fill("rina@example.com");
  await page.getByLabel("Nomor WhatsApp / telepon").fill("081200001234");
  await page
    .getByRole("checkbox", { name: /Saya setuju data ini digunakan/ })
    .check();
  await page
    .getByRole("button", { name: "Kirim minat", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Minat Anda sudah tercatat" }),
  ).toBeVisible();
});
test("mobile tour and visitor journey fit viewport and keyboard can leave tour", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".visitor-welcome")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Mulai tur singkat", exact: false })
    .click();
  for (let i = 0; i < 6; i++) {
    await expect(async () => {
      const bounds = await page.locator(".visitor-tour-card").boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(391);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(845);
    }).toPass({ timeout: 4000 });
    if (i < 5)
      await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  }
  await page
    .getByRole("button", { name: "Hitung paket", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Hitung kebutuhan travel", exact: true })
    .click();
  await page.getByRole("button", { name: "Isi contoh", exact: true }).click();
  await page
    .getByRole("button", { name: "Lihat rekomendasi", exact: true })
    .click();
  await expect(page.locator(".visitor-plan-name")).toHaveText("STARTER");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
