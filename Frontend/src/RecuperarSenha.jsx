// RecuperarSenha.jsx — tela de recuperação de senha via e-mail.
// Chama o endpoint /api/password/reset do backend.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { authErrorMessage } from "./authErrors";
import AuthLayout from "./AuthLayout";

export default function RecuperarSenha() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Informe o e-mail cadastrado.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Recuperar senha" subtitle="Informe o e-mail da sua conta e enviaremos as instruções.">
      {error && <div className="error">{error}</div>}

      {success ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: "1.5rem", color: "var(--muted)" }}>
            Se o e-mail estiver cadastrado, você receberá as instruções em breve.
          </p>
          <Link to="/login" className="btn-primary" style={{ display: "inline-block" }}>
            Voltar para o login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="fields">
            <label className="field">
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
              />
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : "Enviar instruções"}
          </button>
        </form>
      )}

      <p className="switch">
        Lembrou a senha? <Link to="/login" className="link">Voltar ao login</Link>
      </p>
    </AuthLayout>
  );
}
