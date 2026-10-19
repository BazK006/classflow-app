import { DAYS } from "../data/constants.js";
import { toMin } from "../utils/time.js";

export default function SummarySubject({
  classes = [],
  onEdit,
  onDelete,
  onAdd,
}) {
  const sortedClasses = [...classes].sort((a, b) => {
    const dayA = DAYS.findIndex((day) => day.key === a.day);
    const dayB = DAYS.findIndex((day) => day.key === b.day);

    if (dayA !== dayB) {
      return (dayA === -1 ? 999 : dayA) - (dayB === -1 ? 999 : dayB);
    }

    return toMin(a.start) - toMin(b.start);
  });

  const totalCredits = sortedClasses.reduce((total, cls) => {
    if (cls.credits == null || cls.credits === "") {
      return total;
    }

    const credits = Number(cls.credits);

    return Number.isFinite(credits) && credits >= 0 ? total + credits : total;
  }, 0);

  const formatCredits = (credits) => {
    if (credits == null || credits === "") return "";

    const value = Number(credits);

    return Number.isFinite(value) ? String(value) : String(credits);
  };

  const getDayLabel = (dayKey) =>
    DAYS.find((day) => day.key === dayKey)?.label ?? dayKey ?? "—";

  return (
    <section className="panel summary-subject-panel p-2 mt-4 overflow-hidden">
      
      {/* Header */}
      <div className="p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="mb-3">
          <div className="d-flex align-items-center gap-2 mb-1">
            <i
              className="bi bi-journal-text"
              aria-hidden="true"
              style={{
                fontSize: "1.35rem",
                color: "#b39ff0",
              }}
            ></i>

            <h5 className="mb-0 brand-font">สรุปรายวิชาที่ลงทะเบียน</h5>
          </div>

          <div
            style={{
              fontSize: "14px",
              color: "#a99cc9",
              lineHeight: 1.6,
            }}
          >
            จัดการและตรวจสอบรายละเอียด กลุ่มเรียน หน่วยกิต และเวลาเรียนของคุณ
          </div>
        </div>

        {/* สรุปจำนวนวิชาและหน่วยกิต */}
        <div className="d-flex flex-wrap gap-2">
          <span
            className="badge rounded-pill"
            style={{
              background: "#2a2140",
              color: "#e9d5ff",
              fontSize: "13px",
              padding: "8px 12px",
            }}
          >
            <i className="bi bi-book me-1"></i>
            {sortedClasses.length} วิชา
          </span>

          <span
            className="badge rounded-pill"
            style={{
              background: "#2a2140",
              color: "#b39ff0",
              fontSize: "13px",
              padding: "8px 12px",
            }}
          >
            <i className="bi bi-award me-1"></i>
            {Number(totalCredits.toFixed(2))} หน่วยกิต
          </span>
        </div>
      </div>

      {/* Summary Table */}
      <div className="table-responsive">
        <table
          className="table table-sm align-middle mb-0"
          style={{
            minWidth: "1050px",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr>
              {[
                "สี",
                "รหัสวิชา",
                "ชื่อวิชา",
                "กลุ่มเรียน",
                "หน่วยกิต",
                "วัน",
                "เวลาเรียน",
                "ผู้สอน",
                "ห้องเรียน",
                "จัดการ",
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="text-nowrap"
                  style={{
                    background: "#221b33",
                    color: "#b39ff0",
                    borderColor: "#3a2f56",
                    padding: "12px 14px",
                    fontWeight: 600,
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedClasses.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-5"
                  style={{
                    background: "#1a1526",
                    color: "#a99cc9",
                    borderColor: "#27272e",
                  }}
                >
                  <i
                    className="bi bi-calendar-plus d-block mb-2"
                    style={{ fontSize: "28px" }}
                  ></i>
                  ยังไม่มีรายวิชาในตารางเรียน
                  <div className="mt-1" style={{ fontSize: "13px" }}>
                    กดเพิ่มวิชาเพื่อเริ่มจัดตารางของคุณ
                  </div>
                  <button
                    type="button"
                    className="btn-empty-add mt-3"
                    onClick={onAdd}
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    เพิ่มวิชา
                  </button>
                </td>
              </tr>
            ) : (
              sortedClasses.map((cls) => {
                const courseColor = cls.color || "#8b5cf6";
                const credits = formatCredits(cls.credits);

                return (
                  <tr key={cls.id}>
                    {/* สีประจำวิชา: แสดงเฉพาะสี */}
                    <td
                      className="text-center"
                      style={{
                        background: "#1a1526",
                        borderColor: "#27272e",
                        padding: "12px 14px",
                      }}
                    >
                      <span
                        title="สีประจำวิชา"
                        aria-label={`สีประจำวิชา ${courseColor}`}
                        style={{
                          width: "18px",
                          height: "18px",
                          display: "inline-block",
                          verticalAlign: "middle",
                          backgroundColor: courseColor,
                          border: "1px solid rgba(255,255,255,0.35)",
                          borderRadius: "5px",
                        }}
                      />
                    </td>

                    {/* รหัสวิชา */}
                    <td
                      className="text-nowrap"
                      style={{
                        background: "#1a1526",
                        color: "#b39ff0",
                        borderColor: "#27272e",
                        padding: "12px 14px",
                      }}
                    >
                      {cls.courseCode || "—"}
                    </td>

                    {/* ชื่อวิชา */}
                    <td
                      style={{
                        background: "#1a1526",
                        color: "#ece7f7",
                        borderColor: "#27272e",
                        padding: "12px 14px",
                        minWidth: "200px",
                        maxWidth: "320px",
                        fontWeight: 500,
                      }}
                    >
                      <div style={{ overflowWrap: "anywhere" }}>
                        {cls.subject || "ไม่ระบุชื่อวิชา"}
                      </div>
                    </td>

                    {/* กลุ่มเรียน */}
                    <td
                      className="text-nowrap text-center"
                      style={{
                        background: "#1a1526",
                        color: "#ece7f7",
                        borderColor: "#27272e",
                        padding: "12px 14px",
                      }}
                    >
                      {cls.section || "—"}
                    </td>

                    {/* หน่วยกิต */}
                    <td
                      className="text-nowrap text-center"
                      style={{
                        background: "#1a1526",
                        color: "#ece7f7",
                        borderColor: "#27272e",
                        padding: "12px 14px",
                      }}
                    >
                      {credits !== "" ? credits : "—"}
                    </td>

                    {/* วัน */}
                    <td
                      className="text-nowrap"
                      style={{
                        background: "#1a1526",
                        color: "#ece7f7",
                        borderColor: "#27272e",
                        padding: "12px 14px",
                      }}
                    >
                      {getDayLabel(cls.day)}
                    </td>

                    {/* เวลาเรียน */}
                    <td
                      className="text-nowrap"
                      style={{
                        background: "#1a1526",
                        color: "#ece7f7",
                        borderColor: "#27272e",
                        padding: "12px 14px",
                      }}
                    >
                      {cls.start}–{cls.end} น.
                    </td>

                    {/* ผู้สอน */}
                    <td
                      style={{
                        background: "#1a1526",
                        color: "#ece7f7",
                        borderColor: "#27272e",
                        padding: "12px 14px",
                      }}
                    >
                      {cls.teacher || "—"}
                    </td>

                    {/* ห้องเรียน */}
                    <td
                      className="text-nowrap"
                      style={{
                        background: "#1a1526",
                        color: "#ece7f7",
                        borderColor: "#27272e",
                        padding: "12px 14px",
                      }}
                    >
                      {cls.room || "—"}
                    </td>

                    {/* ปุ่มจัดการ */}
                    <td
                      className="text-nowrap"
                      style={{
                        background: "#1a1526",
                        borderColor: "#27272e",
                        padding: "12px 14px",
                      }}
                    >
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-edit btn-sm"
                          onClick={() => onEdit?.(cls)}
                          aria-label={`แก้ไข ${cls.subject}`}
                          title="แก้ไขวิชา"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-del btn-sm"
                          onClick={() => onDelete?.(cls)}
                          aria-label={`ลบ ${cls.subject}`}
                          title="ลบวิชา"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {sortedClasses.length > 0 && (
        <div
          className="d-flex justify-content-between align-items-center flex-wrap gap-2 p-3"
          style={{
            background: "#15121f",
            borderTop: "1px solid #27272e",
            color: "#a99cc9",
            fontSize: "13px",
          }}
        >
          <span>
            แสดงทั้งหมด <strong>{sortedClasses.length}</strong> วิชา
          </span>

          <span>
            รวม <strong>{Number(totalCredits.toFixed(2))}</strong> หน่วยกิต
          </span>
        </div>
      )}
    </section>
  );
}
