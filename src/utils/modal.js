import Swal from "sweetalert2";
import { DAYS } from "../data/constants.js";
import { toMin } from "./time.js";

const ALERT_BACKGROUND = "#221b33";
const ALERT_COLOR = "#ece7f7";
const ALERT_PURPLE = "#8b5cf6";
const ALERT_SUCCESS = "#10b981";
const ALERT_DANGER = "#ef4444";
const ALERT_CANCEL = "#5b3fa8";

const POPUP_CLASS = {
  popup: "swal-purple-popup",
};

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function getContentStyle() {
  return `
        text-align: center;
        font-size: 16px;
        line-height: 1.8;
    `;
}

function getDayLabel(day) {
  const label = DAYS.find((d) => d.key === day)?.label ?? day ?? "";

  if (!label) return "";

  const text = String(label);

  return text.startsWith("วัน") ? text : `วัน${text}`;
}

function getCourseInfoHtml(cls, options = {}) {
  const {
    showDay = false,
    showTime = false,
    showTeacher = false,
    showRoom = false,
  } = options;

  const section = String(cls.section ?? "").trim();

  const credits = cls.credits == null ? "" : String(cls.credits).trim();

  const hasSection = section !== "";
  const hasCredits = credits !== "";

  return `
        <div style="${getContentStyle()}">

            ${
              cls.courseCode
                ? `
                <div style="
                    font-size: 16px;
                    color: #b39ff0;
                ">
                    รหัสวิชา ${escapeHtml(cls.courseCode)}
                </div>
            `
                : ""
            }

            <div style="
                font-size: 20px;
                font-weight: 700;
                line-height: 1.5;
                margin-top: 5px;
                overflow-wrap: anywhere;
            ">
                ${escapeHtml(cls.subject || "ไม่ระบุชื่อวิชา")}
            </div>

            ${
              hasSection || hasCredits
                ? `
                        <div style="
                            font-size: 16px;
                            margin-top: 5px;
                            color: #b39ff0;
                        ">
                            ${hasSection ? `กลุ่ม ${escapeHtml(section)}` : ""}
                            ${hasSection && hasCredits ? " " : ""}
                            ${
                              hasCredits
                                ? `(${escapeHtml(credits)} หน่วยกิต)`
                                : ""
                            }
                        </div>
                    `
                : ""
            }

            ${
              showDay
                ? `
                <div style="margin-top: 10px;">
                    ${escapeHtml(getDayLabel(cls.day))}
                </div>
            `
                : ""
            }

            ${
              showTime
                ? `
                <div>
                    เวลา ${escapeHtml(cls.start)}
                    -${escapeHtml(cls.end)} น.
                </div>
            `
                : ""
            }

            ${
              showTeacher && cls.teacher
                ? `
                <div>
                    ${escapeHtml(cls.teacher)}
                </div>
            `
                : ""
            }

            ${
              showRoom && cls.room
                ? `
                <div>
                    ${escapeHtml(cls.room)}
                </div>
            `
                : ""
            }

        </div>
    `;
}

function getAlertTheme() {
  return {
    background: ALERT_BACKGROUND,
    color: ALERT_COLOR,
    customClass: POPUP_CLASS,
  };
}

export function findTimeConflict(classes, newClass, excludeId = null) {
  const newStart = toMin(newClass.start);
  const newEnd = toMin(newClass.end);

  return (
    classes.find((cls) => {
      if (cls.day !== newClass.day) return false;

      if (excludeId != null && String(cls.id) === String(excludeId)) {
        return false;
      }

      const oldStart = toMin(cls.start);
      const oldEnd = toMin(cls.end);

      return newStart < oldEnd && newEnd > oldStart;
    }) || null
  );
}

export function showTimeConflictAlert(conflict, newClass) {
  return Swal.fire({
    ...getAlertTheme(),

    icon: "warning",
    title: "วันและเวลาซ้ำกัน!",

    html: `
            <div style="${getContentStyle()}">
                ${escapeHtml(getDayLabel(newClass.day))}
                มีคาบเรียนที่ทับซ้อนกัน
            </div>

            <div style="margin-top: 12px;">
                ${getCourseInfoHtml(conflict, {
                  showTime: true,
                })}
            </div>
        `,

    confirmButtonText: "เข้าใจแล้ว",
    confirmButtonColor: ALERT_PURPLE,
  });
}

export function findDuplicateClass(classes, newClass, excludeId = null) {
  const code = String(newClass.courseCode ?? "")
    .trim()
    .toLowerCase();

  const subject = String(newClass.subject ?? "")
    .trim()
    .toLowerCase();

  return (
    classes.find((cls) => {
      if (excludeId != null && String(cls.id) === String(excludeId)) {
        return false;
      }

      const oldCode = String(cls.courseCode ?? "")
        .trim()
        .toLowerCase();

      const oldSubject = String(cls.subject ?? "")
        .trim()
        .toLowerCase();

      if (code && oldCode) {
        return code === oldCode;
      }

      if (!code && !oldCode) {
        return subject !== "" && subject === oldSubject;
      }

      return false;
    }) || null
  );
}

