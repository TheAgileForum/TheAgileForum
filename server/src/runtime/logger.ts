type LogLevel = "INFO" | "WARN" | "ERROR";

function write(level: LogLevel, message: string, context: Record<string, unknown> = {}) {
  const payload = {
    level,
    message,
    ts: new Date().toISOString(),
    pid: process.pid,
    ...context,
  };
  const line = JSON.stringify(payload);
  if (level === "ERROR") {
    console.error(line);
    return;
  }
  console.log(line);
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  write("INFO", message, context);
}

export function logWarn(message: string, context?: Record<string, unknown>) {
  write("WARN", message, context);
}

export function logError(message: string, context?: Record<string, unknown>) {
  write("ERROR", message, context);
}
