const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => isDevelopment && console.log(...args),
  error: (...args: unknown[]) => console.error(...args),
  warn: (...args: unknown[]) => isDevelopment && console.warn(...args),
  info: (...args: unknown[]) => isDevelopment && console.info(...args),
};
