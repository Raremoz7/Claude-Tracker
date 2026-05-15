import { useState, useEffect } from 'react'
import type { CycleConfig, DayTarget } from '../types'
import {
  getCycleStart,
  getCycleEnd,
  getProgress,
  getEndOfDayCeiling,
  getDayTargets,
  formatCountdown,
} from '../lib/cycleCalc'

export type CycleCalcResult = {
  now: Date
  cycleStart: Date
  cycleEnd: Date
  progress: number
  safeCeiling: number   // teto do fim do dia corrente (usado para status e exibição)
  dayTargets: DayTarget[]
  timeUntilReset: string
  msUntilReset: number
}

export function useCycleCalc(cycle: CycleConfig): CycleCalcResult {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const cycleStart = getCycleStart(now, cycle)
  const cycleEnd = getCycleEnd(cycleStart)
  const progress = getProgress(now, cycleStart, cycleEnd)
  const safeCeiling = getEndOfDayCeiling(now, cycleStart, cycleEnd)
  const dayTargets = getDayTargets(cycleStart, cycleEnd, now)
  const msUntilReset = Math.max(0, cycleEnd.getTime() - now.getTime())
  const timeUntilReset = formatCountdown(msUntilReset)

  return { now, cycleStart, cycleEnd, progress, safeCeiling, dayTargets, timeUntilReset, msUntilReset }
}
