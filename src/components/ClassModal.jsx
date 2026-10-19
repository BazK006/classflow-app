import { useEffect, useState } from "react";
import { COLORS, DAYS, DEFAULT_END, DEFAULT_START } from "../data/constants.js";
import { toMin } from "../utils/time.js";
import "../css/classmodal.css";
import { showValidationAlert } from "../utils/modal.js";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

const TEXT_COLORS = [
  "#ffffff",
  "#1f2937",
  "#111827",
  "#fef3c7",
  "#dbeafe",
  "#e9d5ff",
];

function TimeSelect({ value, onChange }) {
  const [h, m] = value.split(":");
  const currentMinute = MINUTES.includes(m) ? m : "00";

  const setHour = (newH) => onChange(`${newH}:${currentMinute}`);

  const setMinute = (newM) => onChange(`${h}:${newM}`);

  return (
    <div className="d-flex align-items-center gap-1 time-select">
      <select
        className="form-select"
        value={h}
        onChange={(e) => setHour(e.target.value)}
        aria-label="ชั่วโมง"
      >
        {HOURS.map((hh) => (
          <option key={hh} value={hh}>
            {hh}
          </option>
        ))}
      </select>

      <span>:</span>

      <select
        className="form-select"
        value={currentMinute}
        onChange={(e) => setMinute(e.target.value)}
        aria-label="นาที"
      >
        {MINUTES.map((mm) => (
          <option key={mm} value={mm}>
            {mm}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ClassModal({
  show,
  onClose,
  onSave,
  onDelete,
  initial,
  defaultDay,
  defaultStart,
  defaultEnd,
}) {
  const [day, setDay] = useState(defaultDay || "mon");
  const [start, setStart] = useState(defaultStart || DEFAULT_START);
  const [end, setEnd] = useState(defaultEnd || DEFAULT_END);

  const [courseCode, setCourseCode] = useState("");
  const [section, setSection] = useState("");
  const [credits, setCredits] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [room, setRoom] = useState("");

  const [color, setColor] = useState(COLORS[0]);
  const [textColor, setTextColor] = useState("#ffffff");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (show) {
      setIsClosing(false);
      setDay(initial?.day || defaultDay || "mon");

      setStart(initial?.start || defaultStart || DEFAULT_START);

      setEnd(initial?.end || defaultEnd || DEFAULT_END);

      setCourseCode(initial?.courseCode || "");

      setSection(initial?.section || "");

      setCredits(initial?.credits != null ? String(initial.credits) : "");

      setSubject(initial?.subject || "");

      setTeacher(initial?.teacher || "");

      setRoom(initial?.room || "");

      setColor(initial?.color || COLORS[0]);

      setTextColor(initial?.textColor || "#ffffff");
    }
  }, [show, initial, defaultDay, defaultStart, defaultEnd]);

  const handleClose = () => {
    if (isClosing) return;

    setIsClosing(true);

    setTimeout(() => {
      onClose();
    }, 250);
  };

  if (!show) return null;

  const handleSave = () => {
    if (!subject.trim()) {
      showValidationAlert("กรุณากรอกชื่อวิชา");
      return;
    }

    if (toMin(end) <= toMin(start)) {
      showValidationAlert("เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม");
      return;
    }

    if (
      credits.trim() !== "" &&
      (!Number.isFinite(Number(credits)) || Number(credits) < 0)
    ) {
      showValidationAlert("หน่วยกิตต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป");
      return;
    }

    onSave({
      day,
      start,
      end,
      courseCode: courseCode.trim(),
      section: section.trim(),
      credits: credits.trim() === "" ? null : Number(credits),
      subject: subject.trim(),
      teacher: teacher.trim(),
      room: room.trim(),
      color,
      textColor,
    });
  };

  return (
    <div
      className={`modal d-block${isClosing ? " modal-closing" : ""}`}
      tabIndex="-1"
      style={{ background: "rgba(6,4,12,.65)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-mobile">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title brand-font">
              {initial ? "แก้ไขคาบวิชาเรียน" : "เพิ่มคาบวิชาเรียน"}
            </h5>

            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              aria-label="ปิด"
            />
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* วัน / เวลา */}
            <div className="row">
              <div className="col-12 col-md-4 mb-3">
                <label className="form-label">วัน (Day)</label>

                <select
                  className="form-select"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
                  {DAYS.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4 mb-3">
                <label className="form-label">เวลาเริ่ม (24 ชม.)</label>

                <TimeSelect value={start} onChange={setStart} />
              </div>

              <div className="col-12 col-md-4 mb-3">
                <label className="form-label">เวลาสิ้นสุด (24 ชม.)</label>

                <TimeSelect value={end} onChange={setEnd} />
              </div>
            </div>

            {/* รหัสวิชา */}
            <div className="mb-3">
              <label className="form-label">รหัสวิชา (Subject ID)</label>

              <input
                type="text"
                className="form-control"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="เช่น 1145200"
              />
            </div>

            {/* ชื่อวิชา */}
            <div className="mb-3">
              <label className="form-label">ชื่อวิชา (Subject)</label>

              <input
                type="text"
                className="form-control"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="เช่น คณิตศาสตร์"
              />
            </div>

            {/* กลุ่มเรียน / หน่วยกิต */}
            <div className="row">
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">กลุ่มเรียน (Section)</label>

                <input
                  type="text"
                  className="form-control"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="เช่น 1"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">หน่วยกิต (Credits)</label>

                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="1"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  placeholder="เช่น 3"
                />
              </div>
            </div>

            {/* อาจารย์ / ห้อง */}
            <div className="row">
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">
                  ชื่อผู้สอนวิชา (Instructor)
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="เช่น ดร.สมชาย"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">ห้องเรียน (Classroom)</label>

                <input
                  type="text"
                  className="form-control"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="เช่น 401"
                />
              </div>
            </div>

            {/* สีพื้นหลัง */}
            <div className="mb-2">
              <label className="form-label">สีพื้นหลัง</label>

              <div className="d-flex flex-wrap gap-2 mb-2">
                {COLORS.map((c) => (
                  <div
                    key={c}
                    className={"swatch" + (color === c ? " active" : "")}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>

              <div className="d-flex align-items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: 40,
                    height: 32,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                />

                <span className="form-label mb-0">เลือกสีเอง</span>
              </div>
            </div>

            {/* สีข้อความ */}
            <div className="mb-2 mt-3">
              <label className="form-label">สีข้อความ</label>

              <div className="d-flex flex-wrap gap-2 mb-2">
                {TEXT_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={"swatch" + (textColor === c ? " active" : "")}
                    style={{ background: c }}
                    onClick={() => setTextColor(c)}
                    aria-label={`เลือกสีข้อความ ${c}`}
                    title={c}
                  />
                ))}
              </div>

              <div className="d-flex align-items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{
                    width: 40,
                    height: 32,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                />

                <span className="form-label mb-0">เลือกสีข้อความ</span>
              </div>

              {/* Preview */}
              <div
                className="mt-5 p-2 rounded-2 text-center"
                style={{
                  background: color,
                  color: textColor,
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <strong>
                  {courseCode.trim() ? `(${courseCode.trim()}) ` : ""}
                  {subject.trim() || "ชื่อวิชา"} <br></br>
                  {section.trim() ? ` (กลุ่ม ${section.trim()})` : ""}
                </strong>

                <div className="small">
                  เวลา {start}-{end} น.
                  {teacher.trim() && (
                    <>
                      <br />
                      ผู้สอน {teacher.trim()}
                    </>
                  )}
                  {room.trim() && (
                    <>
                      <br />
                      ห้องเรียน {room.trim()}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer modal-footer-mobile">
            <div className="d-flex gap-2 modal-actions">
              <button
                type="button"
                className="btn btn-outline-purple btn-sm"
                onClick={handleClose}
              >
                ยกเลิก
              </button>

              <button
                type="button"
                className="btn btn-save btn-sm"
                onClick={handleSave}
              >
                บันทึก
              </button>
            </div>

            <div className="d-flex justify-content-end w-100 order-2">
              {initial && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={onDelete}
                >
                  <i className="bi bi-trash3 me-1" />
                  ลบคาบวิชา
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
