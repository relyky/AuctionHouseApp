import { useCallback, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AUC2010_Handler() {

  const qryBiddingEvent = useCallback(async (liveSt: ILiveAuctionStatus) => {
    try {
      const resp = await axios.post(`/api/Auction/QryBiddingEventList/${liveSt.bidOpenSn}`)
      return resp.data as IBiddingEvent[];
    } catch (err) {
      console.error('qryBiddingEvent FAIL!', { err });
      Swal.fire('執行失敗', (err as Error).message, 'error');
      return [];
    }
  }, []);

  const toggleBiddingEventValid = useCallback(async (bid: IBiddingEvent) => {
    try {
      const resp = await axios.post(`/api/Auction/ToggleBiddingEventValid/${bid.lotNo}/${bid.bidOpenSn}/${bid.biddingSn}`)
      return resp.data as IBiddingEvent;
    } catch (err) {
      console.error('toggleBiddingEventValid FAIL!', { err });
      Swal.fire('執行失敗', (err as Error).message, 'error');
      return null;
    }
  }, []);

  const hammerBiddingEvent = useCallback(async (bid: IBiddingEvent, act: string) => {
    try {
      const resp = await axios.post(`/api/Auction/HammerBiddingEvent/${bid.lotNo}/${bid.bidOpenSn}/${bid.biddingSn}?act=${act}`)
      const msg = resp.data as string;
      if (msg === 'SUCCESS')
        Swal.fire('執行成功。', msg, 'success');
      else
        Swal.fire('執行失敗。', msg, 'warning');
    } catch (err) {
      console.error('hammerBiddingEvent FAIL!', { err });
      Swal.fire('執行失敗', (err as Error).message, 'error');
    }
  }, [])

  const hammerLotPassed = useCallback(async (lotNo: string) => {
    try {
      const resp = await axios.post(`/api/Auction/HammerLotPassed/${lotNo}`)
      const msg = resp.data as string;
      if (msg === 'SUCCESS')
        Swal.fire('執行成功。', msg, 'success');
      else
        Swal.fire('執行失敗。', msg, 'warning');
    } catch (err) {
      console.error('hammerLotPassed FAIL!', { err });
      Swal.fire('執行失敗', (err as Error).message, 'error');
    }
  }, [])

  // 回傳 handlers
  return useMemo(() =>
    ({ qryBiddingEvent, toggleBiddingEventValid, hammerBiddingEvent, hammerLotPassed }),
    [qryBiddingEvent, toggleBiddingEventValid, hammerBiddingEvent, hammerLotPassed]
  );
}