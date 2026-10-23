// All limits below are illustrative values from the blueprint, never a live
// rate card. Both UI preview and server mutations use these same rules.
export const ILLUSTRATIVE_PLANS = [
  { name: "MITRA", volume: 100, departures: 2, users: 3 },
  { name: "STARTER", volume: 300, departures: 5, users: 10 },
  { name: "GROWTH", volume: 1000, departures: 15, users: 25 },
  { name: "SCALE", volume: 3000, departures: 30, users: 50 },
];
const integer = (value, label, min = 0) => {
  if (
    typeof value === "boolean" ||
    value == null ||
    String(value).trim() === ""
  )
    throw Error(`${label} wajib diisi.`);
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < min || n > 10000000)
    throw Error(
      `${label} harus angka bulat ${min ? `minimal ${min}` : "nol atau lebih"}.`,
    );
  return n;
};
const text = (value, max = 160) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
export function qualifyNeeds(data) {
  const organization = text(data.organization);
  if (!organization) throw Error("Nama travel wajib diisi.");
  const module = data.module || "UMRAH_OPERATIONS";
  if (!["UMRAH_OPERATIONS", "HAJJ_SPECIAL", "HAJJ_GUIDANCE"].includes(module))
    throw Error("Modul tidak dikenali.");
  const organizationType = data.organizationType || "PPIU";
  if (!["PPIU", "PARTNER", "PIHK", "KBIHU"].includes(organizationType))
    throw Error("Jenis organisasi tidak dikenali.");
  const hasHistory =
    data.hasHistory === true || data.hasHistory === "yes"
      ? true
      : data.hasHistory === false || data.hasHistory === "no"
        ? false
        : data.ttm !== "" && data.ttm != null;
  const active = integer(data.active ?? 0, "Jamaah aktif"),
    ttm = hasHistory ? integer(data.ttm, "Jamaah TTM") : null;
  const volume = hasHistory ? ttm : active,
    departures = integer(data.departures ?? 0, "Keberangkatan aktif"),
    users = integer(data.users ?? 1, "Pengguna", 1),
    branches = integer(data.branches ?? 1, "Organisasi / cabang", 1);
  const future = module !== "UMRAH_OPERATIONS";
  const matching = ILLUSTRATIVE_PLANS.find(
    (p) => volume <= p.volume && departures <= p.departures && users <= p.users,
  );
  const network = branches > 1 || !matching;
  const snapshot = {
    organization,
    organizationType,
    module,
    hasHistory,
    ttm,
    active,
    departures,
    users,
    branches,
    referral: text(data.referral, 60),
  };
  const reasons = [
    `${volume.toLocaleString("id-ID")} jamaah ${hasHistory ? "terproses dalam 12 bulan terakhir" : "aktif; klasifikasi sementara"}.`,
    `${departures} keberangkatan aktif dan ${users} pengguna.`,
    branches > 1
      ? `${branches} organisasi / cabang memerlukan review jaringan.`
      : "Satu organisasi; kebutuhan lintas tim ditinjau bersama.",
  ];
  if (future)
    reasons.unshift("Modul ini masih roadmap; belum tersedia untuk aktivasi.");
  return {
    ...snapshot,
    snapshot,
    plan: future ? "BELUM TERSEDIA" : network ? "NETWORK" : matching.name,
    provisional: !hasHistory,
    confidence: future
      ? "Belum dapat ditawarkan"
      : hasHistory
        ? "Berdasarkan input TTM simulasi"
        : "Provisional · data aktif",
    manualReview: future || network,
    available: !future,
    volume,
    basis: hasHistory ? "TTM" : "ACTIVE",
    reasons,
    reason: reasons.join(" "),
    officialPrice: null,
    quoteValidDays: 14,
    initialLockDays: 90,
    focus: [
      "Jamaah & dokumen",
      "Kesiapan keberangkatan",
      ...(departures > 1 ? ["Koordinasi banyak keberangkatan"] : []),
      "Verifikasi pembayaran & Money Calendar",
      "Profit Guard",
      ...(branches > 1
        ? ["Review kebutuhan jaringan; aktivasi penuh mengikuti roadmap"]
        : []),
    ],
    note: "Rekomendasi memakai batas ilustratif blueprint. Harga resmi, kapasitas kontrak, dan aktivasi memerlukan konfirmasi.",
  };
}
export function createSubscriptionOrder(db, data) {
  const recommendation = qualifyNeeds(data.needs || {});
  const requestId = text(data.requestId, 80);
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(requestId))
    throw Error(
      "Referensi permintaan tidak valid. Muat ulang langkah pemesanan.",
    );
  if (data.consent !== true)
    throw Error("Persetujuan simulasi pemesanan wajib dicentang.");
  const contact = {
    name: text(data.contact?.name, 100),
    email: text(data.contact?.email, 160),
    phone: text(data.contact?.phone, 30),
    note: text(data.contact?.note, 1000),
  };
  if (!contact.name) throw Error("Nama penanggung jawab wajib diisi.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))
    throw Error("Alamat email tidak valid.");
  if (!/^\+?[\d\s()-]{8,25}$/.test(contact.phone))
    throw Error("Nomor telepon tidak valid.");
  const fingerprint = JSON.stringify({
    needs: recommendation.snapshot,
    contact,
  });
  const existing = (db.subscriptionOrders || []).find(
    (order) => order.requestId === requestId,
  );
  if (existing) {
    if (existing.fingerprint !== fingerprint)
      throw Error(
        "Referensi ini sudah digunakan untuk data berbeda. Mulai simulasi baru.",
      );
    return existing;
  }
  const now = new Date(),
    id = crypto.randomUUID();
  const order = {
    id,
    requestId,
    reference: `AJ-DEMO-${now.toISOString().slice(0, 10).replaceAll("-", "")}-${id.slice(0, 8).toUpperCase()}`,
    status: !recommendation.available
      ? "WAITLIST_DEMO"
      : recommendation.manualReview
        ? "MANUAL_REVIEW_DEMO"
        : "REQUESTED_DEMO",
    organization: recommendation.organization,
    plan: recommendation.plan,
    recommendation,
    contact,
    createdAt: now.toISOString(),
    officialPrice: null,
    paymentStatus: "NOT_REQUESTED",
    simulation: true,
    fingerprint,
  };
  db.subscriptionOrders ||= [];
  db.subscriptionOrders.unshift(order);
  db.audit.unshift({
    id: crypto.randomUUID(),
    actor: "Pengunjung demo",
    action: `Menyimpan pemesanan langganan simulasi · ${order.reference}`,
    time: now.toISOString(),
  });
  return order;
}
