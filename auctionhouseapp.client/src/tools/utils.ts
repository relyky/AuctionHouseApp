/**
 * 工具函式庫
 */

/**
 * 延遲指定毫秒
 */
export function delayPromise(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * type === string 且有值
 */
export function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * 使用 Web Audio API 產生嗶聲
 */
export function beep(frequency: number = 800, duration: number = 200): void {
  if (typeof window === 'undefined' || !window.AudioContext) {
    console.warn('Web Audio API 不支援或在非瀏覽器環境中');
    return;
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration / 1000);
}
