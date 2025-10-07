import { useSetAtom } from "jotai";
import { useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { blockingAtom } from "../../atoms/metaAtom";
import { getData, postData, ResponseError } from "../../tools/httpHelper";
import { delayPromise } from "../../tools/utils";
import { auctionInputAtom } from "./atom";
import type { ICommonResult } from "../../dto/activities/ICommonResult";
import type { ILiveAuctionPreviewResponse } from "../../dto/liveAuction/ILiveAuctionPreviewResponse";
import type { ILiveAuctionStatusResponse } from "../../dto/liveAuction/ILiveAuctionStatusResponse";
import type { IRecordBidRequest } from "../../dto/liveAuction/IRecordBidRequest";
import type { IRecordBidResponse } from "../../dto/liveAuction/IRecordBidResponse";
import type { IHammerResponse } from "../../dto/liveAuction/IHammerResponse";
import type { IPassResponse } from "../../dto/liveAuction/IPassResponse";

export default function AuctionInput_Handler() {
  const setFormState = useSetAtom(auctionInputAtom)
  const setBlocking = useSetAtom(blockingAtom)

  // 查詢拍賣商品列表
  const loadItemList = useCallback(async () => {
    try {
      setBlocking(true)
      const response = await getData<ICommonResult<ILiveAuctionPreviewResponse>>(`/api/LiveAuction/Preview`)
      if (response.success && response.data) {
        setFormState(prev => ({ ...prev, itemList: response.data!.items }))
      } else {
        Swal.fire('Error!', response.message || '查詢失敗', 'error')
      }
    } catch (error) {
      console.error(error);
      if (error instanceof ResponseError)
        Swal.fire('Error!', error.message, 'error')
      else
        Swal.fire('Exception!', "出現意外的錯誤，請聯繫系統與工程師。" + error, 'error')
    } finally {
      await delayPromise(500)
      setBlocking(false)
    }
  }, [setFormState, setBlocking])

  // 取得商品即時狀態
  const loadItemStatus = useCallback(async (itemId: string) => {
    try {
      const response = await getData<ICommonResult<ILiveAuctionStatusResponse>>(`/api/LiveAuction/status/${itemId}`)
      if (response.success && response.data) {
        setFormState(prev => ({ ...prev, currentStatus: response.data!.data }))
      }
    } catch (error) {
      console.error(error);
    }
  }, [setFormState])

  // 記錄競標
  const recordBid = useCallback(async (request: IRecordBidRequest) => {
    try {
      setBlocking(true)
      const response = await postData<ICommonResult<IRecordBidResponse>>(`/api/LiveAuction/record-bid`, request)

      if (response.success && response.data) {
        Swal.fire('成功!', `已記錄 ${response.data.paddleName} (${response.data.paddleNum}) 的出價 $${response.data.bidAmount.toLocaleString()}`, 'success')
        // 重新載入狀態
        await loadItemStatus(request.itemId)
      } else {
        Swal.fire('Error!', response.message || '記錄失敗', 'error')
      }
    } catch (error) {
      console.error(error);
      if (error instanceof ResponseError)
        Swal.fire('Error!', error.message, 'error')
      else
        Swal.fire('Exception!', "出現意外的錯誤，請聯繫系統與工程師。" + error, 'error')
    } finally {
      await delayPromise(500)
      setBlocking(false)
    }
  }, [setFormState, setBlocking, loadItemStatus])

  // 結標處理
  const hammerItem = useCallback(async (itemId: string) => {
    try {
      const confirm = await Swal.fire({
        title: '確認結標?',
        text: '此操作無法撤銷',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '確認結標',
        cancelButtonText: '取消'
      })

      if (!confirm.isConfirmed) return

      setBlocking(true)
      const response = await postData<ICommonResult<IHammerResponse>>(`/api/LiveAuction/hammer`, { itemId })

      if (response.success && response.data) {
        Swal.fire({
          title: '結標成功!',
          html: `
            <div style="text-align: left; padding: 10px;">
              <p><strong>得標者:</strong> ${response.data.winnerName} (${response.data.winnerPaddleNum})</p>
              <p><strong>落槌價:</strong> $${response.data.hammerPrice.toLocaleString()}</p>
            </div>
          `,
          icon: 'success'
        })
        await loadItemList()
        setFormState(prev => ({ ...prev, mode: 'List', selectedItem: null }))
      } else {
        Swal.fire('Error!', response.message || '結標失敗', 'error')
      }
    } catch (error) {
      console.error(error);
      if (error instanceof ResponseError)
        Swal.fire('Error!', error.message, 'error')
      else
        Swal.fire('Exception!', "出現意外的錯誤,請聯繫系統與工程師。" + error, 'error')
    } finally {
      await delayPromise(500)
      setBlocking(false)
    }
  }, [setFormState, setBlocking, loadItemList])

  // 流標處理
  const passItem = useCallback(async (itemId: string, passedReason: string, notes: string) => {
    try {
      const confirm = await Swal.fire({
        title: '確認流標?',
        text: '此操作無法撤銷',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '確認流標',
        cancelButtonText: '取消'
      })

      if (!confirm.isConfirmed) return

      setBlocking(true)
      const response = await postData<ICommonResult<IPassResponse>>(`/api/LiveAuction/pass`, {
        itemId,
        passedReason,
        notes
      })

      if (response.success && response.data) {
        Swal.fire({
          title: '流標處理完成',
          html: `
            <div style="text-align: left; padding: 10px;">
              <p><strong>流標原因:</strong> ${response.data.passedReason === 'NoBids' ? '無人出價' : '未達底價'}</p>
              <p><strong>最高出價:</strong> $${response.data.highestBidAmount.toLocaleString()}</p>
            </div>
          `,
          icon: 'info'
        })
        await loadItemList()
        setFormState(prev => ({ ...prev, mode: 'List', selectedItem: null }))
      } else {
        Swal.fire('Error!', response.message || '流標處理失敗', 'error')
      }
    } catch (error) {
      console.error(error);
      if (error instanceof ResponseError)
        Swal.fire('Error!', error.message, 'error')
      else
        Swal.fire('Exception!', "出現意外的錯誤，請聯繫系統與工程師。" + error, 'error')
    } finally {
      await delayPromise(500)
      setBlocking(false)
    }
  }, [setFormState, setBlocking, loadItemList])

  return useMemo(() =>
    ({ loadItemList, loadItemStatus, recordBid, hammerItem, passItem }),
    [loadItemList, loadItemStatus, recordBid, hammerItem, passItem]);
}
