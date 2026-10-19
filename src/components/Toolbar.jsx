import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/toolbar.css";

export default function Toolbar({
  onAdd,
  onExportPDF,
  onExportExcel,
  onDownloadImage,
  onExportJSON,
  onClearAll,
  exporting,
}) {
  return (
    <div className="app-header d-flex justify-content-between align-items-end flex-wrap gap-3">
      <div>
        <div className="d-flex align-items-center gap-2">
          <i
            className="bi bi-calendar-week me-1 mb-1"
            aria-hidden="true"
            style={{
              fontSize: "1.8rem",
              color: "#b39ff0",
            }}
          ></i>

          <h1 className="app-title mb-1" style={{ fontSize: "2rem" }}>
            ClassFlow
          </h1>
        </div>

        <div className="app-subtitle">
          เลือกช่วงเวลาได้อิสระ · คาบจะจัดวางในตารางให้อัตโนมัติ
        </div>
      </div>

      {/* เมนูหลัก + เมนูเพิ่มเติม */}
      <div className="d-flex flex-wrap gap-2">
        <button className="btn btn-purple btn-sm" onClick={onAdd}>
          <i className="bi bi-plus-lg me-1"></i>
          เพิ่มคาบเรียน
        </button>

        <div className="dropdown">
          <button
            className="btn btn-tool btn-sm dropdown-toggle btn-more-animated"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-three-dots me-1"></i>
            เพิ่มเติม
          </button>

          <ul className="dropdown-menu dropdown-menu-end custom-dropdown">
            <li>
              <button
                className="dropdown-item"
                onClick={onExportPDF}
                disabled={exporting}
              >
                <i className="bi bi-file-earmark-pdf me-2 text-danger"></i>
                Export PDF (.pdf)
              </button>
            </li>

            <li>
              <button
                type="button"
                className="dropdown-item"
                onClick={onExportExcel}
                disabled={exporting}
              >
                <i className="bi bi-file-earmark-excel me-2 text-success"></i>
                Export Excel (.xlsx)
              </button>
            </li>

            <li>
              <button className="dropdown-item" onClick={onExportJSON}>
                <i className="bi bi-filetype-json me-2 text-warning"></i>
                Export JSON (.json)
              </button>
            </li>

            <li>
              <button
                className="dropdown-item"
                onClick={onDownloadImage}
                disabled={exporting}
              >
                <i className="bi bi-image me-2 text-primary"></i>
                ดาวน์โหลดรูปภาพ
              </button>
            </li>

            <li>
              <hr className="dropdown-divider" />
            </li>

            <li>
              <button
                className="dropdown-item text-danger"
                onClick={onClearAll}
              >
                <i className="bi bi-trash3 me-2"></i>
                ล้างทั้งหมด
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
