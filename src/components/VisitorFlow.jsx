import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Play,
  Users,
  Plane,
  Wallet,
  FolderCheck,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Calculator,
  Building2,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  Info,
  RotateCcw,
  Sparkles,
  Lock,
} from "lucide-react";
import { JOURNEY_KEY, readLocal, writeLocal } from "../browser-storage.js";
import { qualifyNeeds, ILLUSTRATIVE_PLANS } from "../commercial.js";
import "./visitor.css";
const stages = [
  "Kenali alurnya",
  "Hitung kebutuhan",
  "Rekomendasi",
  "Pemesanan",
  "Selesai",
];
const initialNeeds = {
  organization: "",
  organizationType: "PPIU",
  module: "UMRAH_OPERATIONS",
  hasHistory: "no",
  ttm: "",
  active: "50",
  departures: "2",
  users: "3",
  branches: "1",
  referral: "",
};
const initialContact = { name: "", email: "", phone: "", note: "" };
const modules = {
  UMRAH_OPERATIONS: "Operasional Umroh",
  HAJJ_SPECIAL: "Haji Khusus · Roadmap",
  HAJJ_GUIDANCE: "Bimbingan Haji · Roadmap",
};
const statusLabels = {
  REQUESTED_DEMO: "Permintaan pilot diterima",
  MANUAL_REVIEW_DEMO: "Permintaan Anda perlu ditinjau",
  WAITLIST_DEMO: "Minat Anda sudah tercatat",
};
const TEAM_WHATSAPP = "6285952839393";
const TEAM_EMAIL = "admin3@desainindongmas.my.id";
function restoredDraft() {
  const value = readLocal(JOURNEY_KEY);
  if (value?.version !== 1)
    return {
      step: 0,
      needs: initialNeeds,
      contact: initialContact,
      recommendation: null,
      receipt: null,
      consent: false,
      requestId: crypto.randomUUID(),
    };
  let recommendation = null;
  try {
    if (value.recommendation)
      recommendation = qualifyNeeds({ ...initialNeeds, ...value.needs });
  } catch {}
  return {
    step:
      Number.isInteger(value.step) && value.step >= 0 && value.step <= 4
        ? value.step >= 2 && !recommendation
          ? 1
          : value.step === 4 && !value.receipt
            ? 3
            : value.step
        : 0,
    needs: { ...initialNeeds, ...value.needs },
    contact: { ...initialContact, ...value.contact },
    recommendation,
    receipt: value.receipt?.simulation ? value.receipt : null,
    consent: !!value.consent,
    requestId: /^[a-zA-Z0-9_-]{16,80}$/.test(value.requestId)
      ? value.requestId
      : crypto.randomUUID(),
  };
}
export default function VisitorFlow({
  role,
  routeStep,
  onNavigate,
  onStartTour,
  onNotice,
}) {
  const [draft, setDraft] = useState(restoredDraft),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const { step, needs, contact, recommendation: r, receipt, consent } = draft;
  const heading = useRef(null),
    submitting = useRef(false),
    route = useRef(routeStep);
  useEffect(() => {
    if (route.current === 1) setDraft((d) => ({ ...d, step: 1 }));
    const referral = new URLSearchParams(window.location.search).get("ref");
    if (referral)
      setDraft((d) => ({
        ...d,
        needs: {
          ...d.needs,
          referral: d.needs.referral || referral.slice(0, 60),
        },
      }));
    route.current = undefined;
  }, []);
  useEffect(() => {
    writeLocal(JOURNEY_KEY, { ...draft, version: 1 });
  }, [draft]);
  useEffect(() => {
    setError("");
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [step]);
  const go = (next) => setDraft((d) => ({ ...d, step: next }));
  const updateNeeds = (key, value) => {
    setError("");
    setDraft((d) => ({
      ...d,
      needs: {
        ...d.needs,
        [key]: value,
        ...(key === "organizationType"
          ? {
              module:
                value === "KBIHU"
                  ? "HAJJ_GUIDANCE"
                  : value === "PIHK"
                    ? "HAJJ_SPECIAL"
                    : "UMRAH_OPERATIONS",
            }
          : {}),
      },
      recommendation: null,
      receipt: null,
      consent: false,
      requestId: crypto.randomUUID(),
    }));
  };
  const call = async (action, data) => {
    const res = await fetch("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-demo-role": role },
      body: JSON.stringify({ action, data }),
    });
    const body = await res.json();
    if (!res.ok) throw Error(body.error || "Permintaan belum dapat diproses.");
    return body.result;
  };
  const calculate = async (ev) => {
    ev.preventDefault();
    if (submitting.current) return;
    try {
      qualifyNeeds(needs);
      submitting.current = true;
      setBusy(true);
      setError("");
      const result = await call("calculateNeeds", needs);
      if (!result?.snapshot || !result.plan)
        throw Error("Hasil perhitungan belum tersedia. Coba lagi.");
      setDraft((d) => ({
        ...d,
        recommendation: result,
        step: 2,
        receipt: null,
        requestId: crypto.randomUUID(),
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  const submit = async (ev) => {
    ev.preventDefault();
    if (submitting.current) return;
    setError("");
    if (!consent) {
      setError("Centang persetujuan kontak terlebih dahulu.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const result = await call("subscriptionOrder", {
        needs: r.snapshot,
        contact,
        consent: true,
        requestId: draft.requestId,
      });
      if (!result?.simulation || !result.reference)
        throw Error(
          "Permintaan pilot belum dapat dikonfirmasi. Coba lagi dengan referensi yang sama.",
        );

      setDraft((d) => ({ ...d, receipt: result, step: 4 }));
      onNotice("Permintaan pilot berhasil tersimpan. Tim Arah Jamaah dapat menindaklanjuti data ini.");
    } catch (e) {
      setError(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  const sampleNeeds = () => {
    setError("");
    setDraft((d) => ({
      ...d,
      needs: {
        ...initialNeeds,
        organization: "Safa Amanah Travel (Demo)",
        hasHistory: "yes",
        ttm: "280",
        active: "85",
        departures: "4",
        users: "8",
      },
      recommendation: null,
      receipt: null,
      requestId: crypto.randomUUID(),
    }));
  };
  const exportReceipt = () => {
    const text = [
      "ARAH JAMAAH — RINGKASAN PERMINTAAN PILOT",
      `Referensi: ${receipt.reference}`,
      `Status: ${statusLabels[receipt.status]}`,
      `Travel: ${receipt.organization}`,
      `Paket rekomendasi: ${receipt.plan}`,
      `Modul: ${modules[receipt.recommendation.module]}`,
      `Kontak: ${receipt.contact.name} / ${receipt.contact.email}`,
      `Waktu: ${new Date(receipt.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`,
      "Harga resmi dikonfirmasi oleh Tim Arah Jamaah sebelum aktivasi.",
      "Permintaan pilot bukan tagihan dan tidak memproses pembayaran otomatis.",
      `Kontak Tim Arah Jamaah: WhatsApp 085952839393 · ${TEAM_EMAIL}`,
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    a.download = `${receipt.reference}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const reset = () => {
    setDraft({
      step: 1,
      needs: initialNeeds,
      contact: initialContact,
      recommendation: null,
      receipt: null,
      consent: false,
      requestId: crypto.randomUUID(),
    });
    setError("");
  };
  return (
    <div className="visitor-flow">
      <div className="visitor-flow-heading" ref={heading} tabIndex={-1}>
        <div>
          <span className="visitor-eyebrow">
            <Compass size={15} />
            JELAJAH ARAH JAMAAH
          </span>
          <h1>
            Dari kenal, menjadi <em>lebih terarah.</em>
          </h1>
          <p>
            Kenali alur kerja, coba kapabilitasnya, lalu temukan kebutuhan
            platform untuk travel Anda.
          </p>
        </div>
        <button className="button" onClick={onStartTour}>
          <Play size={15} />
          Ulangi tur singkat
        </button>
      </div>
      <ol
        className="visitor-stepper"
        aria-label="Tahapan berlangganan simulasi"
      >
        {stages.map((name, i) => (
          <li
            key={name}
            className={i === step ? "current" : i < step ? "complete" : ""}
          >
            <button
              disabled={busy || i > step || (step === 4 && i !== 4)}
              aria-current={i === step ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span>{i < step ? <Check size={14} /> : i + 1}</span>
              <b>{name}</b>
            </button>
          </li>
        ))}
      </ol>
      <div className="visitor-simulation-ribbon">
        <Info size={16} />
        <span>
          Data aplikasi adalah simulasi. Kalkulator paket dan permintaan pilot
          menggunakan data yang Anda isi agar Tim Arah Jamaah dapat menindaklanjuti.
        </span>
      </div>
      {error && (
        <div className="visitor-error" role="alert">
          <ShieldAlert size={18} />
          {error}
        </div>
      )}
      {step === 0 && (
        <>
          <section className="visitor-flow-hero">
            <div>
              <span className="visitor-eyebrow">
                SATU PLATFORM. SETIAP AMANAH.
              </span>
              <h2>
                Kelola perjalanan.
                <br />
                Pahami bisnisnya.
              </h2>
              <p>
                Bukan sekadar mencatat jamaah. Lihat apa yang perlu dibereskan,
                siapa yang bertanggung jawab, dan bagaimana dampaknya ke kas
                serta profit.
              </p>
              <div className="visitor-hero-actions">
                <button className="button primary" onClick={() => go(1)}>
                  Hitung kebutuhan travel
                  <Calculator size={17} />
                </button>
                <button className="visitor-text-link" onClick={onStartTour}>
                  <Play size={15} />
                  Lihat tur fitur
                </button>
              </div>
              <small>
                <Clock size={13} />
                Sekitar 3 menit · tanpa pembayaran
              </small>
            </div>
            <div className="visitor-hero-visual">
              <div className="visitor-live-card">
                <span>
                  <i />
                  SIMULASI KENDALI PERJALANAN
                </span>
                <div>
                  <ShieldCheck size={24} />
                  <b>
                    Siap. Aman.
                    <br />
                    Kas dan margin terjaga.
                  </b>
                </div>
                <div className="visitor-mini-metrics">
                  <span>
                    <Users size={16} />
                    Jamaah
                  </span>
                  <span>
                    <Wallet size={16} />
                    Arus kas
                  </span>
                  <span>
                    <TrendingUp size={16} />
                    Profit
                  </span>
                </div>
              </div>
            </div>
          </section>
          <section className="panel visitor-workflow">
            <div className="section-title">
              <div>
                <h2>Begini alur penggunaan sehari-hari</h2>
                <p>
                  Data mengalir antartim. Status dan angka mengikuti perubahan
                  pada sumbernya.
                </p>
              </div>
              <span className="visitor-small-label">
                ALUR OPERASIONAL UMROH
              </span>
            </div>
            <div className="visitor-operations-grid">
              {[
                [
                  Users,
                  "01",
                  "Tangkap prospek",
                  "Catat minat, sumber, dan tindak lanjut calon jamaah.",
                  "leads",
                  "sales",
                ],
                [
                  Plane,
                  "02",
                  "Reservasi kursi",
                  "Buat booking dengan hold 48 jam dan kapasitas yang terjaga.",
                  "leads",
                  "sales",
                ],
                [
                  Wallet,
                  "03",
                  "Verifikasi pembayaran",
                  "DP baru mengonfirmasi booking setelah pembayaran terverifikasi.",
                  "finance",
                  "finance",
                ],
                [
                  FolderCheck,
                  "04",
                  "Siapkan jamaah",
                  "Periksa dokumen, visa, kamar, dan tugas operasional.",
                  "documents",
                  "ops",
                ],
                [
                  ShieldCheck,
                  "05",
                  "Berikan clearance",
                  "Lunas tidak otomatis siap. Blocker tetap harus diselesaikan.",
                  "departures",
                  "ops",
                ],
                [
                  TrendingUp,
                  "06",
                  "Kendalikan & tutup",
                  "Pantau kas dan margin, lalu lakukan closing serta rekonsiliasi.",
                  "reports",
                  "finance",
                ],
              ].map(([Icon, n, title, desc, page, area]) => (
                <article key={n}>
                  <div>
                    <span className="visitor-workflow-icon">
                      <Icon size={21} />
                    </span>
                    <small>{n}</small>
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <button
                    className="visitor-text-link"
                    onClick={() =>
                      onNavigate(
                        (page === "finance" || page === "reports") &&
                          !["owner", "finance"].includes(role)
                          ? "dashboard"
                          : page,
                      )
                    }
                  >
                    Lihat di demo
                    <ArrowRight size={14} />
                  </button>
                </article>
              ))}
            </div>
          </section>
          <div className="visitor-discovery-grid">
            {[
              [
                ShieldCheck,
                "READY",
                "Buka keberangkatan dan telusuri penyebab status readiness.",
                "departures",
              ],
              [
                ShieldAlert,
                "SAFE",
                "Coba perbaiki paspor yang berisiko; lihat exception dihitung ulang.",
                "documents",
              ],
              [
                Wallet,
                "CASH-SAFE",
                "Bandingkan saldo kas aktual dengan forecast dan jatuh tempo.",
                "finance",
              ],
              [
                TrendingUp,
                "PROFITABLE",
                "Ubah diskon di simulator dan lihat dampaknya pada margin.",
                "reports",
              ],
            ].map(([Icon, title, desc, page]) => (
              <button
                className="visitor-discovery-card"
                key={title}
                onClick={() =>
                  onNavigate(
                    (page === "finance" || page === "reports") &&
                      !["owner", "finance"].includes(role)
                      ? "dashboard"
                      : page,
                    page === "finance" ? "calendar" : undefined,
                  )
                }
              >
                <Icon size={24} />
                <b>{title}</b>
                <p>{desc}</p>
                <span>
                  Coba sekarang
                  <ArrowUpRightIcon />
                </span>
              </button>
            ))}
          </div>
          <div className="visitor-bottom-cta">
            <div>
              <h2>Sudah melihat gambaran besarnya?</h2>
              <p>
                Gunakan data operasional untuk menemukan rekomendasi kebutuhan
                travel.
              </p>
            </div>
            <button className="button primary" onClick={() => go(1)}>
              Lanjut hitung kebutuhan
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
      {step === 1 && (
        <div className="visitor-two-columns">
          <section className="panel visitor-form-panel">
            <div className="section-title">
              <div>
                <h2>Ceritakan kebutuhan travel Anda</h2>
                <p>
                  Pakai volume aktual. Travel baru bisa mulai dari data jamaah
                  aktif.
                </p>
              </div>
              <button
                className="visitor-text-link"
                type="button"
                onClick={sampleNeeds}
              >
                <Sparkles size={14} />
                Isi contoh
              </button>
            </div>
            <form onSubmit={calculate}>
              <div className="form-grid">
                <label className="full">
                  Nama travel / organisasi
                  <input
                    required
                    maxLength={160}
                    value={needs.organization}
                    onChange={(e) =>
                      updateNeeds("organization", e.target.value)
                    }
                    placeholder="Contoh: Safa Amanah Travel"
                  />
                </label>
                <label>
                  Jenis organisasi
                  <select
                    aria-label="Jenis organisasi"
                    value={needs.organizationType}
                    onChange={(e) =>
                      updateNeeds("organizationType", e.target.value)
                    }
                  >
                    <option value="PPIU">Travel Umroh / PPIU</option>
                    <option value="PARTNER">Mitra travel</option>
                    <option value="PIHK">PIHK · Haji Khusus</option>
                    <option value="KBIHU">KBIHU · Bimbingan Haji</option>
                  </select>
                </label>
                <label>
                  Modul yang diminati
                  <select
                    aria-label="Modul yang diminati"
                    value={needs.module}
                    onChange={(e) => updateNeeds("module", e.target.value)}
                  >
                    {Object.entries(modules).map(([value, name]) => (
                      <option key={value} value={value}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <fieldset className="visitor-history-field full">
                  <legend>
                    Sudah punya data operasional 12 bulan terakhir?
                  </legend>
                  <label>
                    <input
                      type="radio"
                      name="history"
                      value="yes"
                      checked={needs.hasHistory === "yes"}
                      onChange={() => updateNeeds("hasHistory", "yes")}
                    />
                    Sudah, gunakan data TTM
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="history"
                      value="no"
                      checked={needs.hasHistory === "no"}
                      onChange={() => updateNeeds("hasHistory", "no")}
                    />
                    Belum, gunakan data aktif
                  </label>
                  <small>
                    TTM = jamaah yang benar-benar diproses dalam 12 bulan
                    terakhir, bukan target masa depan.
                  </small>
                </fieldset>
                {needs.hasHistory === "yes" && (
                  <label>
                    Jamaah terproses 12 bulan terakhir
                    <input
                      type="number"
                      min="0"
                      max="10000000"
                      required
                      value={needs.ttm}
                      onChange={(e) => updateNeeds("ttm", e.target.value)}
                    />
                  </label>
                )}
                <label>
                  Jamaah aktif saat ini
                  <input
                    type="number"
                    min="0"
                    max="10000000"
                    required
                    value={needs.active}
                    onChange={(e) => updateNeeds("active", e.target.value)}
                  />
                </label>
                <label>
                  Keberangkatan aktif
                  <input
                    type="number"
                    min="0"
                    max="10000000"
                    required
                    value={needs.departures}
                    onChange={(e) => updateNeeds("departures", e.target.value)}
                  />
                </label>
                <label>
                  Pengguna yang membutuhkan akses
                  <input
                    type="number"
                    min="1"
                    max="10000000"
                    required
                    value={needs.users}
                    onChange={(e) => updateNeeds("users", e.target.value)}
                  />
                </label>
                <label>
                  Jumlah organisasi / cabang
                  <input
                    type="number"
                    min="1"
                    max="10000000"
                    required
                    value={needs.branches}
                    onChange={(e) => updateNeeds("branches", e.target.value)}
                  />
                  <small>
                    Isi 1 bila hanya satu organisasi. Struktur jaringan
                    memerlukan review.
                  </small>
                </label>
                {needs.referral && (
                  <div className="visitor-referral-note full">
                    Referral partner tersimpan otomatis.
                  </div>
                )}
              </div>
              <div className="visitor-form-actions">
                <button
                  className="button"
                  type="button"
                  disabled={busy}
                  onClick={() => go(0)}
                >
                  <ArrowLeft size={15} />
                  Kembali
                </button>
                <button
                  className="button primary"
                  disabled={busy}
                  type="submit"
                >
                  {busy ? "Menghitung…" : "Lihat rekomendasi"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </section>
          <aside className="visitor-flow-aside">
            <div className="visitor-advice">
              <Calculator size={26} />
              <h3>Skala operasional, bukan tebakan.</h3>
              <p>
                Rekomendasi mempertimbangkan jamaah, keberangkatan, pengguna,
                dan kompleksitas jaringan.
              </p>
              <ul>
                <li>Data TTM tersedia: gunakan volume aktual.</li>
                <li>Travel baru: rekomendasi provisional dari data aktif.</li>
                <li>Struktur jaringan: perlu peninjauan khusus.</li>
              </ul>
            </div>
            <div className="visitor-aside-note">
              <Lock size={18} />
              <p>
                Angka tier adalah ilustrasi blueprint. Harga resmi belum
                ditetapkan; tidak ada tagihan dari perhitungan ini.
              </p>
            </div>
            <button className="visitor-text-link" onClick={() => go(0)}>
              <Compass size={15} />
              Lihat kembali alur penggunaan
            </button>
          </aside>
        </div>
      )}
      {step === 2 && r && (
        <>
          <div className="visitor-two-columns">
            <section className="panel visitor-recommendation">
              <div className="visitor-recommendation-head">
                <span className="visitor-eyebrow">
                  HASIL PERHITUNGAN KEBUTUHAN
                </span>
                <span
                  className={`visitor-result-badge ${r.manualReview ? "review" : ""}`}
                >
                  {r.manualReview
                    ? "Perlu review"
                    : r.provisional
                      ? "Provisional"
                      : "Data TTM"}
                </span>
              </div>
              <h2>{r.organization}</h2>
              <p className="visitor-recommendation-intro">
                {r.available
                  ? "Rekomendasi kelas kebutuhan ilustratif"
                  : "Modul yang Anda minati masih dalam roadmap"}
              </p>
              <strong className="visitor-plan-name">{r.plan}</strong>
              <p className="visitor-plan-description">{r.confidence}</p>
              <div className="visitor-recommendation-stats">
                <span>
                  <b>{r.volume.toLocaleString("id-ID")}</b>Jamaah{" "}
                  {r.basis === "TTM" ? "TTM" : "aktif"}
                </span>
                <span>
                  <b>{r.departures}</b>Keberangkatan
                </span>
                <span>
                  <b>{r.users}</b>Pengguna
                </span>
                <span>
                  <b>{r.branches}</b>Organisasi
                </span>
              </div>
              <h3>Kenapa rekomendasi ini?</h3>
              <ul className="visitor-reasons">
                {r.reasons.map((reason) => (
                  <li key={reason}>
                    <CheckCircle2 size={16} />
                    {reason}
                  </li>
                ))}
              </ul>
              <div className="visitor-price-note">
                <Info size={19} />
                <div>
                  <b>Paket direkomendasikan berdasarkan skala operasional</b>
                  <p>
                    Harga resmi dan scope pilot dikonfirmasi Tim Arah Jamaah
                    sebelum aktivasi berbayar dimulai.
                  </p>
                </div>
              </div>
              <div className="visitor-form-actions">
                <button className="button" onClick={() => go(1)}>
                  <ArrowLeft size={15} />
                  Ubah kebutuhan
                </button>
                <button className="button primary" onClick={() => go(3)}>
                  {r.available
                    ? `Mulai pilot ${r.plan}`
                    : "Kirim minat modul roadmap"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
            <aside className="visitor-flow-aside">
              <div className="visitor-advice">
                <Compass size={25} />
                <h3>Fokus demo untuk travel Anda</h3>
                <ul>
                  {r.focus.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button
                  className="button wide"
                  onClick={() => onNavigate("dashboard")}
                >
                  Coba di Command Center
                  <ArrowRight size={15} />
                </button>
              </div>
              <div className="visitor-aside-note">
                <Clock size={18} />
                <p>
                  Quote resmi, bila tersedia, berlaku 14 hari. Initial price
                  lock 90 hari mengikuti kebijakan aktivasi; review dilakukan
                  kuartalan.
                </p>
              </div>
            </aside>
          </div>
          <details className="panel visitor-plan-details">
            <summary>
              Lihat dasar klasifikasi ilustratif
              <ChevronRight size={16} />
            </summary>
            <p>
              Rekomendasi memilih kelas yang mencakup volume, departure, dan
              pengguna. Data jaringan atau kebutuhan di atas batas memerlukan
              review. Seluruh batas di bawah belum menjadi rate card resmi.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>KELAS ILUSTRATIF</th>
                    <th>JAMAAH TTM / AKTIF</th>
                    <th>KEBERANGKATAN</th>
                    <th>PENGGUNA</th>
                  </tr>
                </thead>
                <tbody>
                  {ILLUSTRATIVE_PLANS.map((p) => (
                    <tr key={p.name}>
                      <td>{p.name}</td>
                      <td>≤ {p.volume.toLocaleString("id-ID")}</td>
                      <td>≤ {p.departures}</td>
                      <td>≤ {p.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
      {step === 3 && r && (
        <div className="visitor-two-columns">
          <section className="panel visitor-form-panel">
            <div className="section-title">
              <div>
                <h2>
                  {r.available
                    ? `Mulai pilot ${r.plan}`
                    : "Catat minat untuk modul mendatang"}
                </h2>
                <p>
                  Lengkapi kontak agar Tim Arah Jamaah dapat menindaklanjuti kebutuhan Anda.
                </p>
              </div>
              <span className="visitor-small-label">DITINJAU TIM ARAH JAMAAH</span>
            </div>
            <form onSubmit={submit}>
              <div className="form-grid">
                <label className="full">
                  Nama penanggung jawab
                  <input
                    required
                    maxLength={100}
                    autoComplete="off"
                    value={contact.name}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        contact: { ...d.contact, name: e.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    required
                    maxLength={160}
                    autoComplete="off"
                    placeholder="nama@example.com"
                    value={contact.email}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        contact: { ...d.contact, email: e.target.value },
                      }))
                    }
                  />
                </label>
                <label>
                  Nomor WhatsApp / telepon
                  <input
                    type="tel"
                    required
                    maxLength={30}
                    autoComplete="off"
                    placeholder="081200001234"
                    value={contact.phone}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        contact: { ...d.contact, phone: e.target.value },
                      }))
                    }
                  />
                </label>
                <label className="full">
                  Catatan kebutuhan (opsional)
                  <textarea
                    maxLength={1000}
                    rows={3}
                    value={contact.note}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        contact: { ...d.contact, note: e.target.value },
                      }))
                    }
                  />
                </label>
              </div>
              <label className="visitor-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, consent: e.target.checked }))
                  }
                />
                <span>
                  Saya setuju data ini digunakan Tim Arah Jamaah untuk menghubungi saya terkait pilot dan penawaran. Tidak ada pembayaran otomatis dari formulir ini.
                </span>
              </label>
              <div className="visitor-form-actions">
                <button
                  className="button"
                  type="button"
                  disabled={busy}
                  onClick={() => go(2)}
                >
                  <ArrowLeft size={15} />
                  Kembali
                </button>
                <button
                  className="button primary"
                  disabled={busy}
                  type="submit"
                >
                  {busy
                    ? "Menyimpan…"
                    : r.available
                      ? "Kirim permintaan pilot"
                      : "Kirim minat"}
                  <Check size={16} />
                </button>
              </div>
            </form>
          </section>
          <aside className="visitor-order-summary">
            <span className="visitor-eyebrow">
              <ClipboardCheck size={15} />
              RINGKASAN PERMINTAAN PILOT
            </span>
            <h3>{r.organization}</h3>
            <dl>
              <div>
                <dt>Modul</dt>
                <dd>{modules[r.module]}</dd>
              </div>
              <div>
                <dt>Rekomendasi</dt>
                <dd>{r.plan}</dd>
              </div>
              <div>
                <dt>Basis volume</dt>
                <dd>
                  {r.volume} jamaah {r.basis === "TTM" ? "TTM" : "aktif"}
                </dd>
              </div>
              <div>
                <dt>Pengguna / organisasi</dt>
                <dd>
                  {r.users} / {r.branches}
                </dd>
              </div>
              <div>
                <dt>Harga resmi</dt>
                <dd>Belum ditetapkan</dd>
              </div>
              <div>
                <dt>Pembayaran</dt>
                <dd>Tidak diminta</dd>
              </div>
            </dl>
            <p>
              <ShieldCheck size={18} />
              Data kebutuhan dihitung ulang sebelum permintaan diteruskan ke Tim Arah Jamaah.
            </p>
          </aside>
        </div>
      )}
      {step === 4 && receipt && (
        <section className="panel visitor-success">
          <div className="visitor-success-icon">
            <CheckCircle2 size={35} />
          </div>
          <span className="visitor-eyebrow">PERMINTAAN PILOT TERKIRIM</span>
          <h2>{statusLabels[receipt.status]}</h2>
          <p>
            Terima kasih. Tim Arah Jamaah akan meninjau kebutuhan travel Anda dan menghubungi kontak yang diberikan.
          </p>
          <div className="visitor-receipt">
            <span>REFERENSI PERMINTAAN PILOT</span>
            <strong>{receipt.reference}</strong>
            <p>
              {receipt.organization} · {receipt.plan}
            </p>
            <small>
              {new Date(receipt.createdAt).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
              })}{" "}
              WIB
            </small>
          </div>
          <div className="visitor-success-next">
            <h3>Langkah berikutnya</h3>
            <ol>
              <li>Tim Arah Jamaah meninjau profil dan paket rekomendasi.</li>
              <li>Tim menghubungi Anda untuk mengonfirmasi kebutuhan dan scope pilot.</li>
              <li>Harga resmi dan aktivasi dikonfirmasi sebelum ada pembayaran.</li>
            </ol>
            <p>
              Formulir ini tidak membuat tagihan otomatis. Jika ingin lebih cepat, hubungi Tim Arah Jamaah melalui WhatsApp atau email di bawah.
            </p>
          </div>
          <div className="visitor-success-buttons">
            <a
              className="button primary"
              href={`https://wa.me/${TEAM_WHATSAPP}?text=${encodeURIComponent(
                `Halo Tim Arah Jamaah, saya sudah mengisi permintaan pilot ${receipt.reference} untuk ${receipt.organization} (${receipt.plan}).`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Hubungi via WhatsApp
              <ArrowRight size={16} />
            </a>
            <a className="button" href={`mailto:${TEAM_EMAIL}?subject=${encodeURIComponent(
              `Permintaan Pilot Arah Jamaah - ${receipt.reference}`,
            )}`}>
              Email Tim Arah Jamaah
            </a>
            <button className="button" onClick={exportReceipt}>
              <Download size={16} />
              Unduh ringkasan
            </button>
            <button className="button" onClick={() => onNavigate("dashboard")}>
              Kembali ke demo
              <ArrowRight size={16} />
            </button>
            <button className="visitor-text-link" onClick={reset}>
              <RotateCcw size={14} />
              Hitung ulang paket
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
function ArrowUpRightIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
