export const TODAY = "2026-10-17";
export const policy = {
  minimumDP: 5000000,
  holdHours: 48,
  passportMonths: 6,
  marginWarning: 12,
  label: "Parameter simulasi demo; bukan kebijakan final",
};
export const can = (role, area) =>
  (
    ({
      owner: ["sales", "finance", "ops", "admin"],
      admin: ["sales", "ops"],
      ops: ["ops"],
      finance: ["finance"],
      sales: ["sales"],
    })[role] || []
  ).includes(area);
export function seed() {
  const names = [
    "Ahmad Fauzi",
    "Siti Aminah",
    "Budi Santoso",
    "Nur Aisyah",
    "Muhammad Rizky",
    "Dewi Lestari",
    "Hendra Wijaya",
    "Fatimah Zahra",
    "Agus Setiawan",
    "Rina Wulandari",
    "Abdul Rahman",
    "Sri Wahyuni",
    "Dedi Hidayat",
    "Khadijah Putri",
    "Yusuf Maulana",
    "Lina Marlina",
    "Hasan Basri",
    "Ratna Sari",
    "Ibrahim Hakim",
    "Maryam Safitri",
    "Umar Faruq",
    "Zahra Nabila",
    "Ali Mustofa",
    "Aulia Rahma",
  ];
  const packages = [
    {
      id: "pkg1",
      name: "Umroh Signature",
      duration: 12,
      price: 32500000,
      hotel: "Swissôtel Makkah · Anwar Al Madinah",
      airline: "Saudia Airlines",
      image: "/photos/makkah.jpg",
    },
    {
      id: "pkg2",
      name: "Umroh Plus Turki",
      duration: 15,
      price: 41500000,
      hotel: "Pullman Zamzam · Hilton Istanbul",
      airline: "Turkish Airlines",
      image: "/photos/madinah.jpg",
    },
  ];
  const departures = [
    {
      id: "dep1",
      packageId: "pkg1",
      name: "Umroh Signature Oktober",
      date: "2026-10-28",
      returnDate: "2026-11-08",
      capacity: 12,
      code: "UMR-2810",
      cleared: false,
    },
    {
      id: "dep2",
      packageId: "pkg2",
      name: "Umroh Plus Turki November",
      date: "2026-11-04",
      returnDate: "2026-11-18",
      capacity: 16,
      code: "UMR-0411",
      cleared: false,
    },
    {
      id: "dep3",
      packageId: "pkg1",
      name: "Umroh Signature November",
      date: "2026-11-15",
      returnDate: "2026-11-26",
      capacity: 10,
      code: "UMR-1511",
      cleared: false,
    },
  ];
  const people = names.map((name, i) => ({
    id: `p${i + 1}`,
    name,
    phone: `0812${String(45210000 + i)}`,
    city: ["Jakarta", "Bandung", "Bekasi", "Surabaya"][i % 4],
    gender: i % 2 ? "Perempuan" : "Laki-laki",
    photo: `/photos/person-${i + 1}.jpg`,
    passportExpiry: [0, 10].includes(i) ? "2027-01-20" : "2029-08-14",
    docs: {
      passport: [0, 10].includes(i) ? "REVIEW" : "VERIFIED",
      visa: [3, 6, 12].includes(i) ? "MISSING" : "VERIFIED",
      photo: "VERIFIED",
    },
    room: i === 0 ? "" : `Kamar ${Math.floor(i / 2) + 1}`,
  }));
  const bookings = people.map((p, i) => ({
    id: `b${i + 1}`,
    personId: p.id,
    departureId: i < 10 ? "dep1" : i < 18 ? "dep2" : "dep3",
    total: i >= 10 && i < 18 ? 41500000 : 32500000,
    minDP: policy.minimumDP,
    status: i === 9 ? "RESERVED" : "CONFIRMED",
    holdUntil: Date.now() + 48 * 3600000,
    agentId: i % 3 === 0 ? "a1" : "a2",
    room: people[i].room,
    createdAt: TODAY,
  }));
  const payments = bookings.map((b, i) => ({
    id: `pay${i + 1}`,
    bookingId: b.id,
    amount: i === 9 ? 5000000 : i % 4 === 0 ? b.total : 15000000,
    status: i === 9 ? "PENDING" : "VERIFIED",
    date: "2026-10-16",
    method: "Transfer bank",
    note: "Saldo awal simulasi",
    reversed: false,
  }));
  return {
    organization: {
      id: "org1",
      name: "Al Barokah Travel",
      type: "PPIU",
      module: "UMRAH_OPERATIONS",
    },
    packages,
    departures,
    people,
    bookings,
    payments,
    openingCash: 85000000,
    leads: [
      {
        id: "l1",
        name: "Nadia Rahmawati",
        phone: "081234560001",
        source: "Instagram",
        status: "NEW",
        interest: "Umroh November",
        owner: "Rizky",
        note: "Ingin berangkat bersama orang tua",
      },
      {
        id: "l2",
        name: "Fajar Pratama",
        phone: "081234560002",
        source: "Referensi agen",
        status: "CONTACTED",
        interest: "Umroh Plus Turki",
        owner: "Rizky",
        note: "Follow up pilihan kamar",
      },
      {
        id: "l3",
        name: "Hj. Yuni Kartika",
        phone: "081234560003",
        source: "Website",
        status: "QUALIFIED",
        interest: "Umroh Signature",
        owner: "Dina",
        note: "Siap booking 1 kursi",
      },
      {
        id: "l4",
        name: "Rizal Hidayat",
        phone: "081234560004",
        source: "Walk-in",
        status: "NEW",
        interest: "Umroh Signature",
        owner: "Dina",
        note: "",
      },
    ],
    costs: [
      {
        id: "c1",
        departureId: "dep1",
        supplier: "Saudia Airlines",
        category: "Tiket pesawat",
        amount: 148000000,
        due: "2026-10-20",
        status: "UNPAID",
      },
      {
        id: "c2",
        departureId: "dep1",
        supplier: "Swissôtel Makkah",
        category: "Hotel Makkah",
        amount: 65000000,
        due: "2026-10-23",
        status: "UNPAID",
      },
      {
        id: "c3",
        departureId: "dep1",
        supplier: "Anwar Al Madinah",
        category: "Hotel Madinah",
        amount: 42000000,
        due: "2026-10-25",
        status: "PAID",
      },
      {
        id: "c4",
        departureId: "dep2",
        supplier: "Turkish Airlines",
        category: "Tiket pesawat",
        amount: 138000000,
        due: "2026-10-30",
        status: "UNPAID",
      },
      {
        id: "c5",
        departureId: "dep2",
        supplier: "Mitra Istanbul",
        category: "Hotel & transport",
        amount: 115000000,
        due: "2026-11-01",
        status: "UNPAID",
      },
      {
        id: "c6",
        departureId: "dep3",
        supplier: "Saudia Airlines",
        category: "Tiket & akomodasi",
        amount: 157000000,
        due: "2026-11-09",
        status: "UNPAID",
      },
    ],
    tasks: [
      {
        id: "t1",
        title: "Finalisasi rooming list Oktober",
        departureId: "dep1",
        owner: "Dina · Operasional",
        due: "2026-10-19",
        done: false,
      },
      {
        id: "t2",
        title: "Konfirmasi jadwal manasik",
        departureId: "dep1",
        owner: "Dina · Operasional",
        due: "2026-10-20",
        done: false,
      },
      {
        id: "t3",
        title: "Distribusi perlengkapan jamaah",
        departureId: "dep2",
        owner: "Dina · Operasional",
        due: "2026-10-26",
        done: false,
      },
      {
        id: "t4",
        title: "Konfirmasi transport bandara",
        departureId: "dep3",
        owner: "Dina · Operasional",
        due: "2026-11-08",
        done: true,
      },
    ],
    agents: [
      {
        id: "a1",
        name: "H. Lukman Hakim",
        city: "Jakarta",
        photo: "/photos/person-17.jpg",
        code: "AG-LUKMAN",
      },
      {
        id: "a2",
        name: "Rizky Ananda",
        city: "Bandung",
        photo: "/photos/person-5.jpg",
        code: "AG-RIZKY",
      },
    ],
    audit: [
      {
        id: "au1",
        actor: "Dina · Operasional",
        action: "Memverifikasi dokumen 8 jamaah",
        time: "2026-10-17T08:30:00+07:00",
      },
      {
        id: "au2",
        actor: "Rani · Finance",
        action: "Memverifikasi pembayaran awal simulasi",
        time: "2026-10-17T08:15:00+07:00",
      },
    ],
  };
}
export function paid(db, bid) {
  return db.payments
    .filter(
      (p) => p.bookingId === bid && p.status === "VERIFIED" && !p.reversed,
    )
    .reduce((s, p) => s + p.amount, 0);
}
export function active(b, now = Date.now()) {
  return (
    b.status === "CONFIRMED" || (b.status === "RESERVED" && b.holdUntil > now)
  );
}
export function expire(db, now = Date.now()) {
  for (const b of db.bookings)
    if (
      b.status === "RESERVED" &&
      b.holdUntil <= now &&
      paid(db, b.id) < b.minDP
    ) {
      b.status = "EXPIRED";
      db.audit.unshift({
        id: crypto.randomUUID(),
        actor: "Departure Autopilot",
        action: `Hold ${b.id} kedaluwarsa; kursi dikembalikan`,
        time: new Date().toISOString(),
      });
    }
}
export function derive(db) {
  const books = db.bookings.map((b) => {
    const refunded = (db.refunds || [])
      .filter((r) => r.bookingId === b.id && r.status === "COMPLETED")
      .reduce((s, r) => s + r.amount, 0);
    return {
      ...b,
      paid: paid(db, b.id),
      outstanding:
        b.status === "CANCELLED" ? 0 : Math.max(0, b.total - paid(db, b.id)),
      refunded,
      credit: Math.max(
        0,
        paid(db, b.id) - (b.status === "CANCELLED" ? 0 : b.total) - refunded,
      ),
    };
  });
  const exceptions = [];
  const journeys = db.departures.map((d) => {
    const bs = books.filter((b) => b.departureId === d.id && active(b));
    let complete = 0,
      total = 0;
    for (const b of bs) {
      const p = db.people.find((p) => p.id === b.personId);
      const checks = [
        b.status === "CONFIRMED",
        b.outstanding === 0,
        ...Object.values(p.docs).map((v) => v === "VERIFIED"),
        !!b.room,
      ];
      total += checks.length;
      complete += checks.filter(Boolean).length;
      const limit = new Date(`${d.returnDate}T00:00:00Z`);
      limit.setUTCMonth(limit.getUTCMonth() + policy.passportMonths);
      const add = (suffix, title, area, severity, action) =>
        exceptions.push({
          id: `${b.id}-${suffix}`,
          departureId: d.id,
          bookingId: b.id,
          personId: p.id,
          title,
          detail: p.name,
          area,
          severity,
          owner: area === "finance" ? "Rani · Finance" : "Dina · Operasional",
          due: d.date,
          action,
        });
      if (p.docs.passport !== "VERIFIED" || new Date(p.passportExpiry) < limit)
        add(
          "passport",
          new Date(p.passportExpiry) < limit
            ? "Masa berlaku paspor berisiko"
            : "Paspor belum terverifikasi",
          "ops",
          "BLOCKER",
          "Periksa paspor",
        );
      if (p.docs.visa !== "VERIFIED")
        add(
          "visa",
          "Visa belum terverifikasi",
          "ops",
          "BLOCKER",
          "Periksa visa",
        );
      if (p.docs.photo !== "VERIFIED")
        add(
          "photo",
          "Foto belum terverifikasi",
          "ops",
          "BLOCKER",
          "Periksa foto",
        );
      if (b.outstanding > 0)
        add(
          "payment",
          "Pelunasan belum selesai",
          "finance",
          "RISK",
          "Lihat tagihan",
        );
      if (!b.room)
        add("room", "Kamar belum dialokasikan", "ops", "BLOCKER", "Atur kamar");
    }
    for (const t of db.tasks.filter((t) => t.departureId === d.id && !t.done))
      exceptions.push({
        id: t.id,
        departureId: d.id,
        title: t.title,
        detail: "Checklist keberangkatan",
        area: "ops",
        severity: "RISK",
        owner: t.owner,
        due: t.due,
        action: "Selesaikan tugas",
        taskId: t.id,
      });
    const blocker = exceptions.filter(
      (e) => e.departureId === d.id && e.severity === "BLOCKER",
    ).length;
    const revenue = bs.reduce((s, b) => s + b.total, 0),
      cost = db.costs
        .filter((c) => c.departureId === d.id)
        .reduce((s, c) => s + c.amount, 0);
    const outstanding = bs.reduce((s, b) => s + b.outstanding, 0);
    const openTasks = db.tasks.filter(
      (t) => t.departureId === d.id && !t.done,
    ).length;
    return {
      ...d,
      booked: bs.length,
      confirmed: bs.filter((b) => b.status === "CONFIRMED").length,
      available: d.capacity - bs.length,
      score: total ? Math.round((complete / total) * 100) : 0,
      blocker,
      status: blocker
        ? "BLOCKED"
        : outstanding || openTasks || !bs.length
          ? "AT_RISK"
          : "READY",
      revenue,
      cost,
      profit: revenue - cost,
      margin: revenue ? ((revenue - cost) / revenue) * 100 : 0,
      outstanding,
      openTasks,
    };
  });
  let balance = db.openingCash;
  const calendar = [];
  const events = [
    ...books
      .filter((b) => active(b) && b.outstanding > 0)
      .map((b) => ({
        id: b.id,
        date: new Date(
          new Date(
            db.departures.find((d) => d.id === b.departureId).date +
              "T12:00:00Z",
          ).getTime() -
            7 * 86400000,
        )
          .toISOString()
          .slice(0, 10),
        name: db.people.find((p) => p.id === b.personId).name,
        amount: b.outstanding,
        type: "IN",
        label: "Piutang diperkirakan",
      })),
    ...db.costs
      .filter((c) => c.status === "UNPAID")
      .map((c) => ({
        id: c.id,
        date: c.due,
        name: c.supplier,
        amount: c.amount,
        type: "OUT",
        label: "Kewajiban supplier",
      })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  for (const e of events) {
    balance += e.type === "IN" ? e.amount : -e.amount;
    calendar.push({ ...e, balance });
  }
  return {
    books,
    journeys,
    exceptions,
    calendar,
    lowestCash: Math.min(db.openingCash, ...calendar.map((e) => e.balance)),
    projectedRevenue: journeys.reduce((s, d) => s + d.revenue, 0),
    projectedCost: journeys.reduce((s, d) => s + d.cost, 0),
    collected: db.payments
      .filter((p) => p.status === "VERIFIED" && !p.reversed)
      .reduce((s, p) => s + p.amount, 0),
    outstanding: books
      .filter((b) => active(b))
      .reduce((s, b) => s + b.outstanding, 0),
  };
}
export function mutate(db, action, data, role = "owner") {
  const areas = {
    qualification: "admin",
    cancelBooking: "finance",
    refund: "finance",
    uploadDocument: "ops",
    lead: "sales",
    leadStatus: "sales",
    booking: "sales",
    payment: "finance",
    verifyPayment: "finance",
    rejectPayment: "finance",
    reversePayment: "finance",
    document: "ops",
    room: "ops",
    task: "ops",
    addTask: "ops",
    cost: "finance",
    payCost: "finance",
    clearance: "ops",
    close: "ops",
  };
  if (!areas[action] || !can(role, areas[action]))
    throw Error("Akses peran tidak mengizinkan tindakan ini.");
  const id = () => crypto.randomUUID();
  const requireItem = (list, key) => {
    const v = list.find((x) => x.id === key);
    if (!v) throw Error("Data tidak ditemukan.");
    return v;
  };
  const amount = (n) => {
    n = Number(n);
    if (!Number.isFinite(n) || n <= 0)
      throw Error("Nominal harus lebih dari nol.");
    return n;
  };
  expire(db);
  let result;

  if (action === "cancelBooking") {
    const b = requireItem(db.bookings, data.id);
    if (!active(b)) throw Error("Hanya booking aktif yang dapat dibatalkan.");
    if (requireItem(db.departures, b.departureId).closed)
      throw Error("Perjalanan telah ditutup.");
    if (!data.reason?.trim()) throw Error("Alasan pembatalan wajib diisi.");
    b.status = "CANCELLED";
    b.cancellationReason = data.reason;
    requireItem(db.departures, b.departureId).cleared = false;
  }
  if (action === "refund") {
    const b = requireItem(db.bookings, data.bookingId);
    const credit = derive(db).books.find((x) => x.id === b.id).credit;
    const n = amount(data.amount);
    if (n > credit) throw Error("Refund melebihi credit yang tersedia.");
    if (n > db.openingCash)
      throw Error("Kas tersedia tidak cukup untuk refund.");
    if (!data.reason?.trim()) throw Error("Alasan refund wajib diisi.");
    db.refunds ||= [];
    db.refunds.unshift({
      id: id(),
      bookingId: b.id,
      amount: n,
      status: "COMPLETED",
      reason: data.reason,
      date: TODAY,
    });
    db.openingCash -= n;
  }
  if (action === "uploadDocument") {
    const p = requireItem(db.people, data.personId);
    if (!["passport", "visa", "photo"].includes(data.type))
      throw Error("Jenis dokumen tidak valid.");
    const file = data.file;
    if (
      !file ||
      !["application/pdf", "image/jpeg", "image/png"].includes(file.mime) ||
      typeof file.base64 !== "string" ||
      file.base64.length > 700000
    )
      throw Error("Gunakan PDF, JPG, atau PNG maksimal 500 KB.");
    const bytes = Buffer.from(file.base64, "base64");
    const valid =
      file.mime === "application/pdf"
        ? bytes.subarray(0, 5).toString() === "%PDF-"
        : file.mime === "image/png"
          ? bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"
          : bytes[0] === 255 && bytes[1] === 216;
    if (!valid) throw Error("Isi file tidak sesuai jenis dokumen.");
    p.files ||= {};
    p.files[data.type] = {
      name: String(file.name).slice(0, 150),
      mime: file.mime,
      base64: file.base64,
    };
    p.docs[data.type] = "REVIEW";
  }
  if (action === "qualification") {
    const volume = Number(data.ttm || data.active || 0),
      branches = Number(data.branches || 1),
      users = Number(data.users || 1),
      departures = Number(data.departures || 0);
    if (
      [volume, branches, users, departures].some(
        (n) => !Number.isFinite(n) || n < 0,
      )
    )
      throw Error("Data operasional harus angka positif.");
    const future = data.module !== "UMRAH_OPERATIONS",
      review = branches > 1 || users > 50 || departures > 30;
    const plan = review
      ? "NETWORK"
      : volume <= 100
        ? "MITRA"
        : volume <= 300
          ? "STARTER"
          : volume <= 1000
            ? "GROWTH"
            : "SCALE";
    db.qualifications ||= [];
    db.qualifications.unshift({
      id: id(),
      organization: data.organization,
      plan: future ? "BELUM TERSEDIA" : plan,
      provisional: !data.ttm,
      confidence: future
        ? "Belum dapat ditawarkan"
        : data.ttm
          ? "Berdasarkan input TTM simulasi"
          : "Provisional · data aktif",
      manualReview: review || future,
      reason: future
        ? "Modul PIHK/KBIHU masih roadmap."
        : review
          ? "Kompleksitas jaringan/pengguna memerlukan review."
          : `${volume} jamaah ${data.ttm ? "TTM" : "aktif"} · ${departures} keberangkatan · ${users} pengguna.`,
      referral: data.referral || "Tanpa referral",
      officialPrice: null,
      createdAt: new Date().toISOString(),
      note: "Breakpoint ilustratif, bukan pricing policy yang dipublikasikan.",
    });
  }
  if (action === "lead") {
    if (!data.name?.trim()) throw Error("Nama wajib diisi.");
    db.leads.unshift({
      id: id(),
      name: data.name,
      phone: data.phone || "",
      source: data.source || "Website",
      interest: data.interest || "Umroh Signature",
      status: "NEW",
      owner: "Rizky",
      note: data.note || "",
    });
  }
  if (action === "leadStatus") {
    const l = requireItem(db.leads, data.id);
    if (!["NEW", "CONTACTED", "QUALIFIED"].includes(data.status))
      throw Error("Status tidak valid.");
    l.status = data.status;
  }
  if (action === "booking") {
    const d = requireItem(db.departures, data.departureId);
    if (d.cleared || d.closed) throw Error("Keberangkatan sudah dikunci.");
    if (
      db.bookings.filter((b) => b.departureId === d.id && active(b)).length >=
      d.capacity
    )
      throw Error("Kapasitas penuh. Reservasi tidak dapat dibuat.");
    if (
      data.leadId &&
      db.leads.find((l) => l.id === data.leadId)?.status === "CONVERTED"
    )
      throw Error("Prospek sudah dikonversi.");
    let p = data.personId ? requireItem(db.people, data.personId) : null;
    if (
      p &&
      db.bookings.some(
        (b) => b.personId === p.id && b.departureId === d.id && active(b),
      )
    )
      throw Error("Jamaah sudah terdaftar pada keberangkatan ini.");
    if (!p) {
      if (!data.name?.trim()) throw Error("Nama jamaah wajib diisi.");
      p = {
        id: id(),
        name: data.name,
        phone: data.phone || "",
        city: data.city || "Jakarta",
        gender: data.gender || "Laki-laki",
        photo: "/photos/person-1.jpg",
        passportExpiry: "",
        docs: { passport: "MISSING", visa: "MISSING", photo: "MISSING" },
        room: "",
      };
      db.people.unshift(p);
    }
    const b = {
      id: id(),
      personId: p.id,
      departureId: d.id,
      total: db.packages.find((p) => p.id === d.packageId).price,
      minDP: policy.minimumDP,
      status: "RESERVED",
      holdUntil: Date.now() + 48 * 3600000,
      agentId: data.agentId || "a2",
      room: "",
      createdAt: TODAY,
    };
    db.bookings.unshift(b);
    if (data.leadId) requireItem(db.leads, data.leadId).status = "CONVERTED";
    db.tasks.unshift({
      id: id(),
      title: `Lengkapi dokumen ${p.name}`,
      departureId: d.id,
      owner: "Dina · Operasional",
      due: d.date,
      done: false,
    });
    result = b;
  }
  if (action === "payment") {
    const b = requireItem(db.bookings, data.bookingId);
    if (!active(b)) throw Error("Booking tidak aktif.");
    db.payments.unshift({
      id: id(),
      bookingId: b.id,
      amount: amount(data.amount),
      status: "PENDING",
      date: TODAY,
      method: data.method || "Transfer bank",
      note: data.note || "",
      reversed: false,
    });
  }
  if (["verifyPayment", "rejectPayment", "reversePayment"].includes(action)) {
    const p = requireItem(db.payments, data.id),
      b = requireItem(db.bookings, p.bookingId);
    if (action === "reversePayment") {
      if (p.status !== "VERIFIED" || p.reversed)
        throw Error(
          "Hanya pembayaran terverifikasi aktif yang dapat direversal.",
        );
      if (!data.reason?.trim()) throw Error("Alasan reversal wajib diisi.");
      p.reversed = true;
      p.reversalReason = data.reason;
      if (paid(db, b.id) < b.minDP) {
        b.status = "RESERVED";
        b.holdUntil = Date.now() + 48 * 3600000;
      }
    } else {
      if (p.status !== "PENDING") throw Error("Pembayaran sudah diproses.");
      if (!active(b))
        throw Error("Booking telah kedaluwarsa. Buat reservasi baru.");
      p.status = action === "verifyPayment" ? "VERIFIED" : "REJECTED";
      if (paid(db, b.id) >= b.minDP) b.status = "CONFIRMED";
    }
  }
  if (action === "document") {
    const p = requireItem(db.people, data.personId);
    if (
      !["passport", "visa", "photo"].includes(data.type) ||
      !["REVIEW", "VERIFIED", "REJECTED"].includes(data.status)
    )
      throw Error("Status dokumen tidak valid.");
    if (data.type === "passport") {
      if (!data.expiry || !/^\d{4}-\d{2}-\d{2}$/.test(data.expiry))
        throw Error("Tanggal berlaku paspor diperlukan.");
      p.passportExpiry = data.expiry;
    }
    p.docs[data.type] = data.status;
  }
  if (action === "room") {
    if (!data.room?.trim()) throw Error("Nama kamar wajib diisi.");
    requireItem(db.bookings, data.bookingId).room = data.room;
  }
  if (action === "task") {
    const t = requireItem(db.tasks, data.id);
    t.done = !t.done;
  }
  if (action === "addTask") {
    requireItem(db.departures, data.departureId);
    if (!data.title?.trim()) throw Error("Judul wajib diisi.");
    db.tasks.unshift({
      id: id(),
      title: data.title,
      departureId: data.departureId,
      owner: "Dina · Operasional",
      due: data.due || TODAY,
      done: false,
    });
  }
  if (action === "cost") {
    requireItem(db.departures, data.departureId);
    if (!data.supplier?.trim()) throw Error("Supplier wajib diisi.");
    db.costs.unshift({
      id: id(),
      departureId: data.departureId,
      supplier: data.supplier,
      category: data.category || "Operasional",
      amount: amount(data.amount),
      due: data.due || TODAY,
      status: "UNPAID",
    });
  }
  if (action === "payCost") {
    const c = requireItem(db.costs, data.id);
    if (c.status === "PAID") throw Error("Sudah dibayar.");
    if (db.openingCash < c.amount)
      throw Error(
        "Kas tersedia tidak cukup. Verifikasi penerimaan terlebih dahulu.",
      );
    c.status = "PAID";
    db.openingCash -= c.amount;
  }
  if (action === "verifyPayment")
    db.openingCash += requireItem(db.payments, data.id).amount;
  if (action === "reversePayment")
    db.openingCash -= requireItem(db.payments, data.id).amount;
  if (action === "clearance") {
    const d = requireItem(db.departures, data.id),
      j = derive(db).journeys.find((j) => j.id === d.id);
    if (j.status !== "READY")
      throw Error(
        "Final Clearance ditolak: selesaikan blocker, pelunasan, dan tugas terlebih dahulu.",
      );
    d.cleared = true;
  }
  if (action === "close") {
    const d = requireItem(db.departures, data.id);
    if (
      !d.cleared ||
      db.costs.some((c) => c.departureId === d.id && c.status !== "PAID")
    )
      throw Error(
        "Closing memerlukan clearance dan seluruh kewajiban supplier lunas.",
      );
    d.closed = true;
  }
  if (
    [
      "uploadDocument",
      "reversePayment",
      "document",
      "room",
      "task",
      "addTask",
      "cost",
      "payment",
      "booking",
    ].includes(action)
  )
    for (const d of db.departures)
      if (
        d.cleared &&
        derive(db).journeys.find((j) => j.id === d.id).status !== "READY"
      )
        d.cleared = false;
  db.audit.unshift({
    id: id(),
    actor: {
      owner: "Arif · Owner",
      finance: "Rani · Finance",
      ops: "Dina · Operasional",
      admin: "Admin",
      sales: "Rizky · Sales",
    }[role],
    action: `${{ qualification: "Menyimpan kualifikasi SaaS simulasi", cancelBooking: "Membatalkan booking", refund: "Mengembalikan credit / refund", uploadDocument: "Mengunggah dokumen untuk review", lead: "Menambahkan prospek", leadStatus: "Memperbarui tahap prospek", booking: "Membuat reservasi 48 jam", payment: "Mencatat pembayaran pending", verifyPayment: "Memverifikasi pembayaran", rejectPayment: "Menolak pembayaran", reversePayment: "Reversal pembayaran", document: "Memperbarui verifikasi dokumen", room: "Mengalokasikan kamar", task: "Memperbarui tugas", addTask: "Menambah tugas", cost: "Mencatat biaya supplier", payCost: "Membayar supplier", clearance: "Memberikan final clearance", close: "Closing & rekonsiliasi" }[action]}${data.name ? " · " + data.name : ""}${data.reason ? " · " + data.reason : ""}`,
    time: new Date().toISOString(),
  });
  return result;
}
