export default function AuthInput({ label, type = "text", placeholder, id, name, value, onChange, required }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}