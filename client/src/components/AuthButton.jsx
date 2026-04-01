export default function AuthButton({ text, disabled }) {
  return (
    <button className="auth-button" type="submit" disabled={disabled}>
      {text}
    </button>
  );
}