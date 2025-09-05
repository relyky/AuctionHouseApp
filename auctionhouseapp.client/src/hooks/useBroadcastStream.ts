import { useCallback, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { delayPromise } from "../tools/utils";
import { baseBiddingSnAtom } from "../atoms/metaAtom";
import axios from "axios";

/**
 * 要求伺服器推播現場拍賣狀態
 * 推訊息事件處理函式。
 */
export function useBroadcastStream(notifier: (info: ILiveAuctionStatus) => void)
  : [f_starting: boolean, f_streaming: boolean] {
  const [f_streaming, setStreaming] = useState<boolean>(false);
  const [f_starting, setStarting] = useState<boolean>(false);

  /// 中斷請求控制器，用於取消正在進行的請求。
  /// ref→(https://developer.mozilla.org/zh-TW/docs/Web/API/AbortController)
  const abortRef = useRef<AbortController>(null)
  const doneRef = useRef<boolean>(false);

  const startDataStream = useCallback(async () => {
    try {
      setStarting(true);
      abortRef.current = new AbortController();
      const response = await fetch('/api/Broadcast/RequestLiveAuctionStream', {
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
            doneRef.current = true;
            break;
          }

          const chunk = decoder.decode(value);
          console.debug('Received.chunk', chunk);

          // 最後一個 chunk === ']' 不處理。
          if (chunk === ']') {
            console.log("stream received ']' end code.")
            continue;
          }

          // chunk 解析 => IForecast ※只會有一訊息物件。
          const json = chunk.slice(1); // 解析出單元 JSON 字串。
          const info: ILiveAuctionStatus = JSON.parse(json);
          notifier(info); // 通知外部處理資料
        }
      }
      catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          console.debug('✅ Stream aborted by user', { err });
        } else {
          throw err;
        }
      }

      // SUCCESS: 正常結束串流
      console.info('stream finished', '正常結束串流');
      setStreaming(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.debug('✅ Stream aborted', { err });
      } else {
        console.error('❌ startDataStream.ERROR', { err });
      }

      setStarting(false);
      setStreaming(false);
    }
  }, [notifier]);

  useEffect(() => {
    if (!abortRef.current && !f_starting && !f_streaming)
      startDataStream()
        .then(() => console.info('startDataStream.DONE'))
        .catch(err => console.error('startDataStream.CATCH', { err }));

    return () => {
      if (abortRef.current) {
        //abortRef.current.abort('stream aborted in useEffect-return.'); // 正常中止串流
        abortRef.current.abort(new DOMException('stream aborted in useEffect-return.', 'AbortError')); // 正常中止串流
        abortRef.current = null;
      }
    }
  }, []);

  /**
   * 自動重啟串流機制。
   * 若正常結束，則在 3 秒後自動重啟串流。
   */
  useEffect(() => {
    if (doneRef.current === true) {
      setTimeout(() => {
        if (doneRef.current === true) {
          doneRef.current = false;
          startDataStream()
            .then(() => console.info('restartDataStream.DONE'))
            .catch(err => console.error('restartDataStream.CATCH', { err }));        } 
      }, 3000);
    }
  }, [doneRef.current]);

  return [f_starting, f_streaming];
}

/**
 * 推訊息事件處理函式。
 */
