// Facebook Graph API version and base URL
export const FB_API_VERSION = 'v21.0';
export const FB_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

// Error messages
export const FB_ERROR_MESSAGES = {
  TOKEN_EXPIRED: 'O token de acesso do Facebook expirou. Por favor, reconecte sua conta.',
  INVALID_TOKEN: 'Token de acesso inválido. Por favor, reconecte sua conta.',
  PERMISSION_DENIED: 'Permissão negada. Verifique as permissões da sua conta.',
  GENERIC_ERROR: 'Ocorreu um erro ao se comunicar com a API do Facebook.',
};