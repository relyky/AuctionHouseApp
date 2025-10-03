import { Box, Button, ButtonGroup, FormControlLabel, Paper, Stack, Switch, Typography, useEventCallback } from "@mui/material";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { postData } from "../../tools/httpHelper";
import { rafflePrizeProfileAtom } from "./atom";

export default function RaffleTicketPanel(props: {
  activity: ActivityEnum
}) {
  const rafflePrizeList = useAtomValue(rafflePrizeProfileAtom)
  const [mode, setMode] = useState<DisplayMode>('raffleWinnersCarousel')
  const [foolproof, setFoolproff] = useState(false)

  const rafflePrizeTop3 = useMemo(() => {
    return rafflePrizeList.slice(0, 3).map((c) => c.prizeId).join(',')
  }, [rafflePrizeList])

  const handleDisplay = useEventCallback((mode: DisplayMode) => {
    postData(`/api/Site/SwitchDisplay/${mode}/${rafflePrizeTop3}`)
      .then((msg) => {
        console.log(msg)
        setMode(mode)
      })
      .catch(console.log)
  })

  const handleDrawMinor = useEventCallback(() => {
    alert('抽小獎');
  });

  useEffect(() => {
    // 活動一變就回到滾輪模式
    setMode('raffleWinnersCarousel')
  }, [props.activity])

  // hidden
  if (props.activity !== 'raffle') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' gutterBottom>1. Raffle Ticket Control Panel</Typography>

      <Stack gap={2} sx={{ m: 3 }} >
        <Box>
          三大獎編號：{rafflePrizeTop3}
        </Box>

        <ButtonGroup fullWidth>
          <Button sx={{ flexDirection: 'column' }}
            variant={mode === 'raffleWinnersCarousel' ? 'contained' : 'outlined'}
            onClick={_ => handleDisplay('raffleWinnersCarousel')}>
            <span>Winners Carousel</span><span>(得獎名單)</span></Button>

          <Button sx={{ flexDirection: 'column' }}
            variant={mode === 'rafflePrizeDisplay' ? 'contained' : 'outlined'}
            onClick={_ => handleDisplay('rafflePrizeDisplay')}>
            <span>Prize Display</span><span>(獎品展示)</span></Button>

          <Button sx={{ flexDirection: 'column' }}
            variant={mode === 'raffleDrawing' ? 'contained' : 'outlined'}
            disabled={!foolproof}
            onClick={_ => handleDisplay('raffleDrawing')}>
            <span>Drawing</span><span>(進行抽獎)</span></Button>

        </ButtonGroup>

        <Box display='flex' justifyContent='space-between' sx={{ my: 3 }}>
          <Button variant='contained' color='secondary'
            disabled={!foolproof}
            onClick={handleDrawMinor}>小獎抽獎</Button>

          {/* 防呆: 防止手殘按下抽獎 */}
          <FormControlLabel label="Fool-proof"
            control={<Switch checked={foolproof} onChange={(_, chk) => setFoolproff(chk)} />} />
        </Box>


      </Stack>

    </Paper>
  )
}