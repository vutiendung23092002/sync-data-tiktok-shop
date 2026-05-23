export function getDateRangeFromEnv(envSource = process.env) {
  return {
    from: envSource.FROM ? `${envSource.FROM} 00:00:00` : null,
    to: envSource.TO ? `${envSource.TO} 23:59:59` : null,
  };
}

