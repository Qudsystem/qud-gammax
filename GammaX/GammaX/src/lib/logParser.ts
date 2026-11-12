import { LogEntry, LogLevel, LogStats, ErrorFrequency, TimeSeriesPoint, AnalysisResult } from './types'

const LOG_LEVEL_PATTERNS: Record<LogLevel, RegExp> = {
  ERROR: /\b(ERROR|ERR|FATAL|CRITICAL|SEVERE)\b/i,
  WARN: /\b(WARN|WARNING)\b/i,
  INFO: /\b(INFO|INFORMATION)\b/i,
  DEBUG: /\b(DEBUG|DBG)\b/i,
  TRACE: /\b(TRACE|VERBOSE)\b/i,
  UNKNOWN: /.*/
}

const TIMESTAMP_PATTERNS = [
  /^\[?(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:?\d{2})?)\]?/,
  /^\[?(\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2})\]?/,
  /^\[?(\d{2}-\w{3}-\d{4}\s\d{2}:\d{2}:\d{2})\]?/,
  /^(\d{10,13})\s/,
  /^\[?(\d{2}:\d{2}:\d{2})\]?/
]

function extractTimestamp(line: string): Date | null {
  for (const pattern of TIMESTAMP_PATTERNS) {
    const match = line.match(pattern)
    if (match) {
      const timestampStr = match[1]
      
      if (/^\d{10,13}$/.test(timestampStr)) {
        const timestamp = parseInt(timestampStr)
        return new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000)
      }
      
      const date = new Date(timestampStr)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }
  return null
}

function detectLogLevel(line: string): LogLevel {
  for (const [level, pattern] of Object.entries(LOG_LEVEL_PATTERNS)) {
    if (level !== 'UNKNOWN' && pattern.test(line)) {
      return level as LogLevel
    }
  }
  return 'UNKNOWN'
}

function extractMessage(line: string): string {
  let message = line
  
  for (const pattern of TIMESTAMP_PATTERNS) {
    message = message.replace(pattern, '').trim()
  }
  
  message = message.replace(/^\[?(\w+)\]?\s*[:|-]?\s*/, '').trim()
  
  return message || line
}

export function parseLogFile(content: string): LogEntry[] {
  const lines = content.split('\n')
  const entries: LogEntry[] = []
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue
    
    const timestamp = extractTimestamp(trimmedLine)
    const level = detectLogLevel(trimmedLine)
    const message = extractMessage(trimmedLine)
    
    entries.push({
      timestamp,
      level,
      message,
      raw: trimmedLine
    })
  }
  
  return entries
}

export function calculateStats(entries: LogEntry[]): LogStats {
  const total = entries.length
  const errorCount = entries.filter(e => e.level === 'ERROR').length
  const warnCount = entries.filter(e => e.level === 'WARN').length
  const infoCount = entries.filter(e => e.level === 'INFO').length
  const debugCount = entries.filter(e => e.level === 'DEBUG' || e.level === 'TRACE').length
  const unknownCount = entries.filter(e => e.level === 'UNKNOWN').length
  
  return {
    total,
    errorCount,
    warnCount,
    infoCount,
    debugCount,
    unknownCount,
    errorPercentage: total > 0 ? (errorCount / total) * 100 : 0,
    warnPercentage: total > 0 ? (warnCount / total) * 100 : 0
  }
}

export function getTopErrors(entries: LogEntry[], limit: number = 10): ErrorFrequency[] {
  const errorMap = new Map<string, { count: number; level: LogLevel }>()
  
  entries
    .filter(e => e.level === 'ERROR' || e.level === 'WARN')
    .forEach(entry => {
      const key = entry.message.slice(0, 150)
      const existing = errorMap.get(key)
      if (existing) {
        existing.count++
      } else {
        errorMap.set(key, { count: 1, level: entry.level })
      }
    })
  
  return Array.from(errorMap.entries())
    .map(([message, data]) => ({
      message,
      count: data.count,
      level: data.level
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function generateTimeSeries(entries: LogEntry[]): TimeSeriesPoint[] {
  const entriesWithTimestamp = entries.filter(e => e.timestamp !== null)
  
  if (entriesWithTimestamp.length === 0) {
    return []
  }
  
  const timeMap = new Map<string, { errors: number; warnings: number; infos: number }>()
  
  entriesWithTimestamp.forEach(entry => {
    const date = entry.timestamp!
    const hourKey = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString()
    
    const existing = timeMap.get(hourKey) || { errors: 0, warnings: 0, infos: 0 }
    
    if (entry.level === 'ERROR') {
      existing.errors++
    } else if (entry.level === 'WARN') {
      existing.warnings++
    } else if (entry.level === 'INFO' || entry.level === 'DEBUG' || entry.level === 'TRACE') {
      existing.infos++
    }
    
    timeMap.set(hourKey, existing)
  })
  
  return Array.from(timeMap.entries())
    .map(([timestamp, counts]) => ({
      timestamp,
      ...counts
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export function analyzeLogFile(fileName: string, content: string): AnalysisResult {
  const entries = parseLogFile(content)
  const stats = calculateStats(entries)
  const topErrors = getTopErrors(entries)
  const timeSeries = generateTimeSeries(entries)
  
  return {
    fileName,
    uploadDate: new Date(),
    stats,
    topErrors,
    timeSeries,
    entries
  }
}
