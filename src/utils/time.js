import { MIN_COL_PX, PX_PER_MIN } from "../data/constants.js";

export function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fromMin(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;

  return `${h}:${String(m).padStart(2, "0")}`;
}

export function buildTicks(classes) {
  const allTimes = [];

  classes.forEach((c) => {
    allTimes.push(toMin(c.start));
    allTimes.push(toMin(c.end));
  });

  // ถ้ายังไม่มีวิชา
  if (allTimes.length === 0) {
    const start = toMin("08:30");
    const end = toMin("18:30");

    const ticks = [];

    for (let t = start; t <= end; t += 60) {
      ticks.push(t);
    }

    return ticks;
  }

  const minClassTime = Math.min(...allTimes);
  const maxClassTime = Math.max(...allTimes);

  // เริ่ม Timeline ที่ :30
  let minStart = Math.floor(minClassTime / 60) * 60 + 30;

  // ถ้าเวลาที่เร็วที่สุดอยู่ก่อนจุด :30
  // ต้องถอยไป :30 ของชั่วโมงก่อนหน้า
  if (minStart > minClassTime) {
    minStart -= 60;
  }

  // จบ Timeline ที่ :30 เช่นกัน
  let maxEnd = Math.floor(maxClassTime / 60) * 60 + 30;

  if (maxEnd < maxClassTime) {
    maxEnd += 60;
  }

  const ticks = [];

  for (let t = minStart; t <= maxEnd; t += 60) {
    ticks.push(t);
  }

  return ticks;
}

export function buildColumns(ticks) {
  const cols = [];

  for (let i = 0; i < ticks.length - 1; i++) {
    const start = ticks[i];
    const end = ticks[i + 1];

    cols.push({
      start,
      end,
      width: Math.max(
        MIN_COL_PX,
        (end - start) * PX_PER_MIN
      ),
    });
  }

  return cols;
}