import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ExcelJS from "exceljs";
import { DAYS } from "../data/constants.js";
import { fromMin, toMin } from "./time.js";

function getTimestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return (
    `${now.getFullYear()}-` +
    `${pad(now.getMonth() + 1)}-` +
    `${pad(now.getDate())}_` +
    `${pad(now.getHours())}-` +
    `${pad(now.getMinutes())}-` +
    `${pad(now.getSeconds())}`
  );
}

// ตั้งชื่อไฟล์ให้เป็นรูปแบบเดียวกันทุกชนิด
function getExportFilename(extension) {
  return `ตารางเรียน_${getTimestamp()}.${extension}`;
}

// ดาวน์โหลดข้อมูลผ่าน Blob
function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Export JSON
export function exportJSON(classes = []) {
  const data = JSON.stringify({ classes }, null, 2);

  downloadBlob(
    data,
    getExportFilename("json"),
    "application/json;charset=utf-8",
  );
}

// จับภาพตารางเรียน
async function captureCanvas(node) {
  if (!node) {
    throw new Error("ไม่พบตารางเรียนที่ต้องการส่งออก");
  }

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  return html2canvas(node, {
    backgroundColor: "#1a1526",
    scale: 2,
    useCORS: true,
  });
}

// Export PNG
export async function downloadImage(node) {
  const canvas = await captureCanvas(node);
  const link = document.createElement("a");

  link.download = getExportFilename("png");
  link.href = canvas.toDataURL("image/png");

  document.body.appendChild(link);
  link.click();
  link.remove();
}

// Export PDF
export async function exportPDF(node) {
  const canvas = await captureCanvas(node);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  // ขนาดหน้ากระดาษ
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // ระยะขอบกระดาษ
  const margin = 24;

  // คำนวณขนาดภาพให้พอดีกระดาษ โดยรักษาสัดส่วนเดิม
  const scale = Math.min(
    (pageWidth - margin * 2) / canvas.width,
    (pageHeight - margin * 2) / canvas.height,
  );

  const imgWidth = canvas.width * scale;
  const imgHeight = canvas.height * scale;

  // จัดภาพให้อยู่กึ่งกลางหน้ากระดาษ
  const x = (pageWidth - imgWidth) / 2;
  const y = (pageHeight - imgHeight) / 2;

  pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

  pdf.save(getExportFilename("pdf"));
}

// แปลงสี HEX จากการ์ดวิชาเป็นสี ARGB สำหรับ Excel
function toExcelColor(color, fallback = "FFFFFF") {
  const hex = String(color ?? "")
    .trim()
    .replace(/^#/, "");

  return {
    argb: /^[0-9a-fA-F]{6}$/.test(hex)
      ? `FF${hex.toUpperCase()}`
      : `FF${fallback}`,
  };
}

// เส้นขอบของช่องตาราง
function getExcelBorder() {
  const color = { argb: "FF3A2F56" };

  return {
    top: { style: "thin", color },
    bottom: { style: "thin", color },
    left: { style: "thin", color },
    right: { style: "thin", color },
  };
}

// สร้างช่องเวลาแบบเดียวกับตาราง Dynamic ในหน้าเว็บ
function buildExcelTimeColumns(classes, cols = []) {
  const boundaries = [
    ...cols.flatMap((col) => [Number(col.start), Number(col.end)]),
    ...classes.flatMap((cls) => [toMin(cls.start), toMin(cls.end)]),
  ].filter((value) => Number.isFinite(value) && value >= 0 && value <= 1440);

  const ticks = [...new Set(boundaries)].sort((a, b) => a - b);

  return ticks.slice(0, -1).map((start, index) => {
    const end = ticks[index + 1];

    // หาคอลัมน์เดิมที่ครอบคลุมช่วงเวลานี้
    const parent = cols.find(
      (col) => Number(col.start) <= start && Number(col.end) >= end,
    );

    const parentDuration = parent
      ? Number(parent.end) - Number(parent.start)
      : 0;

    const parentWidth = parent ? Number.parseFloat(parent.width) : 0;

    const widthPx =
      parentDuration > 0 && Number.isFinite(parentWidth) && parentWidth > 0
        ? parentWidth * ((end - start) / parentDuration)
        : (end - start) * 2;

    return {
      start,
      end,
      // Excel ใช้หน่วยความกว้างต่างจาก CSS pixel
      width: Math.max(4, widthPx / 7),
    };
  });
}

// สร้างข้อความภายในการ์ดวิชา
function getExcelClassText(cls) {
  const section = String(cls.section ?? "").trim();

  const credits =
    cls.credits == null || cls.credits === "" ? "" : String(cls.credits).trim();

  const groupCredits = [
    section ? `กลุ่ม ${section}` : "",
    credits !== "" ? `(${credits} หน่วยกิต)` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    `${cls.courseCode ? `(${cls.courseCode}) ` : ""}${cls.subject ?? ""}`,
    groupCredits,
    `เวลา ${cls.start}-${cls.end} น.`,
    cls.teacher || "",
    cls.room ? `${cls.room}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// Export Excel
export async function exportExcel(classes = [], cols = []) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "ClassFlow App";
  workbook.subject = "ตารางเรียน";
  workbook.title = "ClassFlow App - ตารางเรียน";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("ตารางเรียน", {
    views: [
      {
        state: "frozen",
        xSplit: 1,
        ySplit: 1,
        showGridLines: false,
      },
    ],
  });

  const timeColumns = buildExcelTimeColumns(classes, cols);

  worksheet.columns = [
    { width: 16 },
    ...timeColumns.map((col) => ({
      width: col.width,
    })),
  ];

  // ตั้งค่าหน้ากระดาษสำหรับการพิมพ์
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.4,
      bottom: 0.4,
      header: 0.2,
      footer: 0.2,
    },
  };

  const border = getExcelBorder();

  const headerFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF221B33" },
  };

  const emptyFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1A1526" },
  };

  // ===== ส่วนหัว: วัน / เวลา =====
  const headerRow = worksheet.getRow(1);
  headerRow.height = 38;

  const firstHeader = worksheet.getCell(1, 1);
  firstHeader.value = "วัน / เวลา";
  firstHeader.fill = headerFill;
  firstHeader.font = {
    name: "Sarabun",
    size: 11,
    bold: true,
    color: { argb: "FFECE7F7" },
  };
  firstHeader.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };
  firstHeader.border = getExcelBorder();

  timeColumns.forEach((col, index) => {
    const cell = worksheet.getCell(1, index + 2);

    cell.value = `${fromMin(col.start)}\n-${fromMin(col.end)}`;
    cell.fill = headerFill;
    cell.font = {
      name: "Sarabun",
      size: 10,
      bold: true,
      color: { argb: "FFECE7F7" },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = getExcelBorder();
  });

  // ===== สร้างแถววันและช่องว่าง =====
  DAYS.forEach((day, dayIndex) => {
    const rowNumber = dayIndex + 2;
    const row = worksheet.getRow(rowNumber);

    // เพิ่มความสูงให้รองรับรายละเอียดหลายบรรทัด
    row.height = 96;

    const dayCell = worksheet.getCell(rowNumber, 1);
    dayCell.value = day.label;
    dayCell.fill = headerFill;
    dayCell.font = {
      name: "Sarabun",
      size: 11,
      bold: true,
      color: { argb: "FFECE7F7" },
    };
    dayCell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    dayCell.border = getExcelBorder();

    // เตรียมช่องเวลาเปล่าทั้งแถว
    timeColumns.forEach((col, index) => {
      const cell = worksheet.getCell(rowNumber, index + 2);

      cell.fill = emptyFill;
      cell.border = getExcelBorder();
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
    });
  });

  // ===== วางวิชาลงในตารางและรวมเซลล์ตามเวลา =====
  const dayOrder = new Map(DAYS.map((day, index) => [day.key, index]));

  const sortedClasses = [...classes].sort((a, b) => {
    const dayDifference =
      (dayOrder.get(a.day) ?? 999) - (dayOrder.get(b.day) ?? 999);

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return toMin(a.start) - toMin(b.start);
  });

  const occupied = new Set();

  for (const cls of sortedClasses) {
    const dayIndex = DAYS.findIndex((day) => day.key === cls.day);

    if (dayIndex === -1) continue;

    const startMin = toMin(cls.start);
    const endMin = toMin(cls.end);

    if (endMin <= startMin) continue;

    // หาเวลาที่ตรงกับจุดเริ่มคาบ
    const startIndex = timeColumns.findIndex((col) => col.start === startMin);

    if (startIndex === -1) continue;

    // นับจำนวนคอลัมน์ที่คาบเรียนครอบคลุม
    let span = 0;
    let j = startIndex;

    while (j < timeColumns.length && timeColumns[j].end <= endMin) {
      span++;
      j++;
    }

    if (span <= 0) continue;

    const rowNumber = dayIndex + 2;
    const startColumn = startIndex + 2;
    const endColumn = startColumn + span - 1;

    // ป้องกันการ Merge ทับกับคาบอื่น
    let hasOverlap = false;

    for (let column = startColumn; column <= endColumn; column++) {
      const key = `${rowNumber}:${column}`;

      if (occupied.has(key)) {
        hasOverlap = true;
        break;
      }
    }

    // ข้อมูลเก่าที่มีเวลาชนกันจะไม่ทำให้ Export ล้มเหลว
    if (hasOverlap) {
      console.warn("ข้ามคาบที่ทับซ้อนกันใน Excel:", cls.subject);
      continue;
    }

    for (let column = startColumn; column <= endColumn; column++) {
      occupied.add(`${rowNumber}:${column}`);
    }

    // รวมช่องเวลาเป็นการ์ดวิชาเดียว
    if (span > 1) {
      worksheet.mergeCells(rowNumber, startColumn, rowNumber, endColumn);
    }

    const cell = worksheet.getCell(rowNumber, startColumn);

    cell.value = getExcelClassText(cls);

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: toExcelColor(cls.color, "8B5CF6"),
    };

    cell.font = {
      name: "Sarabun",
      size: 10,
      color: toExcelColor(cls.textColor, "FFFFFF"),
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    cell.border = getExcelBorder();
  }

  // สร้างไฟล์ Excel ในเบราว์เซอร์
  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = getExportFilename("xlsx");

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
