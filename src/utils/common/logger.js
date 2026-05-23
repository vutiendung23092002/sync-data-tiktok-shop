export function formatError(error) {
  if (error?.response?.data) {
    return JSON.stringify(error.response.data, null, 2);
  }

  return error?.message || String(error);
}

export function logError(message, error) {
  console.error(`${message}: ${formatError(error)}`);
}

