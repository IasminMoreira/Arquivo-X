// authErrors.js — traduz erros da API e mensagens amigáveis em português.

const MESSAGES = {
  "auth/invalid-email": "E-mail inválido. Confira o endereço digitado.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/user-not-found": "Não encontramos uma conta com esse e-mail.",
  "auth/wrong-password": "Senha incorreta. Tente de novo.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Este e-mail já está cadastrado. Tente entrar.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um momento e tente de novo.",
  "auth/popup-closed-by-user": "A janela do Google foi fechada antes de concluir.",
  "auth/cancelled-popup-request": "Já existe uma janela de login aberta.",
  "auth/network-request-failed": "Falha de conexão com o servidor local.",
};

export function authErrorMessage(error) {
  if (typeof error === "string") return error;
  if (error?.data?.message) return error.data.message;
  if (error?.data?.errors) {
    const firstField = Object.values(error.data.errors)[0];
    if (Array.isArray(firstField) && firstField[0]) {
      return firstField[0];
    }
  }
  if (error?.message && !error?.code) return error.message;
  const code = error?.code || "";
  return MESSAGES[code] || error?.message || "Algo deu errado. Tente novamente.";
}
