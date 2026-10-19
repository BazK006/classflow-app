import { STORAGE_KEY } from "../data/constants.js";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("โหลดข้อมูลจาก localStorage ไม่สำเร็จ", e);
  }
  return { classes: [] };
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("บันทึกข้อมูลไม่สำเร็จ", e);
  }
}
