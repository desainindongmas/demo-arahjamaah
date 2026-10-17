import { derive, can } from "./domain.js";

export function viewState(db, role) {
  db = structuredClone(db);
  const engine = derive(db);
  if (["ops", "sales", "admin"].includes(role)) {
    delete db.openingCash;
    db.payments = [];
    db.costs = [];
    db.refunds = [];
    db.audit = db.audit.filter((a) => !a.actor?.includes("Finance"));
    for (const b of db.bookings) delete b.total;
    for (const b of engine.books) {
      delete b.total;
      delete b.paid;
      delete b.outstanding;
      delete b.credit;
      delete b.refunded;
    }
    for (const j of engine.journeys) {
      for (const k of ["revenue", "cost", "profit", "margin", "outstanding"])
        delete j[k];
    }
    for (const k of [
      "calendar",
      "lowestCash",
      "projectedRevenue",
      "projectedCost",
      "collected",
      "outstanding",
    ])
      delete engine[k];
    engine.exceptions = engine.exceptions.filter((e) => e.area !== "finance");
  }
  if (role !== "owner") delete db.qualifications;
  if (!can(role, "ops")) for (const p of db.people) delete p.files;
  return { ...db, engine, role, demo: true };
}
