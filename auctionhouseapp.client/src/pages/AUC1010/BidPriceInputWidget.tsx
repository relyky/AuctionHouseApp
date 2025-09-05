import { useEffect, useMemo, useState } from 'react'
import { Box, Button, ButtonGroup, OutlinedInput, useEventCallback } from '@mui/material';

export default function BidPriceInputWidget(props: {
  lastBidMsg: IBidMsg | null
  liveSt: ILiveAuctionStatus
  disabled: boolean // 可否出價
  onChange: (userBidPrice: number) => void
}) {
  const { liveSt, disabled, lastBidMsg } = props
  const [userBidPrice, setUserBidPrice] = useState<number>(0)

  const handleIncrease = useEventCallback((incN: number) => {
    setUserBidPrice(prev => prev + liveSt.bidIncrement * incN)
  })

  const handleDecrease = useEventCallback((incN: number) => {
    setUserBidPrice(prev => prev - liveSt.bidIncrement * incN)
  })

  const disabledD1 = useMemo(() => (
    userBidPrice - liveSt.bidIncrement < liveSt.curBidPrice
  ), [userBidPrice, liveSt])

  const disabledD5 = useMemo(() => (
    userBidPrice - liveSt.bidIncrement * 5 < liveSt.curBidPrice
  ), [userBidPrice, liveSt])

  useEffect(() => {
    console.log('BidPriceInputWidget.useEffect', { liveSt, lastBidMsg })
    if (liveSt.step === 'Step3_Bidding') {
      if (lastBidMsg && lastBidMsg.lotNo === liveSt.curLotNo)
        setUserBidPrice(lastBidMsg.bidPrice) //# 畫面刷新時保留上次出價金額。
      else
        setUserBidPrice(liveSt.curBidPrice)
    }
  }, [liveSt.step, liveSt.bidOpenSn])

  // 通知外面競價金額已改變
  useEffect(() => {
    props.onChange(userBidPrice)
  }, [userBidPrice])

  return (
    <Box textAlign='center' mb={1}>
      <OutlinedInput type='number'
        name='userBidPrice'
        placeholder="競價金額"
        value={userBidPrice}
        readOnly
        sx={{ mb: 1, width: '100%' }}
        inputProps={{
          style: { textAlign: 'center', fontSize: '2em', padding: '8px' },
          min: 1000,
          step: 1000,
        }}
      />

      <ButtonGroup variant="outlined" size='large' fullWidth>
        <Button onClick={() => handleDecrease(5)} disabled={disabled || disabledD5} >-5</Button>
        <Button onClick={() => handleDecrease(1)} disabled={disabled || disabledD1}>-1</Button>
        <Button onClick={() => handleIncrease(1)} disabled={disabled}>+1</Button>
        <Button onClick={() => handleIncrease(5)} disabled={disabled}>+5</Button>
      </ButtonGroup>
    </Box>
  )
}