export function showDuplicateClassAlert(existing) {
  return Swal.fire({
    ...getAlertTheme(),

    icon: "warning",
    title: "มีวิชานี้ในตารางแล้ว!",

    html: `
            <div style="${getContentStyle()}">
                ไม่สามารถเพิ่มวิชานี้ซ้ำได้
            </div>

            <div style="margin-top: 12px;">
                ${getCourseInfoHtml(existing, {
                  showDay: true,
                  showTime: true,
                })}
            </div>

            <div style="
                font-size: 16px;
                line-height: 1.8;
                margin-top: 14px;
                text-align: center;
            ">
                หากต้องการเปลี่ยนข้อมูล
                กรุณาแก้ไขคาบเรียนเดิม
                หรือลบคาบเดิมก่อนเพิ่มใหม่
            </div>
        `,

    confirmButtonText: "เข้าใจแล้ว",
    confirmButtonColor: ALERT_PURPLE,
  });
}

export function showSaveSuccessAlert(isEdit = false, data = {}) {
  return Swal.fire({
    ...getAlertTheme(),

    icon: "success",

    title: isEdit ? "แก้ไขข้อมูลสำเร็จ!" : "บันทึกข้อมูลเรียบร้อยแล้ว",

    html: `
            <div style="${getContentStyle()}">
                ${
                  isEdit
                    ? "แก้ไขข้อมูลคาบเรียนเรียบร้อยแล้ว"
                    : "เพิ่มคาบเรียนลงในตารางเรียบร้อยแล้ว"
                }
            </div>

            <div style="margin-top: 12px;">
                ${getCourseInfoHtml(data, {
                  showDay: true,
                  showTime: true,
                  showTeacher: true,
                  showRoom: true,
                })}
            </div>
        `,

    confirmButtonColor: ALERT_SUCCESS,
    confirmButtonText: "เรียบร้อย",
  });
}

export function showValidationAlert(message) {
  return Swal.fire({
    ...getAlertTheme(),

    icon: "warning",
    title: "ตรวจสอบข้อมูล",

    html: `
            <div style="
                font-size: 16px;
                line-height: 1.8;
                text-align: center;
            ">
                ${escapeHtml(message)}
            </div>
        `,

    confirmButtonColor: ALERT_PURPLE,
    confirmButtonText: "ตกลง",
  });
}

export function showDeleteConfirm(cls) {
  return Swal.fire({
    ...getAlertTheme(),

    icon: "warning",
    title: "ยืนยันการลบคาบวิชา?",

    html: `
            <div style="${getContentStyle()}">
                <div style="
                    font-size: 16px;
                    opacity: 0.85;
                ">
                    คุณกำลังจะลบคาบเรียน
                </div>

                <div style="margin-top: 12px;">
                    ${getCourseInfoHtml(cls, {
                      showDay: true,
                      showTime: true,
                    })}
                </div>

                <div style="
                    font-size: 16px;
                    line-height: 1.8;
                    margin-top: 16px;
                ">
                    คุณแน่ใจหรือไม่ว่าต้องการลบคาบเรียนนี้?
                </div>
            </div>
        `,

    showCancelButton: true,
    confirmButtonText: "ยืนยันการลบ",
    cancelButtonText: "ยกเลิก",

    confirmButtonColor: ALERT_DANGER,
    cancelButtonColor: ALERT_CANCEL,

    reverseButtons: true,
    focusCancel: true,
  });
}

export function showDeleteSuccessAlert(cls) {
  return Swal.fire({
    ...getAlertTheme(),

    icon: "success",
    title: "ลบคาบสำเร็จ!",

    html: `
            <div style="${getContentStyle()}">
                ลบคาบเรียนเรียบร้อยแล้ว
            </div>

            <div style="margin-top: 12px;">
                ${getCourseInfoHtml(cls, {
                  showDay: true,
                  showTime: true,
                })}
            </div>
        `,

    confirmButtonText: "เรียบร้อย",
    confirmButtonColor: ALERT_SUCCESS,
  });
}

export function showClearAllConfirm(count) {
  return Swal.fire({
    ...getAlertTheme(),

    icon: "warning",
    title: "ล้างตารางเรียนทั้งหมด?",

    html: `
            <div style="
                font-size: 16px;
                line-height: 1.8;
                text-align: center;
            ">
                คุณมีคาบเรียนทั้งหมด

                <strong style="
                    font-size: 20px;
                    color: #b39ff0;
                ">
                    ${Number(count) || 0}
                </strong>

                คาบ

                <div style="margin-top: 8px;">
                    การดำเนินการนี้จะลบคาบเรียนทั้งหมดออกจากตาราง
                </div>
            </div>
        `,

    showCancelButton: true,
    confirmButtonText: "ยืนยันล้างทั้งหมด",
    cancelButtonText: "ยกเลิก",

    confirmButtonColor: ALERT_DANGER,
    cancelButtonColor: ALERT_CANCEL,

    reverseButtons: true,
    focusCancel: true,
  });
}

export function showClearAllSuccess(count) {
  return Swal.fire({
    ...getAlertTheme(),

    icon: "success",
    title: "ล้างตารางสำเร็จ!",

    html: `
            <div style="
                font-size: 16px;
                line-height: 1.8;
                text-align: center;
            ">
                ลบคาบเรียนทั้งหมด

                <strong style="
                    font-size: 20px;
                    color: #b39ff0;
                ">
                    ${Number(count) || 0}
                </strong>

                คาบเรียบร้อยแล้ว
            </div>
        `,

    confirmButtonText: "เรียบร้อย",
    confirmButtonColor: ALERT_SUCCESS,
  });
}
