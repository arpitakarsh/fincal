type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const formattedMeta = meta ? JSON.stringify(meta) : '';
    
    // In production, this could push to Datadog/Sentry
    if (level === 'error') {
      console.error(`[${timestamp}] ERROR: ${message}`, formattedMeta);
    } else if (level === 'warn') {
      console.warn(`[${timestamp}] WARN: ${message}`, formattedMeta);
    } else if (level === 'info') {
      console.info(`[${timestamp}] INFO: ${message}`, formattedMeta);
    } else if (process.env.NODE_ENV !== 'production' && level === 'debug') {
      console.debug(`[${timestamp}] DEBUG: ${message}`, formattedMeta);
    }
  }

  info(message: string, meta?: any) { this.log('info', message, meta); }
  warn(message: string, meta?: any) { this.log('warn', message, meta); }
  error(message: string, meta?: any) { this.log('error', message, meta); }
  debug(message: string, meta?: any) { this.log('debug', message, meta); }
}

export const logger = new Logger();
