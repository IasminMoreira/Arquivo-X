// App.jsx — as rotas do app.

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./Home";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<SignUp />} />

      {/* Rota protegida: só entra quem está logado */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Qualquer rota desconhecida volta para a home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
