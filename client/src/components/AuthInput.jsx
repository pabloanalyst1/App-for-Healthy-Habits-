export default function AuthInput({
  label,
  type = "text",
  placeholder,
  id,
  name,
  value,
  onChange,
  required = false,
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}