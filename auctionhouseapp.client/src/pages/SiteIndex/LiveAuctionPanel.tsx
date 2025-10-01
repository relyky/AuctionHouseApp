import { Autocomplete, Box, Paper, TextField, Typography, Alert, useEventCallback } from "@mui/material";
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import type { IAuctionPrizeProfile } from '../../dto/display/IAuctionPrizeProfile';
import { auctionPrizeProfileAtom } from './atom';
import { postData } from "../../tools/httpHelper";

export default function LiveAuctionPanel(props: {
  activity: ActivityEnum
}) {
  const auctionPrizeList = useAtomValue(auctionPrizeProfileAtom)
  const [prize, setPrize] = useState<IAuctionPrizeProfile | null>(null)

  const handleChangePrize = useEventCallback((prize: IAuctionPrizeProfile | null) => {
    postData(`/api/Site/SwitchDisplay/liveAuction/${prize?.itemId ?? ''}`)
      .then((msg) => {
        console.log(msg)
        setPrize(prize)
      })
      .catch(console.log)
  })

  /* 活動類別切換時觸發 */
  useEffect(() => {
    if (props.activity === 'liveAuction') {
      handleChangePrize(prize)
    }
  },[props.activity])

  // hidden
  if (props.activity !== 'liveAuction') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >3. Live Auction 控制平板</Typography>

      <Box sx={{ m: 3 }}>
        {/* 選擇拍品 */}
        <Autocomplete fullWidth disablePortal disableClearable
          options={auctionPrizeList}
          value={prize!}
          onChange={(_, v) => handleChangePrize(v)}
          getOptionLabel={item => `${item.itemId}.${item.name}`}
          renderInput={(params) =>
            <TextField {...params} placeholder="Select Auction Item" />}
        />
      </Box>

      {prize && <Alert>Edit Auction</Alert>}

    </Paper>
  )
}