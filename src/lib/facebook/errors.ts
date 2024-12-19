export class FacebookApiError extends Error {
  code?: number;
  status?: number;

  constructor(message: string, code?: number, status?: number) {
    super(message);
    this.name = 'FacebookApiError';
    this.code = code;
    this.status = status;
  }
}

export const handleFacebookError = (error: any) => {
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    throw new FacebookApiError('Não foi possível conectar à API do Facebook. Por favor, verifique sua conexão com a internet e tente novamente.');
  }

  const errorMessage = error.error?.message || 'Erro desconhecido';
  const errorCode = error.error?.code;
  
  if (errorCode === 17) {
    throw new FacebookApiError('Limite de requisições atingido. Por favor, aguarde alguns segundos e tente novamente.', errorCode);
  } else if (errorCode === 100) {
    throw new FacebookApiError(`Permissões insuficientes do Facebook. Por favor, verifique suas credenciais.`, errorCode);
  } else if (errorCode === 190) {
    throw new FacebookApiError('Token de acesso inválido ou expirado. Por favor, atualize suas credenciais.', errorCode);
  }
  
  throw new FacebookApiError(`Erro na API do Facebook: ${errorMessage}`, errorCode);
};