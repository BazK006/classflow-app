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

  const normalize = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase();

  const getCourseKey = (cls) => {
    const courseCode = normalize(cls.courseCode);
    const baseCourseCode = courseCode.replace(/-\d+$/, "");
    const section = normalize(cls.section);
    const subject = normalize(cls.subject);

    const courseIdentity = baseCourseCode || subject || `unknown-${cls.id}`;

    return `${courseIdentity}::${section}`;
  };

  const courseGroupsMap = new Map();

  sortedClasses.forEach((cls) => {
    const key = getCourseKey(cls);

    const rawCredits =
      cls.credits == null || String(cls.credits).trim() === ""
        ? null
        : Number(cls.credits);

    const validCredits =
      rawCredits !== null && Number.isFinite(rawCredits) && rawCredits >= 0
        ? rawCredits
        : null;

    if (!courseGroupsMap.has(key)) {
      courseGroupsMap.set(key, {
        ...cls,
        credits: validCredits,
        sessions: [cls],
      });

      return;
    }

    const course = courseGroupsMap.get(key);
    course.sessions.push(cls);

    if (
      validCredits !== null &&
      (course.credits == null ||
        (Number(course.credits) === 0 && validCredits > 0))
    ) {
      course.credits = validCredits;
    }
  });

  const courseGroups = [...courseGroupsMap.values()];

  const totalCredits = courseGroups.reduce((total, course) => {
    if (course.credits == null || course.credits === "") {
      return total;
    }

    const credits = Number(course.credits);

    return Number.isFinite(credits) && credits >= 0 ? total + credits : total;
  }, 0);

  const formatCredits = (credits) => {
    if (credits == null || credits === "") return "";

    const value = Number(credits);

    return Number.isFinite(value) ? String(value) : String(credits);
  };

  const getDayLabel = (dayKey) =>
    DAYS.find((day) => day.key === dayKey)?.label ?? dayKey ?? "—";

  const getSessionColor = (session) => session.color || "#8b5cf6";

  const hasDifferentColors = (sessions = []) => {
    const colorKeys = sessions.map((session) =>
      String(getSessionColor(session)).trim().toLowerCase(),
    );

    return new Set(colorKeys).size > 1;
  };

  const getSingleColor = (sessions = []) => getSessionColor(sessions[0] ?? {});

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
            {courseGroups.length === 0 ? (
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
              courseGroups.map((course) => {
                const sessions = course.sessions ?? [course];
                const credits = formatCredits(course.credits);

                const differentColors = hasDifferentColors(sessions);
                const singleColor = getSingleColor(sessions);

                const displayCourseCode = String(course.courseCode ?? "")
                  .trim()
                  .replace(/-\d+$/, "");

                const cellStyle = {
                  background: "#1a1526",
                  color: "#ece7f7",
                  borderColor: "#27272e",
                  padding: "12px 14px",
                  verticalAlign: "middle",
                };

                const sessionListStyle = {
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  width: "100%",
                };

                const sessionItemStyle = {
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                  minHeight: "32px",
                  maxHeight: "32px",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                };

                return (
                  <tr key={getCourseKey(course)}>
                    {/* สีประจำวิชา / สีประจำคาบ */}
                    <td className="text-center" style={cellStyle}>
                      {differentColors ? (
                        <div
                          style={{
                            ...sessionListStyle,
                            alignItems: "center",
                          }}
                        >
                          {sessions.map((session) => {
                            const sessionColor = getSessionColor(session);

                            return (
                              <div
                                key={session.id}
                                style={{
                                  ...sessionItemStyle,
                                  justifyContent: "center",
                                }}
                              >
                                <span
                                  title={`${getDayLabel(session.day)}: ${sessionColor}`}
                                  aria-label={`สีประจำคาบวัน${getDayLabel(session.day)}`}
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    display: "inline-block",
                                    backgroundColor: sessionColor,
                                    border: "1px solid rgba(255,255,255,0.35)",
                                    borderRadius: "5px",
                                    flexShrink: 0,
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span
                          title={`สีประจำวิชา: ${singleColor}`}
                          aria-label="สีประจำวิชา"
                          style={{
                            width: "18px",
                            height: "18px",
                            display: "inline-block",
                            backgroundColor: singleColor,
                            border: "1px solid rgba(255,255,255,0.35)",
                            borderRadius: "5px",
                          }}
                        />
                      )}
                    </td>

                    {/* รหัสวิชา */}
                    <td
                      className="text-nowrap"
                      style={{
                        ...cellStyle,
                        color: "#b39ff0",
                      }}
                    >
                      {displayCourseCode || "—"}
                    </td>

                    {/* ชื่อวิชา */}
                    <td
                      style={{
                        ...cellStyle,
                        minWidth: "200px",
                        maxWidth: "320px",
                        fontWeight: 500,
                      }}
                    >
                      <div style={{ overflowWrap: "anywhere" }}>
                        {course.subject || "ไม่ระบุชื่อวิชา"}
                      </div>
                    </td>

                    {/* กลุ่มเรียน */}
                    <td className="text-nowrap text-center" style={cellStyle}>
                      {course.section || "—"}
                    </td>

                    {/* หน่วยกิต: แสดงเพียงครั้งเดียวต่อรายวิชา */}
                    <td className="text-nowrap text-center" style={cellStyle}>
                      {credits !== "" ? credits : "—"}
                    </td>

                    {/* วันเรียน: เรียงลงด้านล่าง */}
                    <td className="text-nowrap" style={cellStyle}>
                      <div style={sessionListStyle}>
                        {sessions.map((session) => (
                          <div key={session.id} style={sessionItemStyle}>
                            {getDayLabel(session.day)}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* เวลาเรียน: จับคู่ลำดับกับวันเรียน */}
                    <td className="text-nowrap" style={cellStyle}>
                      <div style={sessionListStyle}>
                        {sessions.map((session) => (
                          <div key={session.id} style={sessionItemStyle}>
                            {session.start}–{session.end} น.
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* ผู้สอน: แสดงตามแต่ละคาบ */}
                    <td style={cellStyle}>
                      <div style={sessionListStyle}>
                        {sessions.map((session) => (
                          <div key={session.id} style={sessionItemStyle}>
                            {session.teacher || "—"}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* ห้องเรียน: แสดงตามแต่ละคาบ */}
                    <td className="text-nowrap" style={cellStyle}>
                      <div style={sessionListStyle}>
                        {sessions.map((session) => (
                          <div key={session.id} style={sessionItemStyle}>
                            {session.room || "—"}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* จัดการ: แก้ไขและลบได้ทีละคาบ */}
                    <td style={cellStyle}>
                      <div style={sessionListStyle}>
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            className="d-flex gap-2 align-items-center"
                            style={sessionItemStyle}
                          >
                            <button
                              type="button"
                              className="btn btn-outline-edit btn-sm"
                              onClick={() => onEdit?.(session)}
                              aria-label={`แก้ไขคาบ ${getDayLabel(
                                session.day,
                              )} ${session.subject}`}
                              title="แก้ไขคาบเรียน"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-del btn-sm"
                              onClick={() => onDelete?.(session)}
                              aria-label={`ลบคาบ ${getDayLabel(
                                session.day,
                              )} ${session.subject}`}
                              title="ลบคาบเรียน"
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        ))}
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
          {/* **ย้ำ: courseGroups.length เพื่อไม่นับคาบเรียนซ้ำ */}
          <span>
            แสดงทั้งหมด <strong>{sortedClasses.length}</strong> คาบเรียน
            <span className="mx-2">·</span>
            <strong>{courseGroups.length}</strong> วิชา
          </span>

          <span>
            รวม <strong>{Number(totalCredits.toFixed(2))}</strong> หน่วยกิต
          </span>
        </div>
      )}
    </section>
  );
}
