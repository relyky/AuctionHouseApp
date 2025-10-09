import { Box, FormControlLabel, FormGroup, LinearProgress, Paper, Switch, Typography, useEventCallback } from "@mui/material";
import { useEffect, useState } from "react";
import { postData } from "../../tools/httpHelper";

export default function DonationPanel(props: {
  activity: ActivityEnum
}) {
  const [closingChecked, setClosingChecked] = useState<boolean>(false)
  const [checked, setChecked] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSwitch = useEventCallback((_, checked: boolean) => {
    setLoading(true)
    const onOff = checked ? 'on' : 'off'
    postData<MsgObj>(`/api/Site/DonationSwitch/${onOff}`)
      .then(msg => setChecked(msg.message === "on"))
      .catch(console.log)
      .finally(() => setLoading(false))
  });

  const handleClosingSwitch = useEventCallback((_, checked: boolean) => {
    setLoading(true)
    const onOff = checked ? 'on' : 'off'
    postData<MsgObj>(`/api/Site/EventClosingSwitch/${onOff}`)
      .then(msg => setClosingChecked(msg.message === "on"))
      .catch(console.log)
      .finally(() => setLoading(false))
  });

  useEffect(() => {
    setLoading(true)

    postData<MsgObj>('/api/Site/GetEventClosingSwitch')
      .then(msg => setClosingChecked(msg.message === "on"))
      .catch(console.log)

    postData<MsgObj>('/api/Site/GetDonationSwitch')
      .then(msg => setChecked(msg.message === "on"))
      .catch(console.log)
      .finally(() => setLoading(false))
  }, [])

  // hidden
  if (props.activity !== 'donation') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >6. Donation Control Panel</Typography>
      {/* <Box color='text.secondary'>📃 自動播放捐贈累計金額</Box> */}

      <FormGroup sx={{ m: 3 }}>
        <FormControlLabel
          control={<Switch checked={checked} onChange={handleSwitch} disabled={loading} />}
          label="Donation Switch (愛心捐款開關)" />
      </FormGroup>

      <FormGroup sx={{ m: 3 }}>
        <FormControlLabel
          control={<Switch checked={closingChecked} onChange={handleClosingSwitch} disabled={loading} />}
          label="Event Closing Switch (活動尾聲開關)" />
      </FormGroup>
    </Paper>
  )
}