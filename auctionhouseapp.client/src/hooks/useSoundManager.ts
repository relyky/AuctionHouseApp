/**
 * 此份碼由 AI 生成。
 */
import { useState, useRef, useCallback, useEffect } from 'react';

// 聲音管理器類別
class BrowserSoundManager {
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement;

  constructor() {
    this.audioElement = new Audio();
  }

  private async initAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async playBeep(
    frequency: number = 440,
    duration: number = 200,
    volume: number = 0.3,
    waveType: OscillatorType = 'sine'
  ): Promise<void> {
    await this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = waveType;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);

    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  async playSystemSound(type: 'success' | 'error' | 'warning' | 'notification'): Promise<void> {
    const soundConfigs = {
      success: { frequency: 523, duration: 200, waveType: 'sine' as OscillatorType },
      error: { frequency: 200, duration: 400, waveType: 'sawtooth' as OscillatorType },
      warning: { frequency: 300, duration: 300, waveType: 'square' as OscillatorType },
      notification: { frequency: 800, duration: 150, waveType: 'triangle' as OscillatorType }
    };

    const config = soundConfigs[type];
    await this.playBeep(config.frequency, config.duration, 0.3, config.waveType);
  }

  async playToneSequence(frequencies: number[], noteDuration: number = 200, gap: number = 50): Promise<void> {
    for (let i = 0; i < frequencies.length; i++) {
      await this.playBeep(frequencies[i], noteDuration);
      if (i < frequencies.length - 1) {
        await new Promise(resolve => setTimeout(resolve, gap));
      }
    }
  }

  async playDTMF(key: string, duration: number = 200): Promise<void> {
    const dtmfMap: { [key: string]: [number, number] } = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
    };

    const frequencies = dtmfMap[key];
    if (!frequencies) return;

    await this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator1.frequency.value = frequencies[0];
    oscillator2.frequency.value = frequencies[1];

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = 0.2;

    const startTime = this.audioContext.currentTime;
    const endTime = startTime + duration / 1000;

    oscillator1.start(startTime);
    oscillator2.start(startTime);
    oscillator1.stop(endTime);
    oscillator2.stop(endTime);

    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  async playWhiteNoise(duration: number = 1000, volume: number = 0.1): Promise<void> {
    await this.initAudioContext();
    if (!this.audioContext) return;

    const bufferSize = this.audioContext.sampleRate * duration / 1000;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    whiteNoise.buffer = buffer;
    whiteNoise.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = volume;

    whiteNoise.start();
    whiteNoise.stop(this.audioContext.currentTime + duration / 1000);

    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  stopAllSounds(): void {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// 自訂 Hook
export function useSoundManager() {
  const soundManagerRef = useRef<BrowserSoundManager | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    soundManagerRef.current = new BrowserSoundManager();
    return () => {
      soundManagerRef.current?.stopAllSounds();
    };
  }, []);

  const playSound = useCallback(async (
    type: 'beep' | 'success' | 'error' | 'warning' | 'notification' | 'whitenoise',
    params?: any
  ) => {
    if (!soundManagerRef.current || isMuted) return;

    setIsPlaying(true);
    try {
      switch (type) {
        case 'beep':
          await soundManagerRef.current.playBeep(
            params?.frequency || 440,
            params?.duration || 200,
            volume,
            params?.waveType || 'sine'
          );
          break;
        case 'whitenoise':
          await soundManagerRef.current.playWhiteNoise(
            params?.duration || 1000,
            volume
          );
          break;
        default:
          await soundManagerRef.current.playSystemSound(type);
          break;
      }
    } catch (error) {
      console.error('播放聲音失敗:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [volume, isMuted]);

  const playToneSequence = useCallback(async (frequencies: number[]) => {
    if (!soundManagerRef.current || isMuted) return;

    setIsPlaying(true);
    try {
      await soundManagerRef.current.playToneSequence(frequencies);
    } catch (error) {
      console.error('播放音序列失敗:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [isMuted]);

  const playDTMF = useCallback(async (keys: string) => {
    if (!soundManagerRef.current || isMuted) return;

    setIsPlaying(true);
    try {
      for (const key of keys) {
        await soundManagerRef.current.playDTMF(key, 200);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('播放 DTMF 失敗:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [isMuted]);

  const stopAllSounds = useCallback(() => {
    soundManagerRef.current?.stopAllSounds();
    setIsPlaying(false);
  }, []);

  return {
    playSound,
    playToneSequence,
    playDTMF,
    stopAllSounds,
    isPlaying,
    volume,
    setVolume,
    isMuted,
    setIsMuted
  };
}
