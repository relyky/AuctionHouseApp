import { Paper, Box, Button } from '@mui/material'
import { postData } from '../../tools/httpHelper'

export default function TestSendEmail() {
  return (
    <Box sx={{ p: 2, m: 2 }}>
      <Button onClick={() => {

        postData<MsgObj>('/api/WeatherForecast/TestSendEmail')
          .then(console.log)
          .catch(console.log)

      }}>TestSendEmail</Button>
    </Box>
  )
}
