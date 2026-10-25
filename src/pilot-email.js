import nodemailer from "nodemailer";

const clean = (value = "") => String(value).trim();

function getConfig() {
  const user = clean(process.env.ZOHO_SMTP_USER);
  const pass = clean(process.env.ZOHO_SMTP_PASS);
  const to = clean(process.env.PILOT_EMAIL_TO || user);
  const from = clean(process.env.PILOT_EMAIL_FROM || user);
  const host = clean(process.env.ZOHO_SMTP_HOST || "smtppro.zoho.com");
  const port = Number(process.env.ZOHO_SMTP_PORT || 465);

  if (!user || !pass || !to || !from)
    throw Error("Konfigurasi email Zoho belum lengkap.");

  return { user, pass, to, from, host, port };
}

function buildMessage(order) {
  const recommendation = order.recommendation || {};
  const contact = order.contact || {};
  const createdAt = new Date(order.createdAt).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
  });

  return {
    subject: `[Arah Jamaah] Permintaan Pilot Baru — ${order.plan} — ${order.organization}`,
    text: [
      "PERMINTAAN PILOT BARU — ARAH JAMAAH",
      "",
      `Referensi: ${order.reference}`,
      `Waktu: ${createdAt} WIB`,
      `Status: ${order.status}`,
      "",
      "TRAVEL",
      `Nama travel: ${order.organization}`,
      `Jenis organisasi: ${recommendation.organizationType || "-"}`,
      `Modul: ${recommendation.module || "-"}`,
      `Paket rekomendasi: ${order.plan}`,
      `Jamaah 12 bulan / aktif: ${recommendation.volume ?? "-"}`,
      `Keberangkatan aktif: ${recommendation.departures ?? "-"}`,
      `Pengguna: ${recommendation.users ?? "-"}`,
      `Cabang / organisasi: ${recommendation.branches ?? "-"}`,
      `Referral: ${recommendation.referral || "-"}`,
      "",
      "KONTAK",
      `Nama PIC: ${contact.name || "-"}`,
      `Email: ${contact.email || "-"}`,
      `WhatsApp / telepon: ${contact.phone || "-"}`,
      `Catatan: ${contact.note || "-"}`,
      "",
      "Lead ini tersimpan dari demo Arah Jamaah.",
    ].join("\n"),
    replyTo: contact.email || undefined,
  };
}

export async function sendPilotEmail(order) {
  const config = getConfig();
  const message = buildMessage(order);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: `Arah Jamaah <${config.from}>`,
    to: config.to,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
  });

  return {
    email: "SENT",
    to: config.to,
  };
}
