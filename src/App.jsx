import { useEffect, useMemo, useRef, useState } from "react";
import Toolbar from "./components/Toolbar.jsx";
import ScheduleTable from "./components/ScheduleTable.jsx";
import ClassModal from "./components/ClassModal.jsx";
import SummarySubject from "./components/Summary_subject.jsx";
import Footer from "./components/Footer.jsx";
import { loadState, saveState } from "./utils/storage.js";
import { buildTicks, buildColumns, fromMin } from "./utils/time.js";
import {
  exportJSON,
  downloadImage,
  exportPDF,
  exportExcel,
} from "./utils/exporters.js";
import {
  findTimeConflict,
  showTimeConflictAlert,
  showSaveSuccessAlert,
  showDeleteConfirm,
  showDeleteSuccessAlert,
  showClearAllConfirm,
  showClearAllSuccess,
  findDuplicateClass,
  showDuplicateClassAlert,
} from "./utils/modal.js";

export default function App() {
  const [state, setState] = useState(loadState);
  const [modalCtx, setModalCtx] = useState(null);
  const [exporting, setExporting] = useState(false);
  const scheduleRef = useRef(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const classes = state.classes;
  const ticks = useMemo(() => buildTicks(classes), [classes]);
  const cols = useMemo(() => buildColumns(ticks), [ticks]);

  const openAdd = () => setModalCtx({ mode: "add" });
  const openAddAt = (dayKey, start, end) =>
    setModalCtx({
      mode: "add",
      day: dayKey,
      start: fromMin(start),
      end: fromMin(end),
    });
  const openEdit = (cls) => setModalCtx({ mode: "edit", classObj: cls });
  const closeModal = () => setModalCtx(null);

  const saveClass = (data) => {
    const isEdit = modalCtx?.mode === "edit";

    const excludeId = isEdit ? modalCtx.classObj.id : null;

    const duplicate = findDuplicateClass(classes, data, excludeId);

    if (duplicate) {
      showDuplicateClassAlert(duplicate);
      return;
    }

    const conflict = findTimeConflict(classes, data, excludeId);

    if (conflict) {
      showTimeConflictAlert(conflict, data);
      return;
    }

    setState((s) => {
      if (isEdit) {
        return {
          ...s,
          classes: s.classes.map((c) =>
            c.id === modalCtx.classObj.id ? { ...c, ...data } : c,
          ),
        };
      }

      return {
        ...s,
        classes: [
          ...s.classes,
          {
            id: "c" + Date.now() + Math.random().toString(16).slice(2),
            ...data,
          },
        ],
      };
    });

    setModalCtx(null);
    showSaveSuccessAlert(isEdit, data);
  };

  const deleteClass = async () => {
    if (modalCtx?.mode !== "edit") return;

    const target = modalCtx.classObj;

    const result = await showDeleteConfirm(target);

    if (!result.isConfirmed) return;

    setState((s) => ({
      ...s,
      classes: s.classes.filter((c) => c.id !== target.id),
    }));

    setModalCtx(null);

    await showDeleteSuccessAlert(target);
  };

  const clearAll = async () => {
    if (classes.length === 0) {
      return;
    }

    const count = classes.length;
    const result = await showClearAllConfirm(count);

    if (!result.isConfirmed) {
      return;
    }

    setState((s) => ({
      ...s,
      classes: [],
    }));

    await showClearAllSuccess(count);
  };

  {
    /* ลบวิชาภายในตารางสรุป */
  }
  const deleteClassFromSummary = async (cls) => {
    const result = await showDeleteConfirm(cls);

    if (!result.isConfirmed) return;

    setState((s) => ({
      ...s,
      classes: s.classes.filter((item) => String(item.id) !== String(cls.id)),
    }));

    await showDeleteSuccessAlert(cls);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportPDF(scheduleRef.current);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportExcel(classes, cols);
    } catch (error) {
      console.error("Export Excel failed:", error);
    }
  };

  const handleDownloadImage = async () => {
    setExporting(true);
    try {
      await downloadImage(scheduleRef.current);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container-fluid px-3 px-md-5" style={{ maxWidth: 1500 }}>
      <Toolbar
        onAdd={openAdd}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onDownloadImage={handleDownloadImage}
        onExportJSON={() => exportJSON(classes)}
        onClearAll={clearAll}
        exporting={exporting}
      />

      <ScheduleTable
        ref={scheduleRef}
        classes={classes}
        cols={cols}
        onCellClick={openAddAt}
        onClassClick={openEdit}
      />

      <div className="footer-note">
        ข้อมูลถูกบันทึกไว้ใน localStorage ของเบราว์เซอร์นี้เท่านั้น
      </div>

      {/* ตารางสรุปรายวิชา */}
      <SummarySubject
        classes={classes}
        onEdit={openEdit}
        onDelete={deleteClassFromSummary}
        onAdd={openAdd}
      />

      <div style={{ height: "10px" }} />

      <Footer />

      <ClassModal
        show={!!modalCtx}
        onClose={closeModal}
        onSave={saveClass}
        onDelete={deleteClass}
        initial={modalCtx?.mode === "edit" ? modalCtx.classObj : null}
        defaultDay={modalCtx?.day}
        defaultStart={modalCtx?.start}
        defaultEnd={modalCtx?.end}
        classes={classes}
      />
    </div>
  );
}
