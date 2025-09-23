import { Button, ButtonGroup, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography, useEventCallback } from "@mui/material";
import { useState } from "react";
import { postData } from "../../tools/httpHelper";

export default function RaffleTicketPanel(props: {
  activity: ActivityEnum
}) {
  const [mode, setMode] = useState<DisplayMode>('raffleWinnersCarousel')
  const [prizeId, setPrizeId] = useState<string | null>(null)

  const handleDisplay = useEventCallback((mode: DisplayMode) => {
    postData(`/api/Site/SwitchDisplay/${mode}/${prizeId}`)
      .then((msg) => {
        console.log(msg)
        setMode(mode)
      })
      .catch(console.log)
  })

  // hidden
  if (props.activity !== 'raffle') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' gutterBottom>1. Raffle Ticket 控制平板</Typography>

      <Stack gap={2} sx={{ m: 3 }} >
        <FormControl fullWidth>
          <InputLabel>prize</InputLabel>
          <Select
            label='prize'
            value={prizeId}
            onChange={e => setPrizeId(e.target.value)}
          >
            <MenuItem value={'P10'}>Ten</MenuItem>
            <MenuItem value={'P20'}>Twenty</MenuItem>
            <MenuItem value={'P30'}>Thirty</MenuItem>
          </Select>
        </FormControl>

        <ButtonGroup fullWidth>
          <Button variant={mode === 'raffleWinnersCarousel' ? 'contained' : 'outlined'}
            onClick={_ => handleDisplay('raffleWinnersCarousel')}>
            得獎名單(Winners Carousel)</Button>

          <Button variant={mode === 'rafflePrizeDisplay' ? 'contained' : 'outlined'}
            onClick={_ => handleDisplay('rafflePrizeDisplay')}>
            獎品展示(Prize Display)</Button>

          <Button variant={mode === 'raffleDrawing' ? 'contained' : 'outlined'}
            onClick={_ => handleDisplay('raffleDrawing')}>
            進行抽獎(Drawing)</Button>

        </ButtonGroup>
      </Stack>


    </Paper>
  )
}