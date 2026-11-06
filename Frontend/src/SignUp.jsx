// SignUp.jsx — tela de cadastro (e-mail/senha + Google).

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { authErrorMessage } from "./authErrors";
import AuthLayout from "./AuthLayout";
import GoogleIcon from "./GoogleIcon";

const Eye = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>);
const EyeOff = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 4.6A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.3 4.1M6.1 6.1A17.6 17.6 0 0 0 2 12s3.6 7 10 7a10.9 10.9 0 0 0 3.5-.6"/></svg>);

export default function SignUp() {
  const { signUp, logInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await signUp(name, email, password);
      navigate("/"); // troque pela rota inicial do app
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await logInWithGoogle();
      navigate("/");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Criar sua conta" subtitle="Só alguns dados para começar a organizar seus arquivos.">
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="fields">
          <label className="field">
            <span>Nome</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como quer ser chamado" autoComplete="name" />
          </label>
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" />
          </label>
          <label className="field">
            <span>Senha</span>
            <div className="pw">
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} aria-label="Mostrar senha">
                {showPw ? EyeOff : Eye}
              </button>
            </div>
          </label>
          <label className="field">
            <span>Confirmar senha</span>
            <input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : "Criar conta"}
        </button>
      </form>

      <div className="divider"><span>ou</span></div>

      <button type="button" className="btn-google" onClick={handleGoogle} disabled={loading}>
        <GoogleIcon /> Cadastrar com o Google
      </button>

      <p className="switch">
        Já tem uma conta? <Link to="/login" className="link">Entrar</Link>
      </p>
    </AuthLayout>
  );
}