export function useBiddingEventStream(notifier: (info: IBiddingEvent) => void)
  : [toggleDataStream: () => void, f_starting: boolean, f_streaming: boolean] {
  const [f_streaming, setStreaming] = useState<boolean>(false);
  const [f_starting, setStarting] = useState<boolean>(false);

  /// 中斷請求控制器，用於取消正在進行的請求。
  /// ref→(https://developer.mozilla.org/zh-TW/docs/Web/API/AbortController)
  const abortRef = useRef<AbortController>(null)

  const startDataStream = useCallback(async () => {
    try {
      setStarting(true);

      await delayPromise(1000)
      console.info('RequestBiddingEventStream', 'GO')

      abortRef.current = new AbortController();
      const response = await fetch('/api/Broadcast/RequestBiddingEventStream/0', {
        method: 'POST',
        signal: abortRef.current.signal,
      });

      console.info('RequestBiddingEventStream', { response })

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

          const chunk = decoder.decode(value, { stream: true });
          console.debug('Received.chunk', chunk);

          // 最後一個 chunk === ']' 不處理。
          if (chunk === ']') continue;

          // 解析 ckunk → 正規化成 arrayJson ※可能有多個同時傳來事件。
          const arrayJson = (chunk.startsWith('[{')) ? chunk.concat(']')
            : (chunk.startsWith(',{')) ? '[' + chunk.slice(1) + ']'
              : '[]';

          const evnetList: IBiddingEvent[] = JSON.parse(arrayJson);
          evnetList.forEach(info => {
            notifier(info); // 通知外部處理資料
          });
        }
      }
      catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          console.debug('✅ Stream aborted by user', { err });
        } else {
          console.error('✅ Stream aborted.error', { err });
          throw err;
        }
      }

      // SUCCESS: 正常結束串流
      setStreaming(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.debug('✅ Stream aborted', { err });
      } else {
        console.error('❌ startDataStream.ERROR', { err });
      }

      setStarting(false);
      setStreaming(false);
    }
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
    //  startDataStream()
    //    .then(() => console.log('startDataStream.DONE'))
    //    .catch(err => console.log('startDataStream.CATCH', { err }));

    return () => {
      if (abortRef.current) {
        //abortRef.current.abort('stream aborted in useEffect-return.'); // 正常中止串流
        abortRef.current.abort(new DOMException('stream aborted in useEffect-return.', 'AbortError')); // 正常中止串流
        abortRef.current = null;
      }
    }
  }, []);

  return [toggleDataStream, f_starting, f_streaming];
}

//---------------
async function qryBiddingEvent(baseBiddingSn: number) {
  const response = await axios.post<IBiddingEvent[]>(`/api/Broadcast/QryBiddingEvent/${baseBiddingSn}`);
  if (response.status !== 200) return []; // 視同查無資料。
  const infoList = response.data;
  return infoList;
}

/**
 * 拉訊息事件處理函式。
 */
export function useBiddingEventPump(notifier: (info: IBiddingEvent) => void)
  : [f_pumping: boolean, baseBiddingSn: number, resetBaseState: () => void] {
  const [{ baseBiddingSn }, setBaseBiddingSn] = useAtom(baseBiddingSnAtom)
  const [f_pumping, setPumping] = useState<boolean>(false);
  //const [baseBiddingSn, setBaseBiddingSn] = useState<number>(320);

  const doBiddingEventProcess = useCallback(async (baseBiddingSn: number) => {
    const infoList = await qryBiddingEvent(baseBiddingSn)

    let lastBiddingSn = baseBiddingSn;
    infoList.forEach(info => {
      notifier(info); // 通知外部處理資料
      if (info.biddingSn > baseBiddingSn) {
        lastBiddingSn = info.biddingSn; // 更新最後的 biddingSn
      }
    });

    return lastBiddingSn; // 返回最新的 biddingSn
  }, [notifier]);

  const resetBaseState = useCallback(() => {
    setBaseBiddingSn({ baseBiddingSn: 0 });
  }, [setBaseBiddingSn])

  useEffect(() => {
    /**
     * 遞迴請求拍賣事件處理函式。
     */
    function requestBiddingEventProcess(baseBiddingSn: number) {
      doBiddingEventProcess(baseBiddingSn).then(lastBiddingSn => {
        if (lastBiddingSn === baseBiddingSn) {
          setPumping(false);
          setTimeout(() =>
            requestBiddingEventProcess(baseBiddingSn)
            , 2099); // 等待 2 秒後再請求。
        }
        else {
          setPumping(true);
          setBaseBiddingSn({ baseBiddingSn: lastBiddingSn }); // 更新狀態
          setTimeout(() =>
            requestBiddingEventProcess(lastBiddingSn)
            , 211); // 等待 0.2 秒後再請求。103,211,
        }
      });
    }

    setTimeout(() => {
      setPumping(true);
      requestBiddingEventProcess(baseBiddingSn);
    }, 1000); // 等待 1 秒後啟動。
  }, []);

  return [f_pumping, baseBiddingSn, resetBaseState]
}
