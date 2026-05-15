import type { CycleConfig, DayTarget, ProjectionResult, Reading, Status } from '../types'

const SAFETY_MARGIN = 0.10
const CYCLE_MS = 7 * 24 * 60 * 60 * 1000

export function getCycleStart(now: Date, cycle: CycleConfig): Date {
  const candidate = new Date(now)
  candidate.setHours(cycle.resetHour, cycle.resetMinute, 0, 0)

  const dayDiff = (candidate.getDay() - cycle.resetDayOfWeek + 7) % 7
  candidate.setDate(candidate.getDate() - dayDiff)

  if (candidate.getTime() > now.getTime()) {
    candidate.setDate(candidate.getDate() - 7)
  }

  return candidate
}

export function getCycleEnd(cycleStart: Date): Date {
  return new Date(cycleStart.getTime() + CYCLE_MS)
}

export function getProgress(now: Date, cycleStart: Date, cycleEnd: Date): number {
  const elapsed = now.getTime() - cycleStart.getTime()
  const duration = cycleEnd.getTime() - cycleStart.getTime()
  return Math.min(1, Math.max(0, elapsed / duration))
}

export function getSafeCeiling(progress: number): number {
  return progress * 100 * (1 - SAFETY_MARGIN)
}

export function getStatus(currentPercent: number, safeCeiling: number): Status {
  const delta = safeCeiling - currentPercent
  if (delta >= 10) return 'ok'
  if (delta >= 0) return 'warning'
  return 'critical'
}

export function getProjection(
  readings: Reading[],
  cycleStart: Date,
  cycleEnd: Date,
  now: Date,
): ProjectionResult {
  const cycleReadings = readings.filter(r => r.timestamp >= cycleStart.getTime())
  if (cycleReadings.length < 2) return { available: false }

  const sorted = [...cycleReadings].sort((a, b) => a.timestamp - b.timestamp)
  const latest = sorted[sorted.length - 1]!
  const previous = sorted[sorted.length - 2]!

  const deltaMs = latest.timestamp - previous.timestamp
  const deltaPercent = latest.percent - previous.percent

  if (deltaMs <= 0 || deltaPercent <= 0) return { available: false }

  const ratePerMs = deltaPercent / deltaMs
  const msToExhaust = (100 - latest.percent) / ratePerMs
  const exhaustsAt = latest.timestamp + msToExhaust

  const exhaustsBeforeReset = exhaustsAt < cycleEnd.getTime()
  const msRemaining = cycleEnd.getTime() - now.getTime()
  const percentAtReset = Math.max(0, 100 - (latest.percent + ratePerMs * msRemaining))

  return { available: true, exhaustsBeforeReset, percentAtReset, exhaustsAt }
}

export function getDayTargets(cycleStart: Date, cycleEnd: Date, now: Date): DayTarget[] {
  const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const targets: DayTarget[] = []
  const cycleDuration = cycleEnd.getTime() - cycleStart.getTime()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(cycleStart.getTime() + i * 24 * 60 * 60 * 1000)
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1)
    const elapsed = dayEnd.getTime() - cycleStart.getTime()
    const progress = Math.min(1, elapsed / cycleDuration)
    const safeCeiling = getSafeCeiling(progress)

    const dayDate = new Date(dayStart)
    dayDate.setHours(0, 0, 0, 0)
    const isToday = dayDate.getTime() === today.getTime()
    const isResetDay = i === 6

    targets.push({
      date: dayStart,
      label: DAY_LABELS[dayStart.getDay()] ?? '?',
      safeCeiling: Math.round(safeCeiling),
      isToday,
      isResetDay,
    })
  }

  return targets
}

export function getEndOfDayCeiling(now: Date, cycleStart: Date, cycleEnd: Date): number {
  // Use the same "today" matching logic as getDayTargets so both values agree.
  // Each cycle-day starts at cycleStart + i*24h; we find the one whose calendar
  // date matches today, then compute the ceiling at the END of that cycle-day.
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const cycleDuration = cycleEnd.getTime() - cycleStart.getTime()

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(cycleStart.getTime() + i * 24 * 60 * 60 * 1000)
    const dayDate = new Date(dayStart)
    dayDate.setHours(0, 0, 0, 0)
    if (dayDate.getTime() === today.getTime()) {
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1)
      const elapsed = dayEnd.getTime() - cycleStart.getTime()
      const progress = Math.min(1, elapsed / cycleDuration)
      return getSafeCeiling(progress)
    }
  }

  // Fallback: use end of last cycle day
  const lastDayEnd = new Date(cycleEnd.getTime() - 1)
  return getSafeCeiling(getProgress(lastDayEnd, cycleStart, cycleEnd))
}

export type BottleneckResult =
  | { available: false }
  | {
      available: true
      exhaustsBeforeReset: boolean
      limitId: 'all_models' | 'sonnet_only'
      exhaustsAt: number
    }

export function getBottleneck(
  allModelsReadings: Reading[],
  sonnetReadings: Reading[],
  cycleStart: Date,
  cycleEnd: Date,
  now: Date,
): BottleneckResult {
  const allProj = getProjection(allModelsReadings, cycleStart, cycleEnd, now)
  const sonnetProj = getProjection(sonnetReadings, cycleStart, cycleEnd, now)

  if (!allProj.available && !sonnetProj.available) return { available: false }

  const allExhaustsAt = allProj.available ? allProj.exhaustsAt : Infinity
  const sonnetExhaustsAt = sonnetProj.available ? sonnetProj.exhaustsAt : Infinity

  const earliest = allExhaustsAt <= sonnetExhaustsAt ? allExhaustsAt : sonnetExhaustsAt
  const limitId = allExhaustsAt <= sonnetExhaustsAt ? 'all_models' : 'sonnet_only'

  return {
    available: true,
    exhaustsBeforeReset: earliest < cycleEnd.getTime(),
    limitId,
    exhaustsAt: earliest,
  }
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '0m'
  const totalMinutes = Math.floor(ms / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function getLatestCycleReading(readings: Reading[], cycleStart: Date): Reading | null {
  const cycleReadings = readings.filter(r => r.timestamp >= cycleStart.getTime())
  if (cycleReadings.length === 0) return null
  return cycleReadings.reduce((a, b) => (a.timestamp > b.timestamp ? a : b))
}
