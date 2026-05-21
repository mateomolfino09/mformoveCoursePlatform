type ApiErrorPayload = {
  error?: unknown;
  message?: unknown;
};

const readPayloadMessage = (payload: unknown): string | null => {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;

  if (typeof payload === 'object') {
    const data = payload as ApiErrorPayload;
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
  }

  return null;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Ocurrió un error inesperado.'
): string => {
  if (!error) return fallback;

  if (typeof error === 'string' && error.trim()) return error;

  if (typeof error === 'object') {
    const err = error as {
      response?: { data?: unknown };
      message?: string;
      errors?: Record<string, { message?: string }>;
    };

    const responseMessage = readPayloadMessage(err.response?.data);
    if (responseMessage) return responseMessage;

    if (err.errors) {
      const validationMessages = Object.values(err.errors)
        .map((entry) => entry?.message)
        .filter(Boolean);
      if (validationMessages.length > 0) {
        return validationMessages.join(' ');
      }
    }

    if (err.message?.trim()) return err.message;
  }

  return fallback;
};

export const getApiErrorStatus = (error: unknown, fallback = 500): number => {
  if (typeof error === 'object' && error) {
    const status = (error as { response?: { status?: number }; statusCode?: number }).response?.status
      ?? (error as { statusCode?: number }).statusCode;
    if (typeof status === 'number' && status >= 400) return status;
  }

  return fallback;
};
