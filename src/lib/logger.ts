type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

const isDev = import.meta.env.DEV

function emit(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (!isDev && level === 'debug') return
  const entry: LogEntry = { level, message, timestamp: new Date().toISOString(), context }
  const serialized = JSON.stringify(entry)
  if      (level === 'error') console.error(serialized)
  else if (level === 'warn')  console.warn(serialized)
  else                        console.log(serialized)
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => emit('debug', msg, ctx),
  info:  (msg: string, ctx?: Record<string, unknown>) => emit('info',  msg, ctx),
  warn:  (msg: string, ctx?: Record<string, unknown>) => emit('warn',  msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => emit('error', msg, ctx),
}
