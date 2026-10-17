import { test, expect } from "@playwright/test";
test.beforeEach(async ({ request }) => {
  await request.post("/api/reset");
});
test("lead → booking → pending payment → verified DP; persists after reload", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Leads & Booking", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Tambah prospek", exact: true })
    .click();
  await page
    .getByLabel("Nama lengkap", { exact: true })
    .fill("Jamaah Uji Browser");
  await page.getByLabel("Nomor telepon", { exact: true }).fill("081299998888");
  await page
    .getByRole("button", { name: "Tambahkan prospek", exact: true })
    .click();
  const card = page
    .locator(".lead-card")
    .filter({ hasText: "Jamaah Uji Browser" });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Hubungi", exact: true }).click();
  await card.getByRole("button", { name: "Kualifikasi", exact: true }).click();
  await card.getByRole("button", { name: "Booking", exact: true }).click();
  await page.getByLabel("Keberangkatan", { exact: true }).selectOption("dep2");
  await page
    .getByRole("button", { name: "Buat reservasi", exact: true })
    .click();
  let state = await (await page.request.get("/api/state")).json();
  const person = state.people.find((p) => p.name === "Jamaah Uji Browser"),
    booking = state.bookings.find((b) => b.personId === person.id);
  expect(booking.status).toBe("RESERVED");
  await page.getByRole("button", { name: "Keuangan", exact: true }).click();
  await page
    .getByRole("button", { name: "Catat pembayaran", exact: true })
    .click();
  await page
    .getByLabel("Booking jamaah", { exact: true })
    .selectOption(booking.id);
  await page.getByLabel("Nominal (Rp)", { exact: true }).fill("5000000");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Catat pembayaran", exact: true })
    .click();
  const row = page.locator("tr").filter({ hasText: "Jamaah Uji Browser" });
  await expect(row).toContainText("Menunggu verifikasi");
  await row.getByRole("button", { name: "Verifikasi", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Verifikasi", exact: true })
    .click();
  await expect(row).toContainText("Terverifikasi");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Selamat pagi/ }),
  ).toBeVisible();
  state = await (await page.request.get("/api/state")).json();
  expect(state.bookings.find((b) => b.id === booking.id).status).toBe(
    "CONFIRMED",
  );
  expect(state.openingCash).toBe(90000000);
});
test("passport verification resolves source exception; blocked clearance rejects", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Dokumen", exact: true }).click();
  const row = page.locator("tr").filter({ hasText: "Ahmad Fauzi" });
  await row.getByRole("button", { name: "Periksa", exact: true }).click();
  await page.getByLabel("Status pemeriksaan").selectOption("VERIFIED");
  await page.getByLabel("Berlaku paspor sampai").fill("2030-01-01");
  await page.getByRole("button", { name: "Simpan pemeriksaan" }).click();
  await expect(row).toContainText("1 Jan 2030");
  const state = await (await page.request.get("/api/state")).json();
  expect(state.engine.exceptions.some((e) => e.id === "b1-passport")).toBe(
    false,
  );
  await page
    .getByRole("button", { name: "Keberangkatan", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Kelola keberangkatan" })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Periksa & berikan clearance" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Final Clearance ditolak",
  );
});
test("role switching hides finance and restores owner safely", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByLabel("Lihat sebagai peran").selectOption("ops");
  await expect(
    page.getByRole("heading", { name: /Selamat pagi, Dina/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Keuangan", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Lihat sebagai peran").selectOption("owner");
  await expect(
    page.getByRole("button", { name: "Keuangan", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Kas tersedia", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
test("manifest export contains confirmed participants only", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Keberangkatan", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Kelola keberangkatan" })
    .first()
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Manifest", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("arah-jamaah-manifest.csv");
  const stream = await download.createReadStream();
  let csv = "";
  for await (const chunk of stream) csv += chunk;
  expect(csv).toContain("Ahmad Fauzi");
  expect(csv).not.toContain("Rina Wulandari");
});
test("mobile navigation, main pages, images and layout work without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("heading", { name: /Selamat pagi/ }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.getByRole("button", { name: "Buka navigasi" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Buka navigasi" }).click();
  await page.getByRole("button", { name: "Jamaah", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Kenali setiap jamaah." }),
  ).toBeVisible();
  await page.getByPlaceholder("Cari nama jamaah…").fill("Ahmad");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Lihat profil" }).click();
  await expect(
    page.getByRole("heading", { name: "Ahmad Fauzi" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".profile-panel .avatar")).toBeVisible();
  expect(
    await page
      .locator(".profile-panel .avatar")
      .evaluate((i) => i.complete && i.naturalWidth > 0),
  ).toBe(true);
});
test("all modules load and profit simulation changes computed result", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const name of [
    "Tugas & Checklist",
    "Agen Travel",
    "Pengaturan",
    "Laporan & Insight",
  ]) {
    await page
      .getByRole("button", {
        name: name === "Tugas & Checklist" ? /^Tugas & Checklist/ : name,
        exact: true,
      })
      .click();
    await expect(page.locator("main h1")).toBeVisible();
  }
  const result = page.locator(".simulation-result>strong"),
    before = await result.innerText();
  await page.locator("input[type=range]").fill("20");
  await expect(result).not.toHaveText(before);
  await page.getByRole("button", { name: "Keuangan", exact: true }).click();
  await page
    .getByRole("button", { name: "Money Calendar", exact: true })
    .click();
  await expect(
    page.getByRole("img", { name: "Grafik proyeksi saldo kas" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("cancellation and refund are visible with preserved history", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Keuangan", exact: true }).click();
  await page
    .getByRole("button", { name: "Invoice & Piutang", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Batalkan booking Ahmad Fauzi", exact: true })
    .click();
  await page.getByLabel("Alasan pembatalan").fill("Jadwal keluarga berubah");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Batalkan booking", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Credit & Refund", exact: true })
    .click();
  const row = page.locator("tr").filter({ hasText: "Ahmad Fauzi" });
  await expect(row).toContainText("Dibatalkan");
  await row.getByRole("button", { name: "Proses refund" }).click();
  await page
    .getByLabel("Alasan / referensi refund")
    .fill("Transfer dummy dikembalikan");
  const refundResponse = page.waitForResponse(r => r.url().endsWith("/api/action") && r.request().postDataJSON()?.action === "refund");
  await page.getByRole("button", { name: "Konfirmasi refund" }).click();
  expect((await refundResponse).ok()).toBe(true);
  await expect(
    page.locator(".panel").filter({ hasText: "Riwayat refund" }),
  ).toContainText("Transfer dummy dikembalikan");
});
test("uploading a dummy PDF returns document to review", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Dokumen", exact: true }).click();
  await page
    .getByRole("button", { name: "Unggah dokumen Siti Aminah", exact: true })
    .click();
  await page.getByLabel("Jenis dokumen").selectOption("visa");
  await page
    .getByLabel("Pilih berkas dummy")
    .setInputFiles({
      name: "contoh-visa.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 dummy test document"),
    });
  await page.getByRole("button", { name: "Unggah untuk review" }).click();
  await expect(
    page.locator("tr").filter({ hasText: "Siti Aminah" }),
  ).toContainText("Dalam pemeriksaan");
});
