import { Box, Button, ButtonGroup, FormControlLabel, Paper, Switch, Typography, useEventCallback } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { postData } from "../../tools/httpHelper";
import { givePrizeProfileAtom } from "./atom";
import { useAtomValue } from "jotai";
import type { IGivePrizeProfile } from "../../dto/display/IGivePrizeProfile";

export default function GiveToWinPanel(props: {
  activity: ActivityEnum
}) {
  const givePrizeList = useAtomValue(givePrizeProfileAtom)
  const [mode, setMode] = useState<DisplayMode>('give')
  const [foolproof, setFoolproff] = useState(false)

  // 福袋獎品實際上只有一筆。一開始就取。
  const prize = useMemo<IGivePrizeProfile | null>(() => {
    return Array.isArray(givePrizeList) && givePrizeList.length > 0
      ? givePrizeList[0]
      : null;
  }, [givePrizeList])

  const handleDisplay = useEventCallback((mode: DisplayMode) => {
    postData(`/api/Site/SwitchDisplay/${mode}/${prize?.giftId ?? ''}`)
      .then((msg) => {
        console.log(msg)
        setMode(mode)
      })
      .catch(console.log)
  })

  /* 活動類別切換時觸發 */
  useEffect(() => {
    if (props.activity === 'give') {
      handleDisplay('give')
    }
  }, [props.activity])

  // hidden
  if (props.activity !== 'give') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >2. Give to Win Control Panel</Typography>

      <Box sx={{ m: 3 }}>
        <ButtonGroup fullWidth>
          <Button sx={{ flexDirection: 'column' }}
            variant={mode === 'give' ? 'contained' : 'outlined'}
            onClick={_ => handleDisplay('give')}>
            <span>Prize Display</span><span>(獎品展示)</span>
          </Button>

          <Button sx={{ flexDirection: 'column' }}
            variant={mode === 'giveDrawing' ? 'contained' : 'outlined'}
            disabled={!prize || !foolproof}
            onClick={_ => handleDisplay('giveDrawing')}>
            <span>Drawing</span><span>(進行抽獎)</span>
          </Button>

        </ButtonGroup>
        <Box sx={{ textAlign: 'right', my: 3 }}>
          {/* 防呆: 防止手殘按下抽獎 */}
          <FormControlLabel label="Fool-proof"
            control={<Switch checked={foolproof} onChange={(_, chk) => setFoolproff(chk)} />} />
        </Box>
      </Box>

    </Paper>
  )
}