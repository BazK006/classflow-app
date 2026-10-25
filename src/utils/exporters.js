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

function getExportFilename(extension) {
  return `ตารางเรียน_${getTimestamp()}.${extension}`;
}

function downloadBlob(content, filename, mimeType) {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(
    () => {
      URL.revokeObjectURL(url);
    },
    5 * 60 * 1000,
  );
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


const EXPORT_SCALE = 2;
const MAX_CANVAS_SIDE = 4096;
const MAX_CANVAS_PIXELS = 4_000_000;

async function captureCanvas(node) {
  if (!node) {
    throw new Error("ไม่พบตารางเรียนที่ต้องการส่งออก");
  }

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const wrapper = node.matches?.(".schedule-wrap")
    ? node
    : node.closest?.(".schedule-wrap") || node;

  const table = wrapper.matches?.("table.schedule")
    ? wrapper
    : wrapper.querySelector?.("table.schedule");

  if (!table) {
    throw new Error("ไม่พบตารางเรียนสำหรับส่งออก");
  }

  const tableRect = table.getBoundingClientRect();
  const tableStyle = window.getComputedStyle(table);

  const sourceCols = [...table.querySelectorAll("colgroup col")];

  const columnWidths = sourceCols.map((col) => {
    const rectWidth = col.getBoundingClientRect().width;
    const computedWidth =
      Number.parseFloat(window.getComputedStyle(col).width) || 0;
    const inlineWidth = Number.parseFloat(col.style.width) || 0;

    return Math.max(rectWidth, computedWidth, inlineWidth);
  });

  const [spacingValue = "0px"] = tableStyle.borderSpacing.split(" ");

  const spacingX = Number.parseFloat(spacingValue) || 0;

  const colGroupWidth =
    columnWidths.reduce((sum, width) => sum + width, 0) +
    (tableStyle.borderCollapse === "collapse"
      ? 0
      : spacingX * (sourceCols.length + 1));

  const tableWidth = Math.ceil(
    Math.max(
      table.scrollWidth,
      table.offsetWidth,
      tableRect.width,
      colGroupWidth,
    ) + 4,
  );

  const tableHeight = Math.ceil(
    Math.max(table.scrollHeight, table.offsetHeight, tableRect.height) + 4,
  );

  const wrapperStyle = window.getComputedStyle(wrapper);
  const px = (value) => Number.parseFloat(value) || 0;

  const borderX =
    px(wrapperStyle.borderLeftWidth) + px(wrapperStyle.borderRightWidth);

  const borderY =
    px(wrapperStyle.borderTopWidth) + px(wrapperStyle.borderBottomWidth);

  const paddingX = px(wrapperStyle.paddingLeft) + px(wrapperStyle.paddingRight);

  const paddingY = px(wrapperStyle.paddingTop) + px(wrapperStyle.paddingBottom);

  const exportWidth = Math.ceil(tableWidth + borderX + paddingX);

  const exportHeight = Math.ceil(tableHeight + borderY + paddingY);

  const scale = Math.min(
    EXPORT_SCALE,
    MAX_CANVAS_SIDE / exportWidth,
    MAX_CANVAS_SIDE / exportHeight,
    Math.sqrt(MAX_CANVAS_PIXELS / (exportWidth * exportHeight)),
  );

  const canvas = await html2canvas(wrapper, {
    backgroundColor: "#1a1526",
    scale,
    useCORS: true,
    logging: false,

    width: exportWidth,
    height: exportHeight,

    windowWidth: Math.max(window.innerWidth, exportWidth + 32),

    windowHeight: Math.max(window.innerHeight, exportHeight + 32),

    scrollX: 0,
    scrollY: 0,

    onclone: (_clonedDocument, clonedWrapper) => {
      Object.assign(clonedWrapper.style, {
        boxSizing: "border-box",
        width: `${exportWidth}px`,
        minWidth: `${exportWidth}px`,
        maxWidth: "none",
        height: `${exportHeight}px`,
        maxHeight: "none",
        overflow: "visible",
      });

      const clonedTable = clonedWrapper.matches?.("table.schedule")
        ? clonedWrapper
        : clonedWrapper.querySelector("table.schedule");

      if (!clonedTable) return;

      clonedTable.style.setProperty("width", `${tableWidth}px`, "important");

      clonedTable.style.setProperty(
        "min-width",
        `${tableWidth}px`,
        "important",
      );

      clonedTable.style.setProperty("max-width", "none", "important");

      const clonedCols = [...clonedTable.querySelectorAll("colgroup col")];

      clonedCols.forEach((col, index) => {
        const width = columnWidths[index];

        if (!Number.isFinite(width) || width <= 0) return;

        col.style.setProperty("width", `${width}px`, "important");
      });
    },
  });

  return { canvas, scale };
}

// Export PNG
function canvasToBlob(canvas, mimeType = "image/png") {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob === "function") {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("ไม่สามารถสร้างไฟล์รูปภาพได้"));
        }
      }, mimeType);

      return;
    }

    try {
      const dataURL = canvas.toDataURL(mimeType);
      const base64 = dataURL.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      resolve(new Blob([bytes], { type: mimeType }));
    } catch (error) {
      reject(error);
    }
  });
}

export async function downloadImage(node) {
  const { canvas } = await captureCanvas(node);
  const blob = await canvasToBlob(canvas, "image/png");

  downloadBlob(blob, getExportFilename("png"), "image/png");
}

// Export PDF
export async function exportPDF(node) {
  const { canvas, scale } = await captureCanvas(node);

  const imgData = canvas.toDataURL("image/png");
  ("");
  const pxToPt = 72 / (96 * scale);

  const pageWidth = canvas.width * pxToPt;
  const pageHeight = canvas.height * pxToPt;

  const pdf = new jsPDF({
    orientation: pageWidth >= pageHeight ? "landscape" : "portrait",
    unit: "pt",
    format: [pageWidth, pageHeight],
    compress: true,
  });

  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

  const blob = pdf.output("blob");

  downloadBlob(blob, getExportFilename("pdf"), "application/pdf");
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

  worksheet.pageSetup = {
    paperSize: 9,
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

    const startIndex = timeColumns.findIndex((col) => col.start === startMin);

    if (startIndex === -1) continue;

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

    let hasOverlap = false;

    for (let column = startColumn; column <= endColumn; column++) {
      const key = `${rowNumber}:${column}`;

      if (occupied.has(key)) {
        hasOverlap = true;
        break;
      }
    }

    if (hasOverlap) {
      console.warn("ข้ามคาบที่ทับซ้อนกันใน Excel:", cls.subject);
      continue;
    }

    for (let column = startColumn; column <= endColumn; column++) {
      occupied.add(`${rowNumber}:${column}`);
    }

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

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  downloadBlob(
    blob,
    getExportFilename("xlsx"),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
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
