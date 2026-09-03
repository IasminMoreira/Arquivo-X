// authErrors.js — traduz os códigos de erro do Firebase para mensagens
// claras em português. Sempre passe pelo aqui antes de mostrar ao usuário:
// as mensagens padrão do Firebase vêm em inglês e técnicas demais.

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
  "auth/popup-blocked": "O navegador bloqueou o pop-up. Libere e tente de novo.",
  "auth/account-exists-with-different-credential":
    "Este e-mail já tem conta com outro método de login.",
  "auth/credential-already-in-use":
    "Esta conta do Google já está vinculada a outro usuário.",
  "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
};

export function authErrorMessage(error) {
  const code = error?.code || "";
  return MESSAGES[code] || "Algo deu errado. Tente novamente.";
}
