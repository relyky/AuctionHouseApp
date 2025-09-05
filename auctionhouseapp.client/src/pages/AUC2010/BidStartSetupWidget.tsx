import { FormControl, OutlinedInput, useEventCallback } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import useAxios from 'axios-hooks';

/**
 * 起拍金額設定元件
 * @returns
 */
export default function BidStartSetupWidget(props: {
  liveSt: ILiveAuctionStatus,
}) {
  const { liveSt } = props
  const [{ data: lot, loading, error }] = useAxios<ILot>({
    url: `/api/Auction/GetLot/${liveSt.curLotNo}`,
    method: 'POST',
  });

  const handleSubmit = useEventCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const curBidPrice = Number(formData.get('curBidPrice'));

    if (!curBidPrice || curBidPrice < 1000 || curBidPrice % 1000 !== 0) {
      Swal.fire('請輸入 1000 的倍數，且不得低於 1000');
      return;
    }

    // ✅ 送出表單資料到後端
    try {
      const response = await axios.post('/api/Auction/SetCurBidPrice', formData);
      console.log('送出成功:', response.data);
      // 可以加上成功提示或清空表單
    } catch (err) {
      console.error(err);
      Swal.fire('送出過程發生錯誤，請稍後再試');
    }
  });

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <form noValidate autoComplete="off" style={{ display: 'inline-flex' }}
      method='POST'
      onSubmit={handleSubmit}
    >
      <FormControl>
        <OutlinedInput type='number'
          name='curBidPrice'
          placeholder="起拍金額"
          defaultValue={lot?.startPrice}
          inputProps={{
            style: { textAlign: 'center' },
            min: 1000,
            step: 1000,
          }}
        />
      </FormControl>
    </form>
  )
}