import { useMemo } from 'react';
import { FormControl, OutlinedInput, useEventCallback } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function BidIncSetupWidget(props: {
  liveSt: ILiveAuctionStatus,
}) {
  const { liveSt } = props

  const handleSubmit = useEventCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const bidInc = Number(formData.get('bidInc'));

    if (!bidInc || bidInc < 1000 || bidInc % 1000 !== 0) {
      Swal.fire('請輸入 1000 的倍數，且不得低於 1000');
      return;
    }

    // ✅ 送出表單資料到後端
    try {
      const response = await axios.post('/api/Auction/SetBidIncrement', formData);
      console.log('送出成功:', response.data);
      // 可以加上成功提示或清空表單
    } catch (err) {
      console.error(err);
      Swal.fire('送出過程發生錯誤，請稍後再試');
    }
  });

  const defaultValue = useMemo(() => (
    liveSt.bidIncrement === 0 ? 3000 : liveSt.bidIncrement
  ), [])

  return (
    <form noValidate autoComplete="off" style={{ display: 'inline-flex' }}
      method='POST'
      onSubmit={handleSubmit}
    >
      <FormControl>
        <OutlinedInput type='number'
          name='bidInc'
          placeholder="一刀增額"
          defaultValue={defaultValue}
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