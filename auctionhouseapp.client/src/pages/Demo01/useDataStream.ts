import { useCallback, useEffect, useRef, useState } from "react";

export default function useDataStream(notifier: (info: IForecast) => void)
  : [toggleDataStream: () => void, f_starting: boolean, f_streaming: boolean] {
  const [f_streaming, setStreaming] = useState<boolean>(false);
  const [f_starting, setStarting] = useState<boolean>(false);

  /// 中斷請求控制器，用於取消正在進行的請求。
  /// ref→(https://developer.mozilla.org/zh-TW/docs/Web/API/AbortController)
  const abortRef = useRef<AbortController>(null)

  const startDataStream = useCallback(async () => {
    setStarting(true);
    abortRef.current = new AbortController();
    const response = await fetch('/api/WeatherForecast/QryDataStream', {
      method: 'POST',
      signal: abortRef.current.signal,
    });

    setStarting(false);
    setStreaming(true);
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();

        // 正常結束
        if (done) {
          console.log('stream end')
          abortRef.current = null;
          break;
        }

        const chunk = decoder.decode(value);
        console.debug('Received.chunk', chunk);

        // 最後一個 chunk === ']' 不處理。
        if (chunk === ']') continue;

        // chunk 解析 => IForecast
        const json = chunk.slice(1); // 解析出單元 JSON 字串。
        const info: IForecast = JSON.parse(json);
        notifier(info); // 通知外部處理資料
      }
    }
    catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.log('✅ Stream aborted by user');
      } else {
        throw err;
      }
    }

    //
    setStreaming(false);
  }, [notifier]);

  const toggleDataStream = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort(); // 中止串流
      console.log("stream aborted");
      abortRef.current = null;
    } else {
      startDataStream(); // 啟動串流
      console.log("stream start");
    }
  }, [])

  useEffect(() => {
    //if (!abortRef.current)
    //  startDataStream();

    return () => {
      if (abortRef.current) {
        abortRef.current.abort(); // 中止串流
        console.log("stream aborted in useEffect-return.");
        abortRef.current = null;
      }
    }
  }, []);

  return [toggleDataStream, f_starting, f_streaming];
}