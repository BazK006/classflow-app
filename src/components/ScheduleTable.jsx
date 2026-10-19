import { forwardRef } from "react";
import { DAYS } from "../data/constants.js";
import { fromMin, toMin } from "../utils/time.js";
import "bootstrap/dist/css/bootstrap.min.css";

const ScheduleTable = forwardRef(function ScheduleTable(
  { classes = [], cols = [], onCellClick, onClassClick },
  ref,
) {
  const boundaries = [
    ...cols.flatMap((col) => [Number(col.start), Number(col.end)]),
    ...classes.flatMap((cls) => [toMin(cls.start), toMin(cls.end)]),
  ].filter(Number.isFinite);

  const ticks = [...new Set(boundaries)].sort((a, b) => a - b);

  const referenceCol = cols.find((col) => {
    const duration = Number(col.end) - Number(col.start);
    const width = Number.parseFloat(col.width);

    return duration > 0 && width > 0;
  });

  const pxPerMin = referenceCol
    ? Number.parseFloat(referenceCol.width) /
      (Number(referenceCol.end) - Number(referenceCol.start))
    : 2;

  const tableCols = ticks.slice(0, -1).map((start, i) => {
    const end = ticks[i + 1];

    const parent = cols.find(
      (col) => Number(col.start) <= start && Number(col.end) >= end,
    );

    const parentDuration = parent
      ? Number(parent.end) - Number(parent.start)
      : 0;

    const parentWidth = parent ? Number.parseFloat(parent.width) : 0;

    const width =
      parentDuration > 0 && parentWidth > 0
        ? parentWidth * ((end - start) / parentDuration)
        : (end - start) * pxPerMin;

    return {
      start,
      end,
      width,
    };
  });

  const renderDayCells = (day) => {
    const dayClasses = classes.filter((cls) => cls.day === day.key);

    const cells = [];
    let i = 0;

    while (i < tableCols.length) {
      const col = tableCols[i];

      const cls = dayClasses.find((item) => toMin(item.start) === col.start);

      if (cls) {
        const endMin = toMin(cls.end);
        let span = 0;
        let j = i;

        while (j < tableCols.length && tableCols[j].end <= endMin) {
          span++;
          j++;
        }

        if (span > 0) {
          cells.push(
            <td key={cls.id} colSpan={span} onClick={() => onClassClick(cls)}>
              <div
                className="class-card text-center"
                style={{
                  background: cls.color,
                  color: cls.textColor || "#ffffff",
                }}
              >
                <div className="subj">
                  {cls.courseCode && `(${cls.courseCode}) `}
                  {cls.subject}
                </div>

                {cls.section && (
                  <div className="meta">
                    กลุ่ม {cls.section} ({cls.credits} หน่วยกิต)
                  </div>
                )}

                <div className="meta">
                  เวลา {cls.start}-{cls.end} น.
                </div>

                {cls.teacher && <div className="meta">{cls.teacher}</div>}

                {cls.room && <div className="meta">{cls.room}</div>}
              </div>
            </td>,
          );

          i = j;
          continue;
        }
      }

      cells.push(
        <td
          key={`empty-${day.key}-${i}`}
          onClick={() => onCellClick(day.key, col.start, col.end)}
        >
          <div className="empty-cell">+</div>
        </td>,
      );

      i++;
    }

    return cells;
  };

  return (
    <div className="schedule-wrap panel p-0" ref={ref}>
      <table className="schedule">
        <colgroup>
          <col style={{ width: 110 }} />

          {tableCols.map((col, i) => (
            <col key={i} style={{ width: col.width }} />
          ))}
        </colgroup>

        <thead>
          <tr>
            <th>วัน / เวลา</th>

            {tableCols.map((col, i) => (
              <th key={i} className="text-nowrap">
                <span>{fromMin(col.start)}</span>
                <span>-{fromMin(col.end)}</span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {DAYS.map((day) => (
            <tr key={day.key}>
              <th>{day.label}</th>
              {renderDayCells(day)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ScheduleTable;
