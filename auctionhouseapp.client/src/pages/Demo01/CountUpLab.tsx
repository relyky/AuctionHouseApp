import { useEffect, useMemo } from 'react'
import { useCountdown } from 'usehooks-ts'

export default function CountUpLab() {
  const [count, hand] = useCountdown({ countStart: 0, countStop: Infinity, intervalMs: 100, isIncrement: true })

  useEffect(() => {
    hand.startCountdown()
  }, [])

  const formatedCount = useMemo(() => {
    const totalSeconds = Math.floor(count / 10);
    const tenths = count % 10;
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
  }, [count])

  return (
    <div>
      <div>{count}→{formatedCount}</div>
      <button onClick={() => hand.startCountdown()}>啟動</button>
      <button onClick={() => hand.stopCountdown()} >停止</button>
      <button onClick={() => hand.resetCountdown()}>重置</button>
    </div>
  )
}
