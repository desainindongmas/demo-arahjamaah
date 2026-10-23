import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Play,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  TrendingUp,
  X,
  Sparkles,
  Calculator,
} from "lucide-react";
import { ONBOARDING_KEY, readLocal, writeLocal } from "../browser-storage.js";
import "./visitor.css";

const baseSteps = [
  {
    page: "dashboard",
    target: ".welcome-banner",
    name: "Satu kendali untuk setiap perjalanan",
    description:
      "Inilah Command Center. Buka hari dengan gambaran kesiapan keberangkatan, risiko, kas, dan profit tanpa berpindah-pindah catatan.",
    tag: "KENALI ARAH JAMAAH",
    icon: Compass,
  },
  {
    page: "dashboard",
    target: ".priority-panel",
    name: "Tahu masalah sebelum jadi krisis",
    description:
      "Prioritas menampilkan penghambat, penanggung jawab, dan tindakan berikutnya. Score tinggi tetap tidak menutupi paspor berisiko atau visa yang belum siap.",
    tag: "SAFE · EXCEPTION ENGINE",
    icon: ShieldAlert,
  },
  {
    page: "departures",
    target: ".trip-grid",
    name: "Pastikan jamaah benar-benar siap",
    description:
      "Setiap keberangkatan punya kapasitas dan readiness sendiri. Dokumen, pembayaran, kamar, dan tugas harus tuntas sebelum Final Clearance diberikan.",
    tag: "READY · DEPARTURE AUTOPILOT",
    icon: ShieldCheck,
  },
  {
    page: "finance",
    tab: "calendar",
    target: ".cash-chart",
    name: "Profit bagus, kas tetap harus aman",
    description:
      "Money Calendar membedakan kas aktual, piutang yang diperkirakan masuk, dan kewajiban supplier. Lihat potensi kekurangan dana sebelum jatuh tempo.",
    tag: "CASH-SAFE · MONEY CALENDAR",
    icon: Wallet,
    finance: true,
  },
  {
    page: "reports",
    target: ".simulator",
    name: "Coba keputusan, pahami dampaknya",
    description:
      "Profit Guard membantu melihat margin dan break-even. Uji pengaruh diskon atau tambahan biaya pada simulator tanpa mengubah transaksi.",
    tag: "PROFITABLE · PROFIT GUARD",
    icon: TrendingUp,
    finance: true,
  },
  {
    page: "journey",
    target: ".visitor-flow-heading",
    name: "Temukan kebutuhan travel Anda",
    description:
      "Setelah melihat demo, hitung kebutuhan travel, lihat paket rekomendasi, lalu kirim permintaan pilot ke Tim Arah Jamaah.",
    tag: "LANGKAH BERIKUTNYA",
    icon: Calculator,
  },
];
function useDialogKeyboard(ref, active, onEscape) {
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement;
    const frame = requestAnimationFrame(() =>
      ref.current?.querySelector("button")?.focus(),
    );
    const handler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        escapeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [
        ...(ref.current?.querySelectorAll(
          "button:not(:disabled),a[href],input,select",
        ) || []),
      ];
      if (!items.length) return;
      const first = items[0],
        last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handler, true);
      if (previous?.isConnected) previous.focus();
    };
  }, [active, ref]);
}
export default function VisitorOnboarding({
  finance,
  onNavigate,
  control,
  appRef,
  page,
}) {
  const [mode, setMode] = useState(() =>
    readLocal(ONBOARDING_KEY)?.seen ? null : "welcome",
  );
  const [index, setIndex] = useState(0),
    [rect, setRect] = useState(null),
    [position, setPosition] = useState(null);
  const panel = useRef(null),
    navigateRef = useRef(onNavigate);
  navigateRef.current = onNavigate;
  const steps = baseSteps.filter((step) => !step.finance || finance),
    step = steps[index];
  const finish = (destination, stage) => {
    writeLocal(ONBOARDING_KEY, {
      seen: true,
      completed: mode === "tour" && index === steps.length - 1,
      at: new Date().toISOString(),
    });
    setMode(null);
    if (destination) navigateRef.current(destination, stage);
  };
  useEffect(() => {
    if (!control?.id) return;
    setIndex(0);
    setMode(control.mode || "welcome");
  }, [control?.id]);
  useEffect(() => {
    if (mode !== "tour") return;
    setRect(null);
    setPosition(null);
    navigateRef.current(step.page, step.tab);
  }, [mode, index, step.page]);
  useEffect(() => {
    if (!mode) return;
    const app = appRef.current;
    if (app) app.inert = true;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (app) app.inert = false;
      document.body.style.overflow = overflow;
    };
  }, [mode, appRef]);
  useDialogKeyboard(panel, mode, () => finish());
  useLayoutEffect(() => {
    if (mode !== "tour") return;
    let frame,
      scrolled = false;
    const measure = () => {
      const target = document.querySelector(step.target);
      if (!target) {
        setRect(null);
        setPosition({
          left: Math.max(12, (innerWidth - 370) / 2),
          top: Math.max(12, (innerHeight - 330) / 2),
        });
        return;
      }
      const initialBounds = target.getBoundingClientRect();
      if (
        !scrolled ||
        initialBounds.top > innerHeight - 100 ||
        initialBounds.bottom < 85
      ) {
        target.scrollIntoView({ block: "center", behavior: "instant" });
        scrolled = true;
      }
      const r = target.getBoundingClientRect(),
        pad = 7;
      const area = {
        left: Math.max(7, r.left - pad),
        top: Math.max(76, Math.min(r.top - pad, innerHeight - 120)),
        width: Math.min(innerWidth - 14, r.width + pad * 2),
        height: Math.min(innerHeight - 90, r.height + pad * 2),
      };
      area.height = Math.max(
        30,
        Math.min(area.height, innerHeight - area.top - 12),
      );
      if (innerWidth < 600)
        area.height = Math.min(area.height, Math.max(85, innerHeight * 0.35));
      setRect(area);
      const width = Math.min(370, innerWidth - 24),
        height = panel.current?.offsetHeight || 320;
      let top = area.top + area.height + 17;
      if (top + height > innerHeight - 12) top = area.top - height - 17;
      if (top < 78) top = Math.max(12, innerHeight - height - 12);
      setPosition({
        left: Math.max(12, Math.min(area.left, innerWidth - width - 12)),
        top: Math.max(12, Math.min(top, innerHeight - height - 12)),
        width,
      });
    };
    frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    const target = document.querySelector(step.target);
    if (target) observer.observe(target);
    if (panel.current) observer.observe(panel.current);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [mode, index, step.target, page]);
  if (!mode) return null;
  if (mode === "welcome")
    return (
      <div className="visitor-welcome-backdrop">
        <section
          className="visitor-welcome"
          role="dialog"
          aria-modal="true"
          aria-labelledby="visitor-welcome-title"
          aria-describedby="visitor-welcome-desc"
          ref={panel}
        >
          <div className="visitor-welcome-visual">
            <img src="/brand.svg" alt="Logo Arah Jamaah" />
            <span>ARAH JAMAAH</span>
            <div>
              <p>
                Setiap amanah,
                <br />
                lebih terarah.
              </p>
              <small>OPERASIONAL UMROH · DEMO INTERAKTIF</small>
            </div>
          </div>
          <div className="visitor-welcome-body">
            <button
              className="icon-btn visitor-welcome-close"
              aria-label="Lewati pengenalan"
              onClick={() => finish()}
            >
              <X size={20} />
            </button>
            <span className="visitor-eyebrow">
              <Sparkles size={14} />
              SELAMAT DATANG
            </span>
            <h1 id="visitor-welcome-title">
              Kenali cara kerja.
              <br />
              <em>Temukan arah Anda.</em>
            </h1>
            <p id="visitor-welcome-desc">
              Lihat bagaimana Arah Jamaah membantu travel menjaga kesiapan,
              mengantisipasi risiko, dan mengambil keputusan lebih tenang.
            </p>
            <div className="visitor-pillars">
              {[
                [ShieldCheck, "READY", "Jamaah siap berangkat"],
                [ShieldAlert, "SAFE", "Risiko terlihat lebih awal"],
                [Wallet, "CASH-SAFE", "Kebutuhan kas terpantau"],
                [TrendingUp, "PROFITABLE", "Margin tetap terkendali"],
              ].map(([Icon, title, desc]) => (
                <div key={title}>
                  <Icon size={20} />
                  <span>
                    <b>{title}</b>
                    <small>{desc}</small>
                  </span>
                </div>
              ))}
            </div>
            <button
              className="button primary wide visitor-main-cta"
              onClick={() => {
                setIndex(0);
                setMode("tour");
              }}
            >
              <Play size={16} />
              Mulai tur singkat<span>±2 menit</span>
              <ArrowRight size={16} />
            </button>
            <button className="button wide" onClick={() => finish("journey")}>
              Jelajahi sendiri
              <Compass size={17} />
            </button>
            <button
              className="visitor-text-link"
              onClick={() => finish("journey", "needs")}
            >
              Langsung hitung paket
              <ArrowRight size={14} />
            </button>
            <p className="visitor-disclaimer">
              Semua data dan transaksi adalah simulasi. Tur bisa diulang kapan
              saja.
            </p>
          </div>
        </section>
      </div>
    );
  const Icon = step.icon;
  return (
    <div className="visitor-tour-overlay">
      <div className="visitor-tour-blocker" />
      {rect && <div className="visitor-spotlight" style={rect} />}
      <section
        className="visitor-tour-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visitor-tour-title"
        aria-describedby="visitor-tour-description"
        ref={panel}
        style={position || { visibility: "hidden" }}
      >
        <div className="visitor-tour-top">
          <span>
            <Icon size={17} />
            {step.tag}
          </span>
          <button
            className="icon-btn"
            aria-label="Tutup tur"
            onClick={() => finish()}
          >
            <X size={18} />
          </button>
        </div>
        <div
          className="visitor-tour-progress"
          aria-label={`Langkah ${index + 1} dari ${steps.length}`}
        >
          {steps.map((_, i) => (
            <i key={i} className={i <= index ? "filled" : ""} />
          ))}
        </div>
        <h2 id="visitor-tour-title">{step.name}</h2>
        <p id="visitor-tour-description">{step.description}</p>
        <div className="visitor-tour-actions">
          <button className="visitor-text-link" onClick={() => finish()}>
            Lewati tur
          </button>
          <span>
            {index + 1} / {steps.length}
          </span>
          <button
            className="icon-btn"
            disabled={!index}
            aria-label="Langkah sebelumnya"
            onClick={() => setIndex((i) => i - 1)}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="button primary"
            onClick={() =>
              index === steps.length - 1
                ? finish("journey", "needs")
                : setIndex((i) => i + 1)
            }
          >
            {index === steps.length - 1 ? "Hitung paket" : "Lanjut"}
            {index === steps.length - 1 ? (
              <Check size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
