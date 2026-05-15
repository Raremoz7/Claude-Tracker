export type Reading = {
  timestamp: number
  percent: number
}

export type LimitId = 'all_models' | 'sonnet_only'

export type Limit = {
  id: LimitId
  label: string
  readings: Reading[]
}

export type CycleConfig = {
  resetDayOfWeek: number
  resetHour: number
  resetMinute: number
}

export type AppState = {
  limits: Limit[]
  cycle: CycleConfig
}

export type Status = 'ok' | 'warning' | 'critical' | 'empty'

export type ProjectionResult =
  | { available: false }
  | { available: true; exhaustsBeforeReset: boolean; percentAtReset: number; exhaustsAt: number }

export type DayTarget = {
  date: Date
  label: string
  safeCeiling: number
  isToday: boolean
  isResetDay: boolean
}
