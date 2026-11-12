/* Vercel 静态部署用的 logger 垫片：替代 @lark-apaas/client-toolkit/logger */
export const logger = {
  error: (...args: unknown[]) => console.error('[error]', ...args),
  warn: (...args: unknown[]) => console.warn('[warn]', ...args),
  info: (...args: unknown[]) => console.info('[info]', ...args),
  debug: (...args: unknown[]) => console.debug('[debug]', ...args),
};

export default logger;
