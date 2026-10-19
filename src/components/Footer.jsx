import "../css/footer.css";

export default function Footer() {
  return (
    <footer className="classflow-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <i className="bi bi-calendar-week"></i>
          <span>ClassFlow</span>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-credit">
          Developed by <span className="footer-author">BazKK</span>
        </div>
      </div>
    </footer>
  );
}
