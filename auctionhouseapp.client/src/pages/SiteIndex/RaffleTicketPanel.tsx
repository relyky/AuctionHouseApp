import { Autocomplete, Button, ButtonGroup, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography, useEventCallback, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { postData } from "../../tools/httpHelper";
import { useAtomValue } from "jotai";
import { rafflePrizeProfileAtom } from "./atom";
import type { IRafflePrizeProfile } from '../../dto/display/IRafflePrizeProfile'

export default function RaffleTicketPanel(props: {
  activity: ActivityEnum
}) {
  const rafflePrizeList = useAtomValue(rafflePrizeProfileAtom)
  const [mode, setMode] = useState<DisplayMode>('raffleWinnersCarousel')
  const [prize, setPrize] = useState<IRafflePrizeProfile | null>(null)

  const handleDisplay = useEventCallback((mode: DisplayMode) => {
    postData(`/api/Site/SwitchDisplay/${mode}/${prize?.prizeId}`)
      .then((msg) => {
        console.log(msg)
        setMode(mode)
      })
      .catch(console.log)
  })

  useEffect(() => {
    // 活動一變就回到滾輪模式
    setMode('raffleWinnersCarousel')
  }, [props.activity])

  // hidden
  if (props.activity !== 'raffle') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' gutterBottom>1. Raffle Ticket 控制平板</Typography>

      <Stack gap={2} sx={{ m: 3 }} >

        <Autocomplete fullWidth disablePortal disableClearable
          options={rafflePrizeList}
          value={prize!}
          onChange={(_, v) => setPrize(v)}
          getOptionLabel={item => `${item.prizeId}.${item.name}`}
          renderInput={(params) => <TextField {...params} label="Raffle Prize" />}
        />

        <ButtonGroup fullWidth>
          <Button variant={mode === 'raffleWinnersCarousel' ? 'contained' : 'outlined'}
            onClick={_ => handleDisplay('raffleWinnersCarousel')}>
            得獎名單(Winners Carousel)</Button>

          <Button variant={mode === 'rafflePrizeDisplay' ? 'contained' : 'outlined'}
            disabled={!prize}
            onClick={_ => handleDisplay('rafflePrizeDisplay')}>
            獎品展示(Prize Display)</Button>

          <Button variant={mode === 'raffleDrawing' ? 'contained' : 'outlined'}
            disabled={!prize}
            onClick={_ => handleDisplay('raffleDrawing')}>
            進行抽獎(Drawing)</Button>

        </ButtonGroup>
      </Stack>


    </Paper>
  )
}