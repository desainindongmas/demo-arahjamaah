import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Plane,
  Users,
  Contact,
  Wallet,
  FolderCheck,
  ClipboardList,
  Handshake,
  ChartNoAxesCombined,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  CalendarDays,
  Clock,
  Check,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Download,
  Filter,
  MoreHorizontal,
  Sun,
  Building2,
  LifeBuoy,
  ArrowUp,
  Target,
  Eye,
  FileText,
  Lock,
  RotateCcw,
  CheckCheck,
  MapPin,
  BriefcaseBusiness,
  Receipt,
  Upload,
  Compass,
  Sparkles,
  CircleHelp,
} from "lucide-react";
import { can, TODAY, policy } from "./domain.js";
import "./styles.css";
import VisitorOnboarding from "./components/VisitorOnboarding.jsx";
import VisitorFlow from "./components/VisitorFlow.jsx";
const money = (v, short = false) =>
  v == null
    ? "—"
    : short
      ? `${v < 0 ? "−" : ""}Rp${(Math.abs(v) / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`
      : `${v < 0 ? "−" : ""}Rp${Math.abs(v).toLocaleString("id-ID")}`;
const date = (v) =>
  v
    ? new Date(v + "T12:00:00").toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Belum diisi";
const labels = {
  READY: "Siap berangkat",
  AT_RISK: "Perlu perhatian",
  BLOCKED: "Ada penghambat",
  CONFIRMED: "Terkonfirmasi",
  RESERVED: "Reservasi · 48 jam",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
  PENDING: "Menunggu verifikasi",
  VERIFIED: "Terverifikasi",
  REVIEW: "Dalam pemeriksaan",
  REJECTED: "Ditolak",
  MISSING: "Belum tersedia",
  PAID: "Lunas",
  UNPAID: "Belum dibayar",
  NEW: "Prospek baru",
  CONTACTED: "Dihubungi",
  QUALIFIED: "Siap booking",
  CONVERTED: "Sudah booking",
  BLOCKER: "Blocker",
  RISK: "Perhatian",
};
const roleNames = {
  owner: "Owner",
  ops: "Operasional",
  finance: "Finance",
  sales: "Sales",
  admin: "Admin",
};
const rolePeople = {
  owner: "Arif Rahman",
  ops: "Dina Lestari",
  finance: "Rani Putri",
  sales: "Rizky Ananda",
  admin: "Admin Travel",
};
const nav = [
  {
    section: "WORKSPACE",
    items: [
      ["dashboard", "Command Center", LayoutDashboard],
      ["journey", "Jelajah & Kebutuhan", Compass],
      ["departures", "Keberangkatan", Plane],
      ["people", "Jamaah", Users],
      ["leads", "Leads & Booking", Contact],
    ],
  },
  {
    section: "OPERASIONAL",
    items: [
      ["finance", "Keuangan", Wallet],
      ["documents", "Dokumen", FolderCheck],
      ["tasks", "Tugas & Checklist", ClipboardList],
      ["agents", "Agen Travel", Handshake],
    ],
  },
  {
    section: "ANALISIS",
    items: [
      ["reports", "Laporan & Insight", ChartNoAxesCombined],
      ["settings", "Pengaturan", Settings],
    ],
  },
];
function Badge({ status, children }) {
  return (
    <span className={`badge ${status?.toLowerCase()}`}>
      {children || labels[status] || status}
    </span>
  );
}
function Avatar({ p, size = 36 }) {
  return (
    <img
      className="avatar"
      src={p?.photo || "/photos/person-5.jpg"}
      alt={`Foto dummy ${p?.name || "pengguna"}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        e.currentTarget.src = "/photos/person-1.jpg";
      }}
    />
  );
}
function Empty({ text = "Belum ada data untuk ditampilkan." }) {
  return (
    <div className="empty">
      <FolderCheck size={30} />
      <p>{text}</p>
    </div>
  );
}
function Field({ field }) {
  const common = {
    name: field.name,
    "aria-label": field.label,
    defaultValue: field.value ?? "",
    required: field.required !== false,
    placeholder: field.placeholder || "",
    min: field.min,
    max: field.max,
    accept: field.accept,
  };
  return (
    <label className={field.full ? "full" : ""}>
      {field.label}
      {field.type === "select" ? (
        <select {...common}>
          {field.options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea {...common} rows="3" />
      ) : (
        <input {...common} type={field.type || "text"} />
      )}
      {field.hint && <small>{field.hint}</small>}
    </label>
  );
}
function App() {
  const [db, setDb] = useState(null),
    [page, setPage] = useState("dashboard"),
    [role, setRole] = useState(localStorage.getItem("arah-role") || "owner"),
    [sidebar, setSidebar] = useState(false),
    [search, setSearch] = useState(""),
    [modal, setModal] = useState(null),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState(null),
    [selected, setSelected] = useState(null),
    [filter, setFilter] = useState("all"),
    [tab, setTab] = useState("payments"),
    [notifs, setNotifs] = useState(false),
    [loadError, setLoadError] = useState("");
  const [onboardingControl, setOnboardingControl] = useState(null);
  const appRef = useRef(null);
  const modalRef = useRef(null);
  modalRef.current = modal;
  const headers = { "Content-Type": "application/json", "x-demo-role": role };
  const refresh = async () => {
    try {
      const r = await fetch("/api/state", { headers });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setDb(d);
      setLoadError("");
    } catch (e) {
      setLoadError(e.message);
    }
  };
  useEffect(() => {
    refresh();
    localStorage.setItem("arah-role", role);
  }, [role]);
  useEffect(() => {
    setFilter("all");
    setSearch("");
    setSidebar(false);
    window.scrollTo(0, 0);
  }, [page]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        setModal(null);
        setNotifs(false);
        setSidebar(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const selector =
      ".modal button:not([disabled]), .modal input, .modal select, .modal textarea";
    const timer = requestAnimationFrame(() => {
      const input = document.querySelector(
        ".modal input, .modal select, .modal textarea",
      );
      (input || document.querySelector(selector))?.focus();
    });
    const trap = (event) => {
      if (event.key !== "Tab") return;
      const items = [...document.querySelectorAll(selector)].filter(
        (el) => !el.disabled,
      );
      if (!items.length) return;
      const first = items[0],
        last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      cancelAnimationFrame(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trap);
      if (previous?.isConnected) previous.focus();
    };
  }, [modal]);
  const notify = (message, error = false) => setToast({ message, error });
  const action = async (
    type,
    data,
    success = "Perubahan berhasil disimpan.",
  ) => {
    const initiatingModal = modalRef.current;
    setBusy(true);
    try {
      const r = await fetch("/api/action", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: type, data }),
      });
      const body = await r.json();
      if (!r.ok) throw Error(body.error);
      await refresh();
      setModal((current) => (current === initiatingModal ? null : current));
      notify(success);
      return true;
    } catch (e) {
      notify(e.message, true);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const form = (
    title,
    description,
    fields,
    submit,
    button = "Simpan perubahan",
  ) => setModal({ title, description, fields, submit, button });
  const confirm = (title, description, submit, button = "Konfirmasi") =>
    setModal({ title, description, submit, button, fields: [] });
  const openOnboarding = (mode = "welcome") => {
    setModal(null);
    setSidebar(false);
    setNotifs(false);
    setOnboardingControl({ id: crypto.randomUUID(), mode });
  };
  const navigateVisitor = (destination, nextTab) => {
    goto(destination);
    if (nextTab) setTab(nextTab);
    else if (destination === "journey") setTab("overview");
  };
  const goto = (p) => {
    setSelected(null);
    setPage(p);
    setNotifs(false);
  };
  if (!db || db.role !== role)
    return (
      <div className="loading">
        <img src="/brand.svg" alt="Arah Jamaah" />
        <h2>Arah Jamaah</h2>
        <p>{loadError || "Menyiapkan workspace Anda…"}</p>
        {loadError && <button onClick={refresh}>Coba lagi</button>}
      </div>
    );
  const { engine: e } = db;
  const finance = can(role, "finance"),
    ops = can(role, "ops"),
    sales = can(role, "sales");
  const dep = (id) => e.journeys.find((d) => d.id === id),
    person = (id) => db.people.find((p) => p.id === id),
    pkg = (id) => db.packages.find((p) => p.id === id);
  const people = db.people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
  const departures = e.journeys.filter(
    (d) =>
      (filter === "all" || d.status === filter) &&
      d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const blocked = e.journeys.filter((d) => d.status !== "READY").length;
  const options = db.departures
    .filter((d) => !d.cleared && !d.closed)
    .map((d) => ({
      value: d.id,
      label: `${d.name} · ${dep(d.id).available} kursi tersedia`,
    }));
  const bookingForm = (lead = null, p = null) =>
    form(
      lead ? "Konversi prospek ke booking" : "Reservasi jamaah baru",
      "Kursi ditahan 2 × 24 jam. Booking terkonfirmasi setelah DP terverifikasi.",
      [
        ...(!p
          ? [
              {
                name: "name",
                label: "Nama lengkap jamaah",
                value: lead?.name,
                placeholder: "Sesuai paspor",
              },
              {
                name: "phone",
                label: "Nomor telepon",
                value: lead?.phone,
                placeholder: "08xxxxxxxxxx",
              },
            ]
          : []),
        {
          name: "departureId",
          label: "Keberangkatan",
          type: "select",
          options,
          full: true,
        },
        {
          name: "agentId",
          label: "Atribusi agen",
          type: "select",
          options: db.agents.map((a) => ({ value: a.id, label: a.name })),
          full: true,
        },
      ],
      (data) =>
        action(
          "booking",
          { ...data, leadId: lead?.id, personId: p?.id },
          "Reservasi dibuat. Hold 48 jam aktif.",
        ),
      "Buat reservasi",
    );
  const paymentForm = (b) =>
    form(
      "Catat pembayaran",
      "Pembayaran baru berstatus PENDING dan belum memengaruhi saldo terbayar.",
      [
        ...(!b
          ? [
              {
                name: "bookingId",
                label: "Booking jamaah",
                type: "select",
                options: e.books
                  .filter((b) => ["RESERVED", "CONFIRMED"].includes(b.status))
                  .map((b) => ({
                    value: b.id,
                    label: `${person(b.personId).name} · ${dep(b.departureId).code}`,
                  })),
                full: true,
              },
            ]
          : []),
        {
          name: "amount",
          label: "Nominal (Rp)",
          type: "number",
          min: 1,
          value: b ? b.outstanding : undefined,
        },
        {
          name: "method",
          label: "Metode",
          type: "select",
          options: ["Transfer bank", "Setoran tunai"],
        },
        {
          name: "note",
          label: "Referensi / catatan",
          type: "textarea",
          required: false,
          full: true,
        },
      ],
      (data) =>
        action("payment", { ...data, bookingId: b?.id || data.bookingId }),
      "Catat pembayaran",
    );
  const documentForm = (p, type = "passport") =>
    form(
      "Pemeriksaan dokumen",
      `${p.name} · Unggah simulasi dan verifikasi adalah dua langkah berbeda.`,
      [
        {
          name: "type",
          label: "Jenis dokumen",
          type: "select",
          value: type,
          options: [
            { value: "passport", label: "Paspor" },
            { value: "visa", label: "Visa" },
            { value: "photo", label: "Foto identitas" },
          ],
        },
        {
          name: "status",
          label: "Status pemeriksaan",
          type: "select",
          value: p.docs[type] === "MISSING" ? "REVIEW" : p.docs[type],
          options: [
            { value: "REVIEW", label: "Diajukan / dalam pemeriksaan" },
            { value: "VERIFIED", label: "Terverifikasi" },
            { value: "REJECTED", label: "Ditolak" },
          ],
        },
        {
          name: "expiry",
          label: "Berlaku paspor sampai",
          type: "date",
          value: p.passportExpiry,
          required: false,
          full: true,
          hint: "Wajib untuk paspor. Kebijakan demo: minimal 6 bulan setelah kepulangan.",
        },
      ],
      (data) => action("document", { ...data, personId: p.id }),
      "Simpan pemeriksaan",
    );

  const uploadForm = (p, type = "passport") =>
    form(
      "Unggah dokumen dummy",
      `${p.name} · Gunakan berkas contoh tanpa informasi pribadi asli. Upload mengubah status menjadi dalam pemeriksaan.`,
      [
        {
          name: "type",
          label: "Jenis dokumen",
          type: "select",
          value: type,
          full: true,
          options: [
            { value: "passport", label: "Paspor" },
            { value: "visa", label: "Visa" },
            { value: "photo", label: "Foto identitas" },
          ],
        },
        {
          name: "file",
          label: "Pilih berkas dummy",
          type: "file",
          accept: ".pdf,.jpg,.jpeg,.png",
          full: true,
          hint: "PDF, JPG, atau PNG · maksimal 500 KB",
        },
      ],
      async (data) => {
        const f = data.file;
        if (!f?.size || f.size > 500000)
          return notify("Pilih berkas maksimal 500 KB.", true);
        const base64 = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result.split(",")[1]);
          r.onerror = reject;
          r.readAsDataURL(f);
        });
        await action(
          "uploadDocument",
          {
            personId: p.id,
            type: data.type,
            file: { name: f.name, mime: f.type, base64 },
          },
          "Dokumen diunggah untuk pemeriksaan. Belum terverifikasi.",
        );
      },
      "Unggah untuk review",
    );
  const downloadDoc = (file) => {
    const a = document.createElement("a");
    a.href = `data:${file.mime};base64,${file.base64}`;
    a.download = file.name;
    a.click();
  };
  const cancelForm = (b) =>
    form(
      "Batalkan booking?",
      `${person(b.personId).name} · Kursi dikembalikan. Pembayaran tetap tercatat sebagai credit untuk diproses refund.`,
      [{ name: "reason", label: "Alasan pembatalan", full: true }],
      (data) => action("cancelBooking", { id: b.id, ...data }),
      "Batalkan booking",
    );
  const refundForm = (b) =>
    form(
      "Kembalikan credit / refund",
      `Credit tersedia ${money(b.credit)}. Refund mengurangi kas aktual dan tetap tercatat pada riwayat.`,
      [
        {
          name: "amount",
          label: "Nominal refund (Rp)",
          type: "number",
          min: 1,
          max: b.credit,
          value: b.credit,
        },
        { name: "reason", label: "Alasan / referensi refund" },
      ],
      (data) => action("refund", { bookingId: b.id, ...data }),
      "Konfirmasi refund",
    );
  const roomForm = (p, bookingId) =>
    form(
      "Alokasi kamar",
      `${p.name} · Rooming list keberangkatan`,
      [
        {
          name: "room",
          label: "Nama / nomor kamar",
          value: e.books.find((b) => b.id === bookingId)?.room || "",
          placeholder: "Contoh: Kamar 201 · Double",
          full: true,
        },
      ],
      (data) => action("room", { ...data, bookingId }),
    );
  const leadForm = () =>
    form(
      "Tambah prospek",
      "Catat minat dan sumber calon jamaah agar tindak lanjut terarah.",
      [
        { name: "name", label: "Nama lengkap" },
        { name: "phone", label: "Nomor telepon" },
        {
          name: "source",
          label: "Sumber prospek",
          type: "select",
          options: ["Instagram", "Website", "Referensi agen", "Walk-in"],
        },
        {
          name: "interest",
          label: "Paket diminati",
          type: "select",
          options: db.packages.map((p) => p.name),
        },
        {
          name: "note",
          label: "Catatan",
          type: "textarea",
          required: false,
          full: true,
        },
      ],
      (data) => action("lead", data),
      "Tambahkan prospek",
    );
  const costForm = () =>
    form(
      "Catat biaya supplier",
      "Biaya menambah proyeksi cost. Kas berkurang hanya setelah pembayaran dikonfirmasi.",
      [
        { name: "supplier", label: "Nama supplier" },
        {
          name: "category",
          label: "Kategori",
          type: "select",
          options: [
            "Tiket pesawat",
            "Hotel Makkah",
            "Hotel Madinah",
            "Transport",
            "Operasional",
          ],
        },
        {
          name: "departureId",
          label: "Keberangkatan",
          type: "select",
          options,
          full: true,
        },
        { name: "amount", label: "Nominal (Rp)", type: "number", min: 1 },
        {
          name: "due",
          label: "Tanggal jatuh tempo",
          type: "date",
          value: TODAY,
        },
      ],
      (data) => action("cost", data),
      "Catat biaya",
    );
  const taskForm = () =>
    form(
      "Tambah tugas operasional",
      "Departure Autopilot juga membuat tugas ketika reservasi baru dibuat.",
      [
        { name: "title", label: "Judul tugas", full: true },
        {
          name: "departureId",
          label: "Keberangkatan",
          type: "select",
          options,
        },
        { name: "due", label: "Tenggat waktu", type: "date", value: TODAY },
      ],
      (data) => action("addTask", data),
      "Tambahkan tugas",
    );
  const exportCSV = (rows, name) => {
    if (!rows.length) return notify("Tidak ada data untuk diekspor.", true);
    const keys = Object.keys(rows[0]);
    const cell = (v) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const csv =
      "\uFEFF" +
      [keys, ...rows.map((r) => keys.map((k) => r[k]))]
        .map((r) => r.map(cell).join(","))
        .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    a.download = `arah-jamaah-${name}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify("Laporan CSV berhasil diekspor.");
  };
  const manifest = (id) =>
    exportCSV(
      e.books
        .filter((b) => b.departureId === id && b.status === "CONFIRMED")
        .map((b) => ({
          Nama: person(b.personId).name,
          Telepon: person(b.personId).phone,
          Keberangkatan: dep(id).code,
          Kamar: b.room,
          Paspor: labels[person(b.personId).docs.passport],
        })),
      "manifest",
    );
  const handleException = (x) => {
    setNotifs(false);
    if (x.taskId) {
      goto("tasks");
      return;
    }
    if (x.area === "finance") {
      goto("finance");
      setTab("invoices");
      return;
    }
    const p = person(x.personId);
    if (x.area === "ops" && !ops) {
      goto("documents");
      return;
    }
    if (x.id.endsWith("room")) roomForm(p, x.bookingId);
    else
      documentForm(
        p,
        x.id.endsWith("visa")
          ? "visa"
          : x.id.endsWith("photo")
            ? "photo"
            : "passport",
      );
  };
  function Header({ eyebrow, title, sub, children }) {
    return (
      <div className="page-heading">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          <p>{sub}</p>
        </div>
        <div className="heading-actions">{children}</div>
      </div>
    );
  }
  function Stat({ icon: Icon, title, value, foot, tone = "purple", children }) {
    return (
      <div className="stat-card">
        <div className="stat-top">
          <span>{title}</span>
          <div className={`stat-icon ${tone}`}>
            <Icon size={19} />
          </div>
        </div>
        <strong>{value}</strong>
        <div className="stat-foot">{children || foot}</div>
      </div>
    );
  }
  function SectionTitle({ title, sub, action: act }) {
    return (
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {act}
      </div>
    );
  }
  function PersonCell({ p, sub }) {
    return (
      <div className="person-cell">
        <Avatar p={p} />
        <div>
          <b>{p.name}</b>
          <small>{sub || p.city}</small>
        </div>
      </div>
    );
  }
  const table = (heads, rows) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {heads.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      {!rows.length && <Empty />}
    </div>
  );
  function DepartureCard({ d }) {
    return (
      <div className="departure-row">
        <div className="departure-date">
          <strong>{new Date(d.date + "T12:00").getDate()}</strong>
          <span>
            {new Date(d.date + "T12:00").toLocaleDateString("id-ID", {
              month: "short",
            })}
          </span>
        </div>
        <div className="departure-name">
          <b>{d.name}</b>
          <small>
            {d.code} <span>•</span> {pkg(d.packageId).duration} hari{" "}
            <span>•</span> {pkg(d.packageId).airline}
          </small>
        </div>
        <div className="seat-cell">
          <b>
            {d.booked}
            <span>/{d.capacity} jamaah</span>
          </b>
          <div className="mini-track">
            <i style={{ width: (d.booked / d.capacity) * 100 + "%" }} />
          </div>
        </div>
        <div className="readiness-cell">
          <span>
            Kesiapan <b>{d.score}%</b>
          </span>
          <div className="mini-track">
            <i
              className={d.status.toLowerCase()}
              style={{ width: d.score + "%" }}
            />
          </div>
        </div>
        <Badge status={d.status} />
        <button
          aria-label={`Lihat ${d.name}`}
          className="icon-btn"
          onClick={() => {
            setPage("departures");
            setSelected(d.id);
          }}
        >
          <ArrowUpRight size={18} />
        </button>
      </div>
    );
  }
  const namePage = nav.flatMap((n) => n.items).find((n) => n[0] === page)?.[1];
  return (
    <>
      <div ref={appRef} className={`app-shell ${sidebar ? "nav-open" : ""}`}>
        <div className="nav-overlay" onClick={() => setSidebar(false)} />
        <aside className="sidebar">
          <a
            className="brand"
            href="#"
            onClick={(ev) => {
              ev.preventDefault();
              goto("dashboard");
            }}
          >
            <img src="/brand.svg" alt="Logo Arah Jamaah" />
            <div>
              <b>
                Arah <span>Jamaah</span>
              </b>
              <small>OPERATIONS INTELLIGENCE</small>
            </div>
          </a>
          <button className="workspace" onClick={() => goto("settings")}>
            <div className="workspace-icon">
              <Building2 size={19} />
            </div>
            <span>
              <b>Al Barokah Travel</b>
              <small>Workspace Umroh</small>
            </span>
            <ChevronDown size={15} />
          </button>
          <nav>
            {nav.map((group) => (
              <div className="nav-group" key={group.section}>
                <p>{group.section}</p>
                {group.items
                  .filter(
                    ([id]) => (id !== "finance" && id !== "reports") || finance,
                  )
                  .map(([id, label, Icon]) => (
                    <button
                      key={id}
                      className={page === id ? "active" : ""}
                      onClick={() => goto(id)}
                    >
                      <Icon size={19} />
                      <span>{label}</span>
                      {id === "tasks" && (
                        <small>{db.tasks.filter((t) => !t.done).length}</small>
                      )}
                      {id === "dashboard" && <i />}
                    </button>
                  ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="help-card">
              <div className="help-icon">
                <Compass size={22} />
              </div>
              <b>Langkah baik, lebih terarah.</b>
              <p>Kenali cara Arah Jamaah membantu perjalanan Anda.</p>
              <button onClick={() => openOnboarding()}>
                Jelajahi demo <ArrowUpRight size={15} />
              </button>
            </div>
            <button
              className="support-btn"
              onClick={() => navigateVisitor("journey")}
            >
              <LifeBuoy size={18} />
              Pusat bantuan
              <ArrowUpRight size={15} />
            </button>
            <div className="sidebar-user">
              <Avatar
                p={{ name: rolePeople[role], photo: "/photos/person-5.jpg" }}
              />
              <div>
                <b>{rolePeople[role]}</b>
                <small>{roleNames[role]} · Demo workspace</small>
              </div>
              <button
                className="icon-btn"
                aria-label="Pengaturan profil"
                onClick={() => goto("settings")}
              >
                <Settings size={17} />
              </button>
            </div>
          </div>
        </aside>
        <div className="main-area">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="mobile-menu icon-btn"
                onClick={() => setSidebar(true)}
                aria-label="Buka navigasi"
              >
                <Menu />
              </button>
              <span>Workspace</span>
              <ChevronRight size={14} />
              <b>{namePage}</b>
            </div>
            <div className="topbar-right">
              <button
                className="visitor-replay-button"
                aria-label="Ulangi tur demo"
                title="Jelajah demo"
                onClick={() => openOnboarding()}
              >
                <Compass size={17} />
                <span>Jelajah demo</span>
              </button>
              <span className="demo-chip">
                <i />
                Mode demo
              </span>
              <div className="top-divider" />
              <label className="role-select">
                <Eye size={15} />
                <select
                  aria-label="Lihat sebagai peran"
                  value={role}
                  onChange={(ev) => {
                    setRole(ev.target.value);
                    setPage("dashboard");
                  }}
                >
                  {Object.entries(roleNames).map(([v, label]) => (
                    <option key={v} value={v}>
                      Lihat sebagai {label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="notification-btn icon-btn"
                aria-label="Notifikasi"
                onClick={() => setNotifs(!notifs)}
              >
                <Bell size={19} />
                <i />
              </button>
              <Avatar
                p={{ name: rolePeople[role], photo: "/photos/person-5.jpg" }}
                size={33}
              />
            </div>
          </header>
          {notifs && (
            <div className="notifications">
              <SectionTitle
                title="Pusat perhatian"
                action={
                  <button
                    className="icon-btn"
                    onClick={() => setNotifs(false)}
                    aria-label="Tutup notifikasi"
                  >
                    <X size={18} />
                  </button>
                }
              />
              {e.exceptions.slice(0, 5).map((x) => (
                <button key={x.id} onClick={() => handleException(x)}>
                  <span className="alert-dot" />
                  <span>
                    <b>{x.title}</b>
                    <small>
                      {x.detail} · {x.owner}
                    </small>
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          )}
          <main>
            {page === "dashboard" && (
              <>
                <Header
                  eyebrow="COMMAND CENTER"
                  title={`Selamat pagi, ${rolePeople[role].split(" ")[0]} 👋`}
                  sub="Setiap perjalanan yang baik dimulai dari kesiapan yang terjaga."
                >
                  <span className="date-label">
                    <CalendarDays size={16} />
                    Sabtu, 17 Oktober 2026
                  </span>
                  <button
                    className="button primary"
                    onClick={() =>
                      sales
                        ? bookingForm()
                        : finance
                          ? paymentForm()
                          : taskForm()
                    }
                  >
                    <Plus size={17} />
                    {sales
                      ? "Booking baru"
                      : finance
                        ? "Catat pembayaran"
                        : "Tambah tugas"}
                  </button>
                </Header>
                <div className="visitor-flow-shortcut">
                  <span>
                    <Compass size={18} />
                    <b>Kenali. Coba. Hitung. Pesan.</b>
                    <small>Temukan alur yang tepat untuk travel Anda.</small>
                  </span>
                  <button
                    className="text-btn"
                    onClick={() => navigateVisitor("journey")}
                  >
                    Mulai dari sini
                    <ArrowRight size={15} />
                  </button>
                </div>
                <div className="welcome-banner">
                  <div className="banner-pattern" />
                  <div className="banner-content">
                    <div className="banner-eyebrow">
                      <span />
                      ARAH JAMAAH · OPERASIONAL UMROH
                    </div>
                    <h2>
                      Perjalanan tenang.
                      <br />
                      Bisnis lebih terarah.
                    </h2>
                    <p>
                      Pantau kesiapan, lindungi arus kas, dan jaga profit.
                      <br />
                      Semua keberangkatan, dalam satu kendali.
                    </p>
                    <button onClick={() => goto("departures")}>
                      Lihat kesiapan keberangkatan <ArrowRight size={17} />
                    </button>
                  </div>
                  <div className="banner-image" />
                  <div className="banner-note">
                    <ShieldCheck size={17} />
                    <span>Bersama menjaga setiap amanah.</span>
                  </div>
                </div>
                <div className="stats-grid">
                  <Stat
                    icon={Plane}
                    title="Keberangkatan aktif"
                    value={e.journeys.length}
                    tone="purple"
                  >
                    <span className="stat-context">
                      <span className="green-dot" />{" "}
                      {e.journeys.filter((d) => d.status === "READY").length}{" "}
                      siap · {blocked} perlu tindakan
                    </span>
                  </Stat>
                  <Stat
                    icon={Users}
                    title="Jamaah terdaftar"
                    value={
                      e.books.filter((b) =>
                        ["RESERVED", "CONFIRMED"].includes(b.status),
                      ).length
                    }
                    tone="blue"
                  >
                    <span className="positive">
                      <Users size={13} />
                      {
                        e.books.filter((b) => b.status === "CONFIRMED").length
                      }{" "}
                      terkonfirmasi
                    </span>
                    <span> di seluruh keberangkatan</span>
                  </Stat>
                  {finance ? (
                    <>
                      <Stat
                        icon={Wallet}
                        title="Kas tersedia"
                        value={money(db.openingCash, true)}
                        tone="gold"
                      >
                        <span className="muted">
                          Aktual · pembayaran terverifikasi
                        </span>
                      </Stat>
                      <Stat
                        icon={TrendingUp}
                        title="Proyeksi profit"
                        value={money(
                          e.projectedRevenue - e.projectedCost,
                          true,
                        )}
                        tone="green"
                      >
                        <span className="positive">
                          <ArrowUpRight size={13} />
                          {(
                            ((e.projectedRevenue - e.projectedCost) /
                              e.projectedRevenue) *
                            100
                          ).toFixed(1)}
                          % margin
                        </span>
                        <span> · estimasi seluruh trip</span>
                      </Stat>
                    </>
                  ) : (
                    <>
                      <Stat
                        icon={FolderCheck}
                        title="Dokumen terverifikasi"
                        value={
                          db.people.filter((p) =>
                            Object.values(p.docs).every(
                              (s) => s === "VERIFIED",
                            ),
                          ).length
                        }
                        tone="green"
                        foot="Dari seluruh jamaah terdaftar"
                      />
                      <Stat
                        icon={ClipboardList}
                        title="Tugas aktif"
                        value={db.tasks.filter((t) => !t.done).length}
                        tone="gold"
                        foot="Jadwal operasional keberangkatan"
                      />
                    </>
                  )}
                </div>
                <div className="dashboard-columns">
                  <section className="panel priority-panel">
                    <SectionTitle
                      title={
                        <>
                          <span className="section-symbol amber">
                            <ShieldAlert size={17} />
                          </span>
                          Prioritas hari ini{" "}
                          <span className="count-badge">
                            {e.exceptions.length}
                          </span>
                        </>
                      }
                      sub="Fokus pada hal yang paling membutuhkan perhatian Anda."
                      action={
                        <button
                          className="text-btn"
                          onClick={() => goto("exceptions")}
                        >
                          Lihat semua <ArrowRight size={14} />
                        </button>
                      }
                    />
                    <div className="priority-list">
                      {e.exceptions
                        .filter((x) =>
                          role === "finance"
                            ? x.area === "finance"
                            : x.severity === "BLOCKER",
                        )
                        .slice(0, 3)
                        .map((x) => (
                          <div className="priority-item" key={x.id}>
                            <span className="priority-indicator" />
                            <div>
                              <div className="priority-item-head">
                                <Badge status={x.severity} />
                                <small>
                                  {dep(x.departureId).code} · H-
                                  {Math.ceil(
                                    (new Date(x.due) - new Date(TODAY)) /
                                      86400000,
                                  )}
                                </small>
                              </div>
                              <b>{x.title}</b>
                              <p>
                                {x.detail} <span>·</span> {x.owner}
                              </p>
                            </div>
                            <button
                              className="icon-btn"
                              onClick={() => handleException(x)}
                              aria-label={x.action}
                            >
                              <ArrowUpRight size={18} />
                            </button>
                          </div>
                        ))}
                      {finance && e.lowestCash < 0 && (
                        <div className="cash-alert">
                          <div className="cash-alert-icon">
                            <Wallet size={18} />
                          </div>
                          <div>
                            <b>Antisipasi kebutuhan kas</b>
                            <p>
                              Proyeksi kas terendah {money(e.lowestCash, true)}{" "}
                              sebelum penerimaan.
                            </p>
                          </div>
                          <button
                            className="icon-btn"
                            onClick={() => {
                              goto("finance");
                              setTab("calendar");
                            }}
                            aria-label="Lihat proyeksi kas"
                          >
                            <ArrowUpRight size={17} />
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                  <section className="panel health-panel">
                    <SectionTitle
                      title="Kesehatan operasional"
                      sub="Gambaran kesiapan seluruh keberangkatan."
                    />
                    <div className="health-body">
                      <div
                        className="donut"
                        style={{
                          "--progress":
                            Math.round(
                              e.journeys.reduce((s, d) => s + d.score, 0) /
                                e.journeys.length,
                            ) *
                              3.6 +
                            "deg",
                        }}
                      >
                        <div>
                          <strong>
                            {Math.round(
                              e.journeys.reduce((s, d) => s + d.score, 0) /
                                e.journeys.length,
                            )}
                            <span>%</span>
                          </strong>
                          <small>Rata-rata kesiapan</small>
                        </div>
                      </div>
                      <div className="health-legend">
                        {[
                          ["READY", "green"],
                          ["AT_RISK", "gold"],
                          ["BLOCKED", "red"],
                        ].map(([s, c]) => (
                          <div key={s}>
                            <i className={c} />
                            <span>{labels[s]}</span>
                            <b>
                              {e.journeys.filter((d) => d.status === s).length}
                            </b>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="health-note">
                      <CircleHelp size={14} />
                      <span>
                        Score tinggi tetap membutuhkan penyelesaian blocker.
                      </span>
                    </div>
                  </section>
                </div>
                <section className="panel departures-panel">
                  <SectionTitle
                    title="Keberangkatan mendatang"
                    sub="Pastikan setiap jamaah melangkah dengan kesiapan terbaik."
                    action={
                      <button
                        className="text-btn"
                        onClick={() => goto("departures")}
                      >
                        Semua keberangkatan <ArrowRight size={14} />
                      </button>
                    }
                  />
                  <div className="departure-head">
                    <span>KEBERANGKATAN</span>
                    <span>TERISI</span>
                    <span>READINESS</span>
                    <span>STATUS</span>
                  </div>
                  {e.journeys.map((d) => (
                    <DepartureCard d={d} key={d.id} />
                  ))}
                </section>
                <div className="dashboard-columns bottom-columns">
                  <section className="panel">
                    <SectionTitle
                      title={finance ? "Money Calendar" : "Tugas terdekat"}
                      sub={
                        finance
                          ? "Penerimaan yang diharapkan dan kewajiban mendatang."
                          : "Jaga persiapan tetap sesuai rencana."
                      }
                      action={
                        <button
                          className="text-btn"
                          onClick={() => {
                            goto(finance ? "finance" : "tasks");
                            setTab("calendar");
                          }}
                        >
                          Lihat semua <ArrowRight size={14} />
                        </button>
                      }
                    />
                    {finance
                      ? e.calendar.slice(0, 3).map((c) => (
                          <div className="money-row" key={c.id}>
                            <div
                              className={`money-icon ${c.type === "OUT" ? "red" : "green"}`}
                            >
                              {c.type === "OUT" ? (
                                <ArrowUpRight size={18} />
                              ) : (
                                <ArrowDownRight size={18} />
                              )}
                            </div>
                            <div>
                              <b>{c.name}</b>
                              <small>
                                {c.label} · {date(c.date)}
                              </small>
                            </div>
                            <strong
                              className={
                                c.type === "OUT" ? "negative" : "positive"
                              }
                            >
                              {c.type === "OUT" ? "−" : "+"}
                              {money(c.amount, true)}
                            </strong>
                          </div>
                        ))
                      : db.tasks
                          .filter((t) => !t.done)
                          .slice(0, 3)
                          .map((t) => (
                            <div className="money-row" key={t.id}>
                              <ClipboardList size={20} />
                              <div>
                                <b>{t.title}</b>
                                <small>
                                  {t.owner} · {date(t.due)}
                                </small>
                              </div>
                            </div>
                          ))}
                  </section>
                  <section className="panel">
                    <SectionTitle
                      title="Aktivitas terbaru"
                      sub="Jejak kerja tim, transparan dan tercatat."
                      action={
                        <button
                          className="text-btn"
                          onClick={() => {
                            goto("settings");
                            setTab("audit");
                          }}
                        >
                          Audit trail <ArrowRight size={14} />
                        </button>
                      }
                    />
                    <div className="activity-list">
                      {db.audit.slice(0, 3).map((a, i) => (
                        <div className="activity" key={a.id}>
                          <div
                            className={`activity-icon ${i === 0 ? "purple" : "green"}`}
                          >
                            {i === 0 ? (
                              <FolderCheck size={14} />
                            ) : (
                              <Check size={14} />
                            )}
                          </div>
                          <div>
                            <b>{a.action}</b>
                            <p>
                              {a.actor} <span>·</span>{" "}
                              {new Date(a.time).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Asia/Jakarta",
                              })}{" "}
                              WIB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            )}
            {page === "departures" && (
              <>
                <Header
                  eyebrow="DEPARTURE AUTOPILOT"
                  title={
                    selected
                      ? dep(selected)?.name
                      : "Setiap keberangkatan, terkendali."
                  }
                  sub={
                    selected
                      ? `${dep(selected)?.code} · ${date(dep(selected)?.date)} — ${date(dep(selected)?.returnDate)}`
                      : "Jadwal, kapasitas, kesiapan, dan profit dalam satu pandangan."
                  }
                >
                  {selected ? (
                    <button
                      className="button"
                      onClick={() => setSelected(null)}
                    >
                      <ArrowLeft size={16} />
                      Semua keberangkatan
                    </button>
                  ) : (
                    sales && (
                      <button
                        className="button primary"
                        onClick={() => bookingForm()}
                      >
                        <Plus size={16} />
                        Booking baru
                      </button>
                    )
                  )}
                </Header>
                {!selected ? (
                  <>
                    <div className="toolbar">
                      <div className="tabs">
                        {[
                          ["all", "Semua"],
                          ["READY", "Siap"],
                          ["AT_RISK", "Perhatian"],
                          ["BLOCKED", "Terhambat"],
                        ].map(([v, l]) => (
                          <button
                            key={v}
                            className={filter === v ? "active" : ""}
                            onClick={() => setFilter(v)}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                      <div className="input-search">
                        <Search size={17} />
                        <input
                          value={search}
                          onChange={(ev) => setSearch(ev.target.value)}
                          placeholder="Cari keberangkatan…"
                        />
                      </div>
                    </div>
                    <div className="trip-grid">
                      {departures.map((d) => (
                        <article className="trip-card" key={d.id}>
                          <div
                            className="trip-image"
                            style={{
                              backgroundImage: `linear-gradient(0deg,rgba(34,20,36,.65),transparent),url(/photos/hero.png)`,
                            }}
                          >
                            <Badge status={d.status} />
                            <span>{d.code}</span>
                          </div>
                          <div className="trip-content">
                            <div className="eyebrow">
                              {pkg(d.packageId).duration} HARI ·{" "}
                              {pkg(d.packageId).airline}
                            </div>
                            <h2>{d.name}</h2>
                            <p>
                              <CalendarDays size={15} />
                              {date(d.date)} — {date(d.returnDate)}
                            </p>
                            <div className="trip-stats">
                              <div>
                                <small>Kursi terisi</small>
                                <b>
                                  {d.booked} <span>/ {d.capacity}</span>
                                </b>
                              </div>
                              <div>
                                <small>Kesiapan</small>
                                <b>{d.score}%</b>
                              </div>
                              <div>
                                <small>Blocker aktif</small>
                                <b
                                  className={
                                    d.blocker ? "negative" : "positive"
                                  }
                                >
                                  {d.blocker}
                                </b>
                              </div>
                            </div>
                            <div className="mini-track">
                              <i style={{ width: d.score + "%" }} />
                            </div>
                            <button
                              className="button wide"
                              onClick={() => setSelected(d.id)}
                            >
                              Kelola keberangkatan <ArrowRight size={16} />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="panel packages">
                      <SectionTitle
                        title="Katalog paket"
                        sub="Satu paket dapat memiliki beberapa jadwal keberangkatan."
                      />
                      {db.packages.map((p) => (
                        <div className="package-row" key={p.id}>
                          <div className="stat-icon purple">
                            <BriefcaseBusiness size={22} />
                          </div>
                          <div>
                            <h3>{p.name}</h3>
                            <p>
                              {p.duration} hari · {p.hotel}
                            </p>
                          </div>
                          <strong>
                            {money(p.price)}
                            <small>per jamaah · harga simulasi</small>
                          </strong>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="stats-grid">
                      <Stat
                        icon={Users}
                        title="Kapasitas terisi"
                        value={`${dep(selected).booked} / ${dep(selected).capacity}`}
                        foot={`${dep(selected).available} kursi tersedia · hold ikut mengurangi kapasitas`}
                      />
                      <Stat
                        icon={ShieldCheck}
                        title="Kesiapan keberangkatan"
                        value={`${dep(selected).score}%`}
                        foot={labels[dep(selected).status]}
                      />
                      <Stat
                        icon={ShieldAlert}
                        title="Blocker aktif"
                        value={dep(selected).blocker}
                        tone="gold"
                        foot="Harus selesai sebelum final clearance"
                      />
                      {finance ? (
                        <Stat
                          icon={TrendingUp}
                          title="Proyeksi profit"
                          value={money(dep(selected).profit, true)}
                          tone="green"
                          foot={`${dep(selected).margin.toFixed(1)}% margin estimasi`}
                        />
                      ) : (
                        <Stat
                          icon={ClipboardList}
                          title="Tugas terbuka"
                          value={dep(selected).openTasks}
                          foot="Checklist keberangkatan"
                        />
                      )}
                    </div>
                    <section className="panel">
                      <SectionTitle
                        title="Final Clearance"
                        sub="Lunas saja belum cukup. Semua dokumen, kamar, dan tugas harus siap."
                        action={
                          <div className="button-row">
                            <button
                              className="button"
                              onClick={() => manifest(selected)}
                            >
                              <Download size={16} />
                              Manifest
                            </button>
                            {ops && (
                              <button
                                className="button primary"
                                onClick={() =>
                                  action(
                                    "clearance",
                                    { id: selected },
                                    "Final Clearance disetujui. Keberangkatan siap.",
                                  )
                                }
                              >
                                <ShieldCheck size={16} />
                                {dep(selected).cleared
                                  ? "Sudah mendapat clearance"
                                  : "Periksa & berikan clearance"}
                              </button>
                            )}
                          </div>
                        }
                      />
                      <div className="inline-note">
                        <AlertTriangle size={17} />
                        {dep(selected).status === "READY"
                          ? "Seluruh persyaratan kesiapan terpenuhi."
                          : `${dep(selected).blocker} blocker, ${dep(selected).openTasks} tugas terbuka${finance ? `, dan ${money(dep(selected).outstanding)} pelunasan tersisa` : ""}.`}
                      </div>
                    </section>
                    <section className="panel">
                      <SectionTitle
                        title="Jamaah & rooming list"
                        sub="Manifest hanya memasukkan booking terkonfirmasi."
                      />
                      {table(
                        ["JAMAAH", "BOOKING", "DOKUMEN", "KAMAR", "AKSI"],
                        e.books
                          .filter((b) => b.departureId === selected)
                          .map((b) => (
                            <tr key={b.id}>
                              <td>
                                <PersonCell p={person(b.personId)} />
                              </td>
                              <td>
                                <Badge status={b.status} />
                              </td>
                              <td>
                                <Badge
                                  status={
                                    Object.values(
                                      person(b.personId).docs,
                                    ).every((v) => v === "VERIFIED")
                                      ? "VERIFIED"
                                      : "REVIEW"
                                  }
                                />
                              </td>
                              <td>
                                {b.room || (
                                  <span className="negative">
                                    Belum dialokasikan
                                  </span>
                                )}
                              </td>
                              <td>
                                {ops && (
                                  <button
                                    className="text-btn"
                                    onClick={() =>
                                      roomForm(person(b.personId), b.id)
                                    }
                                  >
                                    Atur kamar <ChevronRight size={14} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          )),
                      )}
                    </section>
                    <section className="panel">
                      <SectionTitle title="Risiko & tindak lanjut" />
                      {e.exceptions
                        .filter((x) => x.departureId === selected)
                        .map((x) => (
                          <div className="exception-row" key={x.id}>
                            <Badge status={x.severity} />
                            <div>
                              <b>{x.title}</b>
                              <small>
                                {x.detail} · {x.owner}
                              </small>
                            </div>
                            <button
                              className="text-btn"
                              onClick={() => handleException(x)}
                            >
                              {x.action}
                              <ArrowUpRight size={15} />
                            </button>
                          </div>
                        ))}
                      {!e.exceptions.some(
                        (x) => x.departureId === selected,
                      ) && (
                        <Empty text="Tidak ada risiko aktif. Seluruh persyaratan siap." />
                      )}
                    </section>
                    {ops && (
                      <section className="panel">
                        <SectionTitle
                          title="Closing & rekonsiliasi"
                          sub="Tutup perjalanan setelah clearance dan semua kewajiban supplier selesai."
                          action={
                            <button
                              className="button"
                              onClick={() =>
                                confirm(
                                  "Tutup perjalanan?",
                                  "Riwayat transaksi tetap disimpan untuk rekonsiliasi.",
                                  () => action("close", { id: selected }),
                                  "Closing perjalanan",
                                )
                              }
                            >
                              {dep(selected).closed
                                ? "Perjalanan ditutup"
                                : "Closing perjalanan"}
                            </button>
                          }
                        />
                      </section>
                    )}
                  </>
                )}
              </>
            )}
            {page === "people" && (
              <>
                <Header
                  eyebrow="DATA JAMAAH"
                  title="Kenali setiap jamaah."
                  sub="Satu profil, terhubung ke setiap perjalanan dan riwayat booking."
                >
                  {sales && (
                    <button
                      className="button primary"
                      onClick={() => bookingForm()}
                    >
                      <Plus size={17} />
                      Tambah jamaah
                    </button>
                  )}
                </Header>
                {selected && person(selected) ? (
                  <>
                    <button
                      className="text-btn back-link"
                      onClick={() => setSelected(null)}
                    >
                      <ArrowLeft size={17} />
                      Semua jamaah
                    </button>
                    <section className="panel profile-panel">
                      <Avatar p={person(selected)} size={84} />
                      <div>
                        <h2>{person(selected).name}</h2>
                        <p>
                          {person(selected).city} · {person(selected).phone}
                        </p>
                        <Badge
                          status={
                            Object.values(person(selected).docs).every(
                              (v) => v === "VERIFIED",
                            )
                              ? "VERIFIED"
                              : "REVIEW"
                          }
                        />
                      </div>
                      {sales && (
                        <button
                          className="button"
                          onClick={() => bookingForm(null, person(selected))}
                        >
                          <Plus size={16} />
                          Booking perjalanan lain
                        </button>
                      )}
                    </section>
                    <div className="detail-grid">
                      <section className="panel">
                        <SectionTitle title="Dokumen jamaah" />
                        {Object.entries(person(selected).docs).map(
                          ([type, s]) => (
                            <div className="document-row" key={type}>
                              <FileText size={22} />
                              <div>
                                <b>
                                  {type === "passport"
                                    ? "Paspor"
                                    : type === "visa"
                                      ? "Visa"
                                      : "Foto identitas"}
                                </b>
                                <small>
                                  {type === "passport"
                                    ? `Berlaku sampai ${date(person(selected).passportExpiry)}`
                                    : "Status dokumen simulasi"}
                                </small>
                              </div>
                              <Badge status={s} />
                              {ops && (
                                <button
                                  className="icon-btn"
                                  onClick={() =>
                                    uploadForm(person(selected), type)
                                  }
                                  aria-label={`Unggah ${type}`}
                                >
                                  <Upload size={16} />
                                </button>
                              )}
                              {person(selected).files?.[type] && (
                                <button
                                  className="icon-btn"
                                  aria-label={`Unduh ${type}`}
                                  onClick={() =>
                                    downloadDoc(person(selected).files[type])
                                  }
                                >
                                  <Download size={16} />
                                </button>
                              )}
                              {ops && (
                                <button
                                  className="icon-btn"
                                  onClick={() =>
                                    documentForm(person(selected), type)
                                  }
                                  aria-label={`Periksa ${type}`}
                                >
                                  <ArrowUpRight size={17} />
                                </button>
                              )}
                            </div>
                          ),
                        )}
                      </section>
                      <section className="panel">
                        <SectionTitle title="Riwayat perjalanan" />
                        {e.books
                          .filter((b) => b.personId === selected)
                          .map((b) => (
                            <div className="history-booking" key={b.id}>
                              <b>{dep(b.departureId).name}</b>
                              <p>{date(dep(b.departureId).date)}</p>
                              <Badge status={b.status} />
                              {finance && (
                                <p>
                                  Terbayar {money(b.paid)} · Sisa{" "}
                                  {money(b.outstanding)}
                                </p>
                              )}
                            </div>
                          ))}
                      </section>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="toolbar">
                      <span className="result-count">
                        {people.length} jamaah dalam workspace
                      </span>
                      <div className="input-search">
                        <Search size={17} />
                        <input
                          aria-label="Cari jamaah"
                          placeholder="Cari nama jamaah…"
                          value={search}
                          onChange={(ev) => setSearch(ev.target.value)}
                        />
                      </div>
                    </div>
                    <section className="panel no-top">
                      {table(
                        [
                          "NAMA JAMAAH",
                          "KONTAK",
                          "KEBERANGKATAN",
                          "DOKUMEN",
                          "",
                        ],
                        people.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <PersonCell p={p} />
                            </td>
                            <td>{p.phone}</td>
                            <td>
                              {e.books
                                .filter((b) => b.personId === p.id)
                                .map((b) => (
                                  <div className="table-stack" key={b.id}>
                                    <b>{dep(b.departureId).code}</b>
                                    <small>{labels[b.status]}</small>
                                  </div>
                                ))}
                            </td>
                            <td>
                              <Badge
                                status={
                                  Object.values(p.docs).every(
                                    (v) => v === "VERIFIED",
                                  )
                                    ? "VERIFIED"
                                    : "REVIEW"
                                }
                              />
                            </td>
                            <td>
                              <button
                                className="text-btn"
                                onClick={() => setSelected(p.id)}
                              >
                                Lihat profil
                                <ArrowUpRight size={15} />
                              </button>
                            </td>
                          </tr>
                        )),
                      )}
                    </section>
                  </>
                )}
              </>
            )}
            {page === "leads" && (
              <>
                <Header
                  eyebrow="SALES WORKSPACE"
                  title="Dari niat baik, menjadi perjalanan."
                  sub="Kelola prospek, tindak lanjut, dan reservasi tanpa kehilangan jejak."
                >
                  {sales && (
                    <>
                      <button className="button" onClick={() => bookingForm()}>
                        <Plane size={16} />
                        Reservasi langsung
                      </button>
                      <button className="button primary" onClick={leadForm}>
                        <Plus size={16} />
                        Tambah prospek
                      </button>
                    </>
                  )}
                </Header>
                <div className="stats-grid">
                  <Stat
                    icon={Contact}
                    title="Total prospek"
                    value={db.leads.length}
                    foot="Semua sumber akuisisi"
                  />
                  <Stat
                    icon={PhoneIcon}
                    title="Dalam tindak lanjut"
                    value={
                      db.leads.filter((l) =>
                        ["NEW", "CONTACTED"].includes(l.status),
                      ).length
                    }
                    tone="blue"
                    foot="Perlu pendekatan personal"
                  />
                  <Stat
                    icon={Target}
                    title="Siap booking"
                    value={
                      db.leads.filter((l) => l.status === "QUALIFIED").length
                    }
                    tone="gold"
                    foot="Prospek terkualifikasi"
                  />
                  <Stat
                    icon={CheckCircle2}
                    title="Terkonversi"
                    value={
                      db.leads.filter((l) => l.status === "CONVERTED").length
                    }
                    tone="green"
                    foot="Terhubung ke reservasi"
                  />
                </div>
                <div className="kanban">
                  {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED"].map((s) => (
                    <section className="kanban-column" key={s}>
                      <h3>
                        <i className={s.toLowerCase()} />
                        {labels[s]}
                        <span>
                          {db.leads.filter((l) => l.status === s).length}
                        </span>
                      </h3>
                      {db.leads
                        .filter((l) => l.status === s)
                        .map((l) => (
                          <article className="lead-card" key={l.id}>
                            <div className="lead-source">
                              {l.source}
                              <MoreHorizontal size={16} />
                            </div>
                            <h3>{l.name}</h3>
                            <p>{l.phone}</p>
                            <div className="interest">
                              <Plane size={14} />
                              {l.interest}
                            </div>
                            {l.note && <p className="lead-note">{l.note}</p>}
                            <div className="lead-footer">
                              <span>
                                <Avatar size={23} />
                                {l.owner}
                              </span>
                              {sales && s !== "CONVERTED" && (
                                <button
                                  className="text-btn"
                                  onClick={() =>
                                    s === "QUALIFIED"
                                      ? bookingForm(l)
                                      : action("leadStatus", {
                                          id: l.id,
                                          status:
                                            s === "NEW"
                                              ? "CONTACTED"
                                              : "QUALIFIED",
                                        })
                                  }
                                >
                                  {s === "QUALIFIED"
                                    ? "Booking"
                                    : s === "NEW"
                                      ? "Hubungi"
                                      : "Kualifikasi"}
                                  <ArrowRight size={14} />
                                </button>
                              )}
                            </div>
                          </article>
                        ))}
                    </section>
                  ))}
                </div>
                <section className="panel">
                  <SectionTitle
                    title="Daftar booking"
                    sub="DP minimum demo Rp5.000.000. Pembayaran PENDING belum mengonfirmasi kursi."
                  />
                  {table(
                    [
                      "JAMAAH",
                      "KEBERANGKATAN",
                      "STATUS",
                      "MASA HOLD",
                      ...(finance ? ["SISA TAGIHAN"] : []),
                    ],
                    e.books.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <PersonCell p={person(b.personId)} />
                        </td>
                        <td>{dep(b.departureId).code}</td>
                        <td>
                          <Badge status={b.status} />
                        </td>
                        <td>
                          {b.status === "RESERVED"
                            ? new Date(b.holdUntil).toLocaleString("id-ID", {
                                timeZone: "Asia/Jakarta",
                              }) + " WIB"
                            : "—"}
                        </td>
                        {finance && <td>{money(b.outstanding)}</td>}
                      </tr>
                    )),
                  )}
                </section>
              </>
            )}
            {page === "finance" && finance && (
              <>
                <Header
                  eyebrow="CASHFLOW PROTECTION"
                  title="Kas aman. Keputusan lebih tenang."
                  sub="Bedakan uang yang tersedia, penerimaan yang diharapkan, dan kewajiban."
                >
                  <button className="button" onClick={costForm}>
                    <Plus size={16} />
                    Biaya supplier
                  </button>
                  <button
                    className="button primary"
                    onClick={() => paymentForm()}
                  >
                    <Plus size={16} />
                    Catat pembayaran
                  </button>
                </Header>
                <div className="stats-grid">
                  <Stat
                    icon={Wallet}
                    title="Kas tersedia · aktual"
                    value={money(db.openingCash, true)}
                    foot="Tidak termasuk piutang / pembayaran pending"
                  />
                  <Stat
                    icon={Receipt}
                    title="Total piutang"
                    value={money(e.outstanding, true)}
                    tone="blue"
                    foot="Tagihan aktif yang belum terbayar"
                  />
                  <Stat
                    icon={Clock}
                    title="Menunggu verifikasi"
                    value={money(
                      db.payments
                        .filter((p) => p.status === "PENDING")
                        .reduce((s, p) => s + p.amount, 0),
                      true,
                    )}
                    tone="gold"
                    foot={`${db.payments.filter((p) => p.status === "PENDING").length} pembayaran perlu diperiksa`}
                  />
                  <Stat
                    icon={ShieldAlert}
                    title="Proyeksi kas terendah"
                    value={money(e.lowestCash, true)}
                    tone={e.lowestCash < 0 ? "red" : "green"}
                    foot="Forecast ≠ saldo aktual"
                  />
                </div>
                <div className="tabs tab-line">
                  {[
                    ["payments", "Pembayaran"],
                    ["invoices", "Invoice & Piutang"],
                    ["calendar", "Money Calendar"],
                    ["suppliers", "Supplier & Biaya"],
                    ["credits", "Credit & Refund"],
                  ].map(([v, l]) => (
                    <button
                      key={v}
                      className={tab === v ? "active" : ""}
                      onClick={() => setTab(v)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                {tab === "payments" && (
                  <section className="panel no-top">
                    {table(
                      [
                        "JAMAAH / REFERENSI",
                        "NOMINAL",
                        "TANGGAL",
                        "STATUS",
                        "TINDAKAN",
                      ],
                      db.payments.map((p) => {
                        const b = e.books.find((b) => b.id === p.bookingId);
                        return (
                          <tr key={p.id}>
                            <td>
                              <PersonCell
                                p={person(b.personId)}
                                sub={p.note || p.method}
                              />
                            </td>
                            <td className="amount">{money(p.amount)}</td>
                            <td>{date(p.date)}</td>
                            <td>
                              {p.reversed ? (
                                <Badge status="REJECTED">
                                  Reversal tercatat
                                </Badge>
                              ) : (
                                <Badge status={p.status} />
                              )}
                            </td>
                            <td>
                              {p.status === "PENDING" ? (
                                <div className="button-row">
                                  <button
                                    className="button small success"
                                    onClick={() =>
                                      confirm(
                                        "Verifikasi pembayaran?",
                                        `${money(p.amount)} untuk ${person(b.personId).name}. Saldo dan booking akan dihitung ulang.`,
                                        () =>
                                          action(
                                            "verifyPayment",
                                            { id: p.id },
                                            "Pembayaran terverifikasi. Saldo dan status booking diperbarui.",
                                          ),
                                        "Verifikasi",
                                      )
                                    }
                                  >
                                    <Check size={14} />
                                    Verifikasi
                                  </button>
                                  <button
                                    className="icon-btn"
                                    aria-label="Tolak pembayaran"
                                    onClick={() =>
                                      confirm(
                                        "Tolak pembayaran?",
                                        "Pembayaran ditolak tidak menambah saldo terbayar.",
                                        () =>
                                          action("rejectPayment", { id: p.id }),
                                        "Tolak",
                                      )
                                    }
                                  >
                                    <X size={17} />
                                  </button>
                                </div>
                              ) : p.status === "VERIFIED" && !p.reversed ? (
                                <button
                                  className="text-btn muted"
                                  onClick={() =>
                                    form(
                                      "Reversal pembayaran",
                                      "Transaksi asli tetap tersimpan. Catat pembayaran pengganti melalui tombol Catat pembayaran.",
                                      [
                                        {
                                          name: "reason",
                                          label: "Alasan koreksi",
                                          full: true,
                                        },
                                      ],
                                      (d) =>
                                        action("reversePayment", {
                                          id: p.id,
                                          ...d,
                                        }),
                                      "Catat reversal",
                                    )
                                  }
                                >
                                  <RotateCcw size={13} />
                                  Reversal
                                </button>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      }),
                    )}
                  </section>
                )}
                {tab === "invoices" && (
                  <section className="panel no-top">
                    {table(
                      [
                        "JAMAAH",
                        "TOTAL INVOICE",
                        "TERBAYAR VERIFIED",
                        "OUTSTANDING",
                        "CREDIT",
                        "",
                      ],
                      e.books
                        .filter((b) =>
                          ["CONFIRMED", "RESERVED"].includes(b.status),
                        )
                        .map((b) => (
                          <tr key={b.id}>
                            <td>
                              <PersonCell
                                p={person(b.personId)}
                                sub={dep(b.departureId).code}
                              />
                            </td>
                            <td>{money(b.total)}</td>
                            <td className="positive">{money(b.paid)}</td>
                            <td
                              className={b.outstanding ? "amount" : "positive"}
                            >
                              {b.outstanding ? money(b.outstanding) : "Lunas"}
                            </td>
                            <td>{money(b.credit)}</td>
                            <td>
                              <button
                                className="text-btn"
                                onClick={() => paymentForm(b)}
                              >
                                Catat bayar
                                <Plus size={14} />
                              </button>
                              <button
                                className="icon-btn"
                                aria-label={`Batalkan booking ${person(b.personId).name}`}
                                onClick={() => cancelForm(b)}
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        )),
                    )}
                  </section>
                )}

                {tab === "credits" && (
                  <>
                    <section className="panel">
                      <SectionTitle
                        title="Credit balance"
                        sub="Kelebihan bayar dan pembayaran booking yang dibatalkan tetap tercatat, bukan potongan invoice."
                      />
                      {table(
                        [
                          "JAMAAH",
                          "BOOKING",
                          "CREDIT TERSEDIA",
                          "SUDAH DIREFUND",
                          "TINDAKAN",
                        ],
                        e.books
                          .filter(
                            (b) => b.credit > 0 || b.status === "CANCELLED",
                          )
                          .map((b) => (
                            <tr key={b.id}>
                              <td>
                                <PersonCell
                                  p={person(b.personId)}
                                  sub={dep(b.departureId).code}
                                />
                              </td>
                              <td>
                                <Badge status={b.status} />
                              </td>
                              <td className="amount">{money(b.credit)}</td>
                              <td>{money(b.refunded)}</td>
                              <td>
                                {b.credit > 0 && (
                                  <button
                                    className="text-btn"
                                    onClick={() => refundForm(b)}
                                  >
                                    Proses refund
                                    <ArrowUpRight size={15} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          )),
                      )}
                    </section>
                    <section className="panel">
                      <SectionTitle
                        title="Riwayat refund"
                        sub="Transaksi pembayaran asli dan alasan pengembalian tetap disimpan."
                      />
                      {table(
                        ["JAMAAH", "TANGGAL", "NOMINAL", "ALASAN", "STATUS"],
                        (db.refunds || []).map((r) => (
                          <tr key={r.id}>
                            <td>
                              {
                                person(
                                  e.books.find((b) => b.id === r.bookingId)
                                    .personId,
                                ).name
                              }
                            </td>
                            <td>{date(r.date)}</td>
                            <td>{money(r.amount)}</td>
                            <td>{r.reason}</td>
                            <td>
                              <Badge status="VERIFIED">Selesai</Badge>
                            </td>
                          </tr>
                        )),
                      )}
                    </section>
                  </>
                )}
                {tab === "calendar" && (
                  <>
                    <div className="callout">
                      <AlertTriangle size={20} />
                      <div>
                        <b>
                          {e.lowestCash < 0
                            ? "Proyeksi menunjukkan risiko kekurangan kas."
                            : "Proyeksi kas dalam kondisi positif."}
                        </b>
                        <p>
                          Penerimaan adalah estimasi pelunasan. Kewajiban
                          supplier tetap harus dipenuhi sesuai tenggat.
                        </p>
                      </div>
                    </div>
                    <section className="panel">
                      <SectionTitle
                        title="Proyeksi saldo berjalan"
                        sub="Saldo awal aktual + perkiraan penerimaan − komitmen pengeluaran."
                      />
                      <CashChart events={e.calendar} opening={db.openingCash} />
                    </section>
                    <section className="panel no-top">
                      {table(
                        [
                          "TANGGAL",
                          "ARUS KAS",
                          "JENIS",
                          "NOMINAL",
                          "PROYEKSI SALDO",
                        ],
                        e.calendar.map((c, i) => (
                          <tr key={c.id + "-" + i}>
                            <td>{date(c.date)}</td>
                            <td>
                              <b>{c.name}</b>
                            </td>
                            <td>
                              <Badge
                                status={c.type === "IN" ? "VERIFIED" : "REVIEW"}
                              >
                                {c.label}
                              </Badge>
                            </td>
                            <td
                              className={
                                c.type === "IN" ? "positive" : "negative"
                              }
                            >
                              {c.type === "IN" ? "+" : "−"}
                              {money(c.amount)}
                            </td>
                            <td
                              className={
                                c.balance < 0 ? "negative amount" : "amount"
                              }
                            >
                              {money(c.balance)}
                            </td>
                          </tr>
                        )),
                      )}
                    </section>
                  </>
                )}
                {tab === "suppliers" && (
                  <section className="panel no-top">
                    {table(
                      [
                        "SUPPLIER",
                        "KEBERANGKATAN",
                        "JATUH TEMPO",
                        "NOMINAL",
                        "STATUS",
                        "",
                      ],
                      db.costs.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <div className="table-stack">
                              <b>{c.supplier}</b>
                              <small>{c.category}</small>
                            </div>
                          </td>
                          <td>{dep(c.departureId).code}</td>
                          <td>{date(c.due)}</td>
                          <td className="amount">{money(c.amount)}</td>
                          <td>
                            <Badge status={c.status} />
                          </td>
                          <td>
                            {c.status === "UNPAID" && (
                              <button
                                className="text-btn"
                                onClick={() =>
                                  confirm(
                                    "Konfirmasi pembayaran supplier?",
                                    `${c.supplier} · ${money(c.amount)} akan mengurangi kas tersedia.`,
                                    () => action("payCost", { id: c.id }),
                                    "Bayar supplier",
                                  )
                                }
                              >
                                Bayar
                                <ArrowUpRight size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      )),
                    )}
                  </section>
                )}
              </>
            )}
            {page === "documents" && (
              <>
                <Header
                  eyebrow="DOCUMENT READINESS"
                  title="Berkas lengkap, langkah lebih mantap."
                  sub="Unggah simulasi tidak otomatis terverifikasi. Masa berlaku paspor diperiksa terhadap tanggal perjalanan."
                />
                <div className="toolbar">
                  <div className="tabs">
                    {[
                      ["all", "Semua jamaah"],
                      ["pending", "Perlu pemeriksaan"],
                      ["verified", "Lengkap"],
                    ].map(([v, l]) => (
                      <button
                        key={v}
                        className={filter === v ? "active" : ""}
                        onClick={() => setFilter(v)}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <div className="input-search">
                    <Search size={17} />
                    <input
                      placeholder="Cari jamaah…"
                      value={search}
                      onChange={(ev) => setSearch(ev.target.value)}
                    />
                  </div>
                </div>
                <section className="panel no-top">
                  {table(
                    [
                      "JAMAAH",
                      "PASPOR",
                      "MASA BERLAKU",
                      "VISA",
                      "FOTO",
                      "TINDAKAN",
                    ],
                    people
                      .filter(
                        (p) =>
                          filter === "all" ||
                          (Object.values(p.docs).every((s) => s === "VERIFIED")
                            ? filter === "verified"
                            : filter === "pending"),
                      )
                      .map((p) => (
                        <tr key={p.id}>
                          <td>
                            <PersonCell p={p} />
                          </td>
                          <td>
                            <Badge status={p.docs.passport} />
                          </td>
                          <td>{date(p.passportExpiry)}</td>
                          <td>
                            <Badge status={p.docs.visa} />
                          </td>
                          <td>
                            <Badge status={p.docs.photo} />
                          </td>
                          <td>
                            {ops && (
                              <div className="button-row">
                                <button
                                  className="icon-btn"
                                  aria-label={`Unggah dokumen ${p.name}`}
                                  onClick={() => uploadForm(p)}
                                >
                                  <Upload size={16} />
                                </button>
                                <button
                                  className="text-btn"
                                  onClick={() => documentForm(p)}
                                >
                                  Periksa
                                  <ArrowUpRight size={15} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )),
                  )}
                </section>
              </>
            )}
            {page === "tasks" && (
              <>
                <Header
                  eyebrow="DEPARTURE AUTOPILOT"
                  title="Tim searah, persiapan terjaga."
                  sub="Tugas berbasis keberangkatan dengan penanggung jawab dan tenggat yang jelas."
                >
                  {ops && (
                    <button className="button primary" onClick={taskForm}>
                      <Plus size={16} />
                      Tambah tugas
                    </button>
                  )}
                </Header>
                <div className="toolbar">
                  <div className="tabs">
                    {[
                      ["all", "Semua tugas"],
                      ["open", "Belum selesai"],
                      ["done", "Selesai"],
                    ].map(([v, l]) => (
                      <button
                        key={v}
                        className={filter === v ? "active" : ""}
                        onClick={() => setFilter(v)}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <span className="result-count">
                    {db.tasks.filter((t) => t.done).length} dari{" "}
                    {db.tasks.length} selesai
                  </span>
                </div>
                <section className="panel no-top task-list">
                  {db.tasks
                    .filter(
                      (t) =>
                        filter === "all" ||
                        (filter === "done" && t.done) ||
                        (filter === "open" && !t.done),
                    )
                    .map((t) => (
                      <div
                        className={`task-item ${t.done ? "done" : ""}`}
                        key={t.id}
                      >
                        <button
                          disabled={!ops || busy}
                          aria-label={`${t.done ? "Buka kembali" : "Selesaikan"} ${t.title}`}
                          className="task-check"
                          onClick={() => action("task", { id: t.id })}
                        >
                          {t.done && <Check size={16} />}
                        </button>
                        <div>
                          <h3>{t.title}</h3>
                          <p>
                            {dep(t.departureId).code} <span>·</span> {t.owner}
                          </p>
                        </div>
                        <span className="task-date">
                          <CalendarDays size={14} />
                          {date(t.due)}
                        </span>
                        <Badge status={t.done ? "VERIFIED" : "REVIEW"}>
                          {t.done ? "Selesai" : "Terjadwal"}
                        </Badge>
                      </div>
                    ))}
                </section>
              </>
            )}
            {page === "exceptions" && (
              <>
                <Header
                  eyebrow="EXCEPTION ENGINE"
                  title="Ketahui risikonya. Tentukan langkahnya."
                  sub="Satu kondisi, satu exception. Status dihitung ulang setelah data sumber diperbaiki."
                />
                <div className="toolbar">
                  <div className="tabs">
                    {[
                      ["all", "Semua risiko"],
                      ["BLOCKER", "Blocker"],
                      ["RISK", "Perhatian"],
                    ].map(([v, l]) => (
                      <button
                        key={v}
                        className={filter === v ? "active" : ""}
                        onClick={() => setFilter(v)}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <section className="panel no-top">
                  {table(
                    [
                      "SEVERITY",
                      "MASALAH / DAMPAK",
                      "PENANGGUNG JAWAB",
                      "TENGGAT",
                      "TINDAKAN",
                    ],
                    e.exceptions
                      .filter((x) => filter === "all" || x.severity === filter)
                      .map((x) => (
                        <tr key={x.id}>
                          <td>
                            <Badge status={x.severity} />
                          </td>
                          <td>
                            <div className="table-stack">
                              <b>{x.title}</b>
                              <small>
                                {x.detail} · {dep(x.departureId).code}
                              </small>
                            </div>
                          </td>
                          <td>{x.owner}</td>
                          <td>{date(x.due)}</td>
                          <td>
                            <button
                              className="text-btn"
                              onClick={() => handleException(x)}
                            >
                              {x.action}
                              <ArrowUpRight size={14} />
                            </button>
                          </td>
                        </tr>
                      )),
                  )}
                </section>
              </>
            )}
            {page === "agents" && (
              <>
                <Header
                  eyebrow="DISTRIBUSI TRAVEL"
                  title="Mitra perjalanan, tumbuh bersama."
                  sub="Atribusi agen paket Umroh terpisah dari program affiliate subscription SaaS."
                />
                <div className="agent-grid">
                  {db.agents.map((a) => {
                    const bs = e.books.filter(
                      (b) => b.agentId === a.id && b.status === "CONFIRMED",
                    );
                    return (
                      <section className="panel agent-card" key={a.id}>
                        <Avatar p={a} size={68} />
                        <h2>{a.name}</h2>
                        <p>
                          <MapPin size={14} />
                          {a.city} · {a.code}
                        </p>
                        <div className="agent-stat">
                          <b>
                            {bs.length}
                            <small>Jamaah terkonfirmasi</small>
                          </b>
                          {finance && (
                            <b>
                              {money(
                                bs.reduce((s, b) => s + b.total, 0),
                                true,
                              )}
                              <small>Nilai booking</small>
                            </b>
                          )}
                        </div>
                        <div className="inline-note">
                          <CircleHelp size={15} />
                          Komisi mengikuti kesepakatan agen; belum ditetapkan
                          dalam demo.
                        </div>
                        <button
                          className="button wide"
                          onClick={() =>
                            setSelected(selected === a.id ? null : a.id)
                          }
                        >
                          Lihat atribusi booking
                          <ChevronDown size={16} />
                        </button>
                        {selected === a.id &&
                          bs.map((b) => (
                            <div className="agent-booking" key={b.id}>
                              <b>{person(b.personId).name}</b>
                              <small>{dep(b.departureId).code}</small>
                            </div>
                          ))}
                      </section>
                    );
                  })}
                </div>
              </>
            )}
            {page === "reports" && finance && (
              <>
                <Header
                  eyebrow="PROFIT GUARD"
                  title="Bukan hanya ramai. Harus tetap sehat."
                  sub="Pahami proyeksi revenue, biaya, margin, dan dampak keputusan."
                >
                  <button
                    className="button"
                    onClick={() =>
                      exportCSV(
                        e.journeys.map((d) => ({
                          Keberangkatan: d.name,
                          Revenue: d.revenue,
                          Biaya: d.cost,
                          Profit: d.profit,
                          Margin: d.margin.toFixed(2) + "%",
                          Status: d.status,
                        })),
                        "profit-guard",
                      )
                    }
                  >
                    <Download size={16} />
                    Ekspor laporan
                  </button>
                </Header>
                <div className="stats-grid">
                  <Stat
                    icon={TrendingUp}
                    title="Projected revenue"
                    value={money(e.projectedRevenue, true)}
                    foot="Booking aktif termasuk held reservation"
                  />
                  <Stat
                    icon={Wallet}
                    title="Projected cost"
                    value={money(e.projectedCost, true)}
                    tone="gold"
                    foot="Komitmen biaya supplier"
                  />
                  <Stat
                    icon={Target}
                    title="Projected profit"
                    value={money(e.projectedRevenue - e.projectedCost, true)}
                    tone="green"
                    foot="Revenue dikurangi cost"
                  />
                  <Stat
                    icon={CheckCircle2}
                    title="Penerimaan terverifikasi"
                    value={money(e.collected, true)}
                    tone="blue"
                    foot="Aktual · reversal dikecualikan"
                  />
                </div>
                <section className="panel">
                  <SectionTitle
                    title="Profit per keberangkatan"
                    sub="Proyeksi, bukan laba aktual hasil rekonsiliasi."
                  />
                  {table(
                    [
                      "KEBERANGKATAN",
                      "REVENUE",
                      "COST",
                      "PROFIT",
                      "MARGIN",
                      "BREAK-EVEN",
                    ],
                    e.journeys.map((d) => (
                      <tr key={d.id}>
                        <td>
                          <div className="table-stack">
                            <b>{d.name}</b>
                            <small>{d.code}</small>
                          </div>
                        </td>
                        <td>{money(d.revenue, true)}</td>
                        <td>{money(d.cost, true)}</td>
                        <td
                          className={
                            d.profit >= 0
                              ? "positive amount"
                              : "negative amount"
                          }
                        >
                          {money(d.profit, true)}
                        </td>
                        <td>
                          <Badge
                            status={
                              d.margin >= policy.marginWarning
                                ? "VERIFIED"
                                : "REVIEW"
                            }
                          >
                            {d.margin.toFixed(1)}%
                          </Badge>
                        </td>
                        <td>
                          {Math.ceil(d.cost / pkg(d.packageId).price)} jamaah*
                        </td>
                      </tr>
                    )),
                  )}
                  <p className="table-note">
                    *Simulasi sederhana: biaya komitmen ÷ harga per jamaah.
                    Belum memodelkan biaya variabel tambahan.
                  </p>
                </section>
                <ProfitSimulator journeys={e.journeys} packages={db.packages} />
                <section className="panel">
                  <SectionTitle title="Empat pilar, satu kendali" />
                  <div className="pillar-grid">
                    {[
                      [
                        "READY",
                        ShieldCheck,
                        "Kesiapan terlihat sebelum hari keberangkatan.",
                      ],
                      [
                        "SAFE",
                        ShieldAlert,
                        "Blocker tetap terlihat meski score tinggi.",
                      ],
                      [
                        "CASH-SAFE",
                        Wallet,
                        "Kebutuhan kas diketahui sebelum jatuh tempo.",
                      ],
                      [
                        "PROFITABLE",
                        TrendingUp,
                        "Margin dipahami sebelum keputusan dibuat.",
                      ],
                    ].map(([name, Icon, desc]) => (
                      <div key={name}>
                        <Icon size={24} />
                        <h3>{name}</h3>
                        <p>{desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
            {page === "settings" && (
              <>
                <Header
                  eyebrow="WORKSPACE & KONTROL"
                  title="Satu arah untuk seluruh tim."
                  sub="Konfigurasi demo, hak akses, status modul, dan jejak aktivitas."
                />
                <div className="tabs tab-line">
                  {[
                    ["workspace", "Workspace"],
                    ["rules", "Aturan demo"],
                    ["roadmap", "Modul & Roadmap"],
                    ...(role === "owner"
                      ? [["commercial", "Kualifikasi SaaS"]]
                      : []),
                    ["audit", "Audit trail"],
                  ].map(([v, l]) => (
                    <button
                      className={tab === v ? "active" : ""}
                      key={v}
                      onClick={() => setTab(v)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                {!["rules", "roadmap", "audit", "commercial"].includes(tab) && (
                  <div className="detail-grid">
                    <section className="panel">
                      <SectionTitle
                        title="Al Barokah Travel"
                        sub="Organisasi dummy · Operasional Umroh"
                      />
                      <div className="settings-line">
                        <span>Tipe organisasi</span>
                        <b>PPIU · profil simulasi</b>
                      </div>
                      <div className="settings-line">
                        <span>Vertical aktif</span>
                        <Badge status="VERIFIED">Umroh · Demo</Badge>
                      </div>
                      <div className="settings-line">
                        <span>Zona waktu</span>
                        <b>Asia/Jakarta (WIB)</b>
                      </div>
                      <div className="settings-line">
                        <span>Tanggal skenario</span>
                        <b>17 Oktober 2026</b>
                      </div>
                      <div className="inline-note">
                        <CircleHelp size={17} />
                        Semua nama, pembayaran, dan data operasional adalah
                        simulasi. Foto profil merupakan foto ilustrasi, bukan
                        identitas jamaah.
                      </div>
                    </section>
                    <section className="panel">
                      <SectionTitle
                        title="Jelajahi sudut pandang tim"
                        sub="Pilihan peran adalah simulasi, bukan autentikasi produksi."
                      />
                      <div className="role-grid">
                        {Object.entries(roleNames).map(([r, n]) => (
                          <button
                            key={r}
                            className={role === r ? "selected" : ""}
                            onClick={() => {
                              setRole(r);
                              goto("dashboard");
                            }}
                          >
                            <Eye size={18} />
                            {n}
                            {role === r && <Check size={16} />}
                          </button>
                        ))}
                      </div>
                      {role === "owner" && (
                        <button
                          className="button danger"
                          onClick={() =>
                            confirm(
                              "Reset data demo?",
                              "Seluruh perubahan simulasi akan dihapus dan skenario awal dipulihkan.",
                              async () => {
                                setBusy(true);
                                try {
                                  const r = await fetch("/api/reset", {
                                    method: "POST",
                                    headers,
                                  });
                                  if (!r.ok) throw Error("Reset gagal");
                                  await refresh();
                                  setModal(null);
                                  notify("Skenario awal dipulihkan.");
                                } catch (e) {
                                  notify(e.message, true);
                                } finally {
                                  setBusy(false);
                                }
                              },
                              "Reset data demo",
                            )
                          }
                        >
                          <RotateCcw size={15} />
                          Reset skenario demo
                        </button>
                      )}
                    </section>
                  </div>
                )}
                {tab === "rules" && (
                  <section className="panel">
                    <SectionTitle
                      title="Aturan deterministik demo"
                      sub="Parameter yang belum final pada blueprint digunakan sebagai asumsi simulasi."
                    />
                    {[
                      ["Masa hold reservasi", "2 × 24 jam · sesuai blueprint"],
                      ["DP minimum", "Rp5.000.000 · simulasi"],
                      [
                        "Validitas paspor",
                        "6 bulan setelah tanggal pulang · simulasi",
                      ],
                      [
                        "Readiness score",
                        "Rata-rata checklist sama bobot · simulasi",
                      ],
                      ["Ambang margin perhatian", "12% · simulasi"],
                      [
                        "Final Clearance",
                        "Tidak ada blocker, piutang, atau tugas terbuka",
                      ],
                      ["Pembayaran", "Hanya VERIFIED menambah saldo terbayar"],
                      [
                        "Integrasi eksternal",
                        "Tidak aktif · tanpa WhatsApp, gateway, atau sistem pemerintah",
                      ],
                    ].map(([a, b]) => (
                      <div className="settings-line" key={a}>
                        <span>{a}</span>
                        <b>{b}</b>
                      </div>
                    ))}
                  </section>
                )}
                {tab === "roadmap" && (
                  <section className="panel">
                    <SectionTitle
                      title="Tumbuh bersama kebutuhan perjalanan"
                      sub="Urutan pengembangan dari blueprint. Tidak menunjukkan tanggal rilis."
                    />
                    {[
                      [
                        "V1.0",
                        "Operasional Umroh",
                        "Core operasional, readiness, exception, cashflow, dan profit.",
                        "Demo interaktif",
                      ],
                      [
                        "V1.5",
                        "Network & Commercial",
                        "Parent–child, shared departure allocation, dan affiliate.",
                        "Roadmap",
                      ],
                      [
                        "V2",
                        "Haji Khusus · PIHK",
                        "Workflow dan readiness khusus Haji Khusus.",
                        "Roadmap",
                      ],
                      [
                        "V2.x",
                        "Bimbingan Haji · KBIHU",
                        "Cohort, manasik, kehadiran, dan guidance readiness.",
                        "Roadmap",
                      ],
                    ].map(([v, n, d, s]) => (
                      <div className="roadmap-row" key={v}>
                        <span className="version">{v}</span>
                        <div>
                          <h3>{n}</h3>
                          <p>{d}</p>
                        </div>
                        <Badge status={v === "V1.0" ? "VERIFIED" : "REVIEW"}>
                          {s}
                        </Badge>
                      </div>
                    ))}
                    <div className="inline-note">
                      <Lock size={17} />
                      Harga subscription, komisi affiliate, dan rate card resmi
                      belum ditetapkan. Tidak ada penawaran harga resmi dalam
                      demo ini.
                    </div>
                  </section>
                )}
                {tab === "commercial" && role === "owner" && (
                  <QualificationPanel
                    db={db}
                    onSubmit={(data) => action("qualification", data)}
                  />
                )}
                {tab === "audit" && (
                  <section className="panel no-top">
                    {table(
                      ["WAKTU (WIB)", "AKTOR", "AKTIVITAS"],
                      db.audit.map((a) => (
                        <tr key={a.id}>
                          <td>
                            {new Date(a.time).toLocaleString("id-ID", {
                              timeZone: "Asia/Jakarta",
                            })}
                          </td>
                          <td>
                            <b>{a.actor}</b>
                          </td>
                          <td>{a.action}</td>
                        </tr>
                      )),
                    )}
                  </section>
                )}
              </>
            )}
            {page === "journey" && (
              <VisitorFlow
                role={role}
                routeStep={tab === "needs" ? 1 : undefined}
                onNavigate={navigateVisitor}
                onStartTour={() => openOnboarding("tour")}
                onNotice={notify}
              />
            )}
            <footer className="page-footer">
              <span>
                © 2026 Arah Jamaah <i />
                Setiap amanah, lebih terarah.
              </span>
              <span>
                <span className="green-dot" />
                Semua data adalah simulasi
                <span className="footer-version">v1.0 Demo</span>
              </span>
            </footer>
          </main>
        </div>
      </div>
      <VisitorOnboarding
        page={page}
        finance={finance}
        onNavigate={navigateVisitor}
        control={onboardingControl}
        appRef={appRef}
      />
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(ev) =>
            ev.target === ev.currentTarget && !busy && setModal(null)
          }
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <div className="modal-logo">
                <img src="/brand.svg" alt="" />
              </div>
              <button
                className="icon-btn"
                disabled={busy}
                onClick={() => setModal(null)}
                aria-label="Tutup dialog"
              >
                <X size={21} />
              </button>
            </div>
            <h2 id="modal-title">{modal.title}</h2>
            <p className="modal-desc">{modal.description}</p>
            {modal.tour ? (
              <>
                <div className="tour-steps">
                  {[
                    [
                      "01",
                      "Tangkap peluang",
                      "Buka Leads & Booking, kualifikasi prospek, lalu buat reservasi.",
                    ],
                    [
                      "02",
                      "Verifikasi amanah",
                      "Catat dan verifikasi DP di Keuangan. Lihat booking menjadi confirmed.",
                    ],
                    [
                      "03",
                      "Siapkan perjalanan",
                      "Periksa dokumen, alokasikan kamar, dan selesaikan tugas.",
                    ],
                    [
                      "04",
                      "Kendalikan bisnis",
                      "Buka Money Calendar dan Profit Guard untuk menilai kesehatan perjalanan.",
                    ],
                  ].map(([n, t, d]) => (
                    <div key={n}>
                      <span>{n}</span>
                      <div>
                        <h3>{t}</h3>
                        <p>{d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="inline-note">
                  <Eye size={17} />
                  Ganti peran di kanan atas untuk mencoba sudut pandang tim.
                  Semua transaksi hanya simulasi.
                </div>
                <button
                  className="button primary wide"
                  onClick={() => {
                    setModal(null);
                    goto("leads");
                  }}
                >
                  Mulai dari prospek
                  <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <form
                onSubmit={(ev) => {
                  ev.preventDefault();
                  if (!busy)
                    modal.submit(
                      Object.fromEntries(new FormData(ev.currentTarget)),
                    );
                }}
              >
                <div className="form-grid">
                  {modal.fields?.map((f) => (
                    <Field key={f.name} field={f} />
                  ))}
                </div>
                <div className="modal-actions">
                  <button
                    className="button"
                    type="button"
                    disabled={busy}
                    onClick={() => setModal(null)}
                  >
                    Batal
                  </button>
                  <button
                    className="button primary"
                    type="submit"
                    disabled={busy}
                  >
                    {busy ? "Menyimpan…" : modal.button || "Konfirmasi"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div className={`toast ${toast.error ? "error" : ""}`} role="status">
          {toast.error ? (
            <AlertTriangle size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
          <span>{toast.message}</span>
          <button
            className="icon-btn"
            onClick={() => setToast(null)}
            aria-label="Tutup pesan"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
function PhoneIcon(p) {
  return <Contact {...p} />;
}
function CashChart({ events, opening }) {
  const values = [opening, ...events.map((e) => e.balance)],
    min = Math.min(0, ...values),
    max = Math.max(...values, 1),
    y = (v) => 145 - ((v - min) / (max - min || 1)) * 120;
  const points = values
    .map((v, i) => `${45 + (i / (values.length - 1 || 1)) * 830},${y(v)}`)
    .join(" ");
  return (
    <div className="cash-chart">
      <svg
        viewBox="0 0 920 190"
        role="img"
        aria-label="Grafik proyeksi saldo kas"
      >
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#704078" stopOpacity=".18" />
            <stop offset="100%" stopColor="#704078" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line
              x1="45"
              x2="875"
              y1={25 + 120 * f}
              y2={25 + 120 * f}
              stroke="#eeeaf0"
              strokeDasharray="5 5"
            />
            <text x="0" y={29 + 120 * f} fontSize="10" fill="#999">
              {((max - (max - min) * f) / 1000000).toFixed(0)} jt
            </text>
          </g>
        ))}
        <polygon points={`45,150 ${points} 875,150`} fill="url(#chartFill)" />
        <polyline
          points={points}
          fill="none"
          stroke="#703a7a"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {values.map((v, i) => (
          <circle
            key={i}
            cx={45 + (i / (values.length - 1 || 1)) * 830}
            cy={y(v)}
            r="3.5"
            fill={v < 0 ? "#c35f5d" : "#703a7a"}
          >
            <title>{money(v)}</title>
          </circle>
        ))}
        <line
          x1="45"
          x2="875"
          y1={y(0)}
          y2={y(0)}
          stroke="#c35f5d"
          strokeDasharray="4 4"
        />
        {events.length > 0 && (
          <>
            <text x="45" y="178" fontSize="11" fill="#999">
              Saldo awal
            </text>
            <text x="810" y="178" fontSize="11" fill="#999">
              {date(events.at(-1).date)}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
function ProfitSimulator({ journeys, packages }) {
  const [id, setId] = useState(journeys[0].id),
    [discount, setDiscount] = useState(0),
    [extra, setExtra] = useState(0);
  const d = journeys.find((d) => d.id === id),
    rev = d.revenue * (1 - discount / 100),
    cost = d.cost + Number(extra),
    profit = rev - cost;
  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <h2>
            Bagaimana jika? <span className="count-badge">Simulasi</span>
          </h2>
          <p>
            Uji dampak diskon dan tambahan biaya sebelum mengambil keputusan.
          </p>
        </div>
        <span className="simulation-label">
          <Sparkles size={15} />
          Tidak mengubah transaksi
        </span>
      </div>
      <div className="simulator">
        <div>
          <label>
            Keberangkatan
            <select value={id} onChange={(e) => setId(e.target.value)}>
              {journeys.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Diskon seluruh booking <b>{discount}%</b>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </label>
          <label>
            Tambahan biaya (Rp)
            <input
              type="number"
              min="0"
              value={extra}
              onChange={(e) => setExtra(Math.max(0, Number(e.target.value)))}
            />
          </label>
        </div>
        <div className="simulation-result">
          <small>PROYEKSI SETELAH SIMULASI</small>
          <strong className={profit < 0 ? "negative" : ""}>
            {money(profit, true)}
          </strong>
          <p>
            {rev ? ((profit / rev) * 100).toFixed(1) : 0}% margin ·{" "}
            {Math.ceil(
              cost /
                (packages.find((p) => p.id === d.packageId).price *
                  (1 - discount / 100)),
            )}{" "}
            jamaah break-even
          </p>
          <Badge
            status={
              (profit / rev) * 100 >= policy.marginWarning
                ? "VERIFIED"
                : "REVIEW"
            }
          >
            {(profit / rev) * 100 >= policy.marginWarning
              ? "Margin di atas ambang demo"
              : "Margin perlu perhatian"}
          </Badge>
          <span>
            Ambang 12% adalah parameter simulasi, bukan kebijakan final.
          </span>
        </div>
      </div>
    </section>
  );
}

function QualificationPanel({ db, onSubmit }) {
  return (
    <>
      <section className="panel">
        <div className="section-title">
          <div>
            <h2>
              Kualifikasi SaaS <span className="count-badge">Simulasi</span>
            </h2>
            <p>
              Program affiliate menjual subscription Arah Jamaah, terpisah dari
              agen paket Umroh.
            </p>
          </div>
        </div>
        <div className="inline-note">
          <CircleHelp size={18} />
          Breakpoint pada demo bersifat ilustratif. Harga dan komisi resmi belum
          ditetapkan; hasil ini bukan quotation.
        </div>
        <form
          className="qualification-form"
          onSubmit={(ev) => {
            ev.preventDefault();
            onSubmit(Object.fromEntries(new FormData(ev.currentTarget)));
          }}
        >
          <div className="form-grid">
            {[
              { name: "organization", label: "Nama organisasi", full: true },
              {
                name: "module",
                label: "Modul yang dibutuhkan",
                type: "select",
                full: true,
                options: [
                  { value: "UMRAH_OPERATIONS", label: "Operasional Umroh" },
                  { value: "HAJJ_SPECIAL", label: "Haji Khusus · Roadmap" },
                  { value: "HAJJ_GUIDANCE", label: "Bimbingan Haji · Roadmap" },
                ],
              },
              {
                name: "ttm",
                label: "Jamaah terproses TTM (jika ada)",
                type: "number",
                min: 0,
                required: false,
                hint: "Volume aktual 12 bulan; kosongkan untuk travel baru.",
              },
              {
                name: "active",
                label: "Jamaah aktif",
                type: "number",
                min: 0,
                value: 50,
              },
              {
                name: "departures",
                label: "Keberangkatan aktif",
                type: "number",
                min: 0,
                value: 2,
              },
              {
                name: "users",
                label: "Jumlah pengguna",
                type: "number",
                min: 1,
                value: 3,
              },
              {
                name: "branches",
                label: "Jumlah cabang / organisasi",
                type: "number",
                min: 1,
                value: 1,
              },
              {
                name: "referral",
                label: "Kode referral affiliate",
                required: false,
              },
            ].map((f) => (
              <Field key={f.name} field={f} />
            ))}
          </div>
          <button className="button primary" type="submit">
            Simpan kualifikasi simulasi
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
      {(db.qualifications || []).map((q) => (
        <section className="panel" key={q.id}>
          <div className="section-title">
            <div>
              <h2>{q.organization}</h2>
              <p>
                {q.confidence} · {q.referral}
              </p>
            </div>
            <Badge status={q.manualReview ? "REVIEW" : "VERIFIED"}>
              {q.manualReview
                ? "Manual review"
                : q.provisional
                  ? "Provisional"
                  : "Simulasi TTM"}
            </Badge>
          </div>
          <div className="qualification-result">
            <span className="qualification-tier">{q.plan}</span>
            <div>
              <b>{q.reason}</b>
              <p>{q.note}</p>
              <p>
                Harga resmi: belum tersedia. Tidak menerbitkan quotation atau
                menjanjikan aktivasi modul roadmap.
              </p>
            </div>
          </div>
          <div className="inline-note">
            <Clock size={17} />
            Kebijakan blueprint: quote resmi berlaku 14 hari; initial price lock
            90 hari; review kuartalan. Komisi earned memerlukan pembayaran
            subscription terverifikasi.
          </div>
        </section>
      ))}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
