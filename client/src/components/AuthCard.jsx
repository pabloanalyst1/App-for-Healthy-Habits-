export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {children}

        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}