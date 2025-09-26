import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { Box, Button, Container, Divider, LinearProgress, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { counterAtom } from '../../atoms/metaAtom';
import { delayPromise } from '../../tools/utils';
import { toast } from 'react-toastify';
import axios from 'axios';
import useDataStream from './useDataStream';
import Swal from 'sweetalert2';
import TableWidget from './TableWidget';
import CommandPanel from './CommandPanel';
import CustomButtonLab from './CustomButtonLab';
import CountUpLab from './CountUpLab';
import QrCodeWidget from '../../widgets/QrCodeWidget';
import type { IWeatherForecast } from '../../dto/IWeatherForecast';
// Material-UI icons
import StartIcon from '@mui/icons-material/NotStarted';
import RefreshIcon from '@mui/icons-material/Refresh';
import UsePostDataLab from './UsePostDataLab';
import TestSendEmail from './TestSendEmail';
import PalettePanel from './PalettePanel';
import DataListLab from './DataListLab';

export default function Demo01_AppForm() {
  const counterValue = useAtomValue(counterAtom)
  const [forecasts, setForecasts] = useState<IWeatherForecast[]>([]);
  const [f_loading, setLoading] = useState<boolean>(false);
  const [toggleDataStream, f_starting, f_streaming] = useDataStream((forecast: IWeatherForecast) => {
    toast(`YES ${forecast.date} ${forecast.temperatureC}°C  ${forecast.temperatureF}°F ${forecast.summary}`)
  });

  return (
    <Container>
      <Typography variant='h3'>counterAtom: {counterValue}</Typography>
      <Divider />
      <DataListLab />

      <Divider />
      <TestSendEmail />

      <Divider />
      <PalettePanel />

      <Divider />
      <UsePostDataLab />

      <Divider />
      <CustomButtonLab />

      <Divider />
      <CommandPanel />

      <Divider />
      <QrCodeWidget value='https://www.asiavista.com.tw' style={{ width: 250 }} />

      <Divider />
      <CountUpLab />

      <Divider />

      <Box sx={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(3, 1fr)' }}>
        <Paper sx={{ p: 4 }}>1</Paper>
        <Paper sx={{ p: 4 }}>2</Paper>
        <Paper sx={{ p: 4 }}>3</Paper>
        <Paper sx={{ p: 4 }}>
          <QrCodeWidget value='https://www.asiavista.com.tw'
            imageSrc='vite.svg'
            bgColor='#FFF0F5' //（淡粉）
            fgColor='#C71585' //（梅紅）
            style={{ width: 250 }}
          />
        </Paper>
        <Paper sx={{ p: 4 }}>
          <QrCodeWidget value='https://www.asiavista.com.tw'
            imageSrc='vite.svg'
            bgColor='#FFF8E7' // 摩卡棕
            fgColor='#5C4B51' // 奶油米
            style={{ width: 250 }} />
        </Paper>
      </Box>

      <Divider />

      <Typography variant='h3'>Weather forecast</Typography>

      <Button onClick={qryDataList} disabled={f_loading}>刷新天氣預報</Button>

      <Button onClick={toggleDataStream} disabled={f_starting}
        startIcon={f_streaming ? <SpinningIcon /> : <StartIcon />}>
        {f_streaming ? '停止天氣預報串流' : '啟動天氣預報串流'}
      </Button>

      {f_loading && <LinearProgress color='info' />}
      <TableWidget forecasts={forecasts} />
    </Container>
  );

  async function qryDataList() {
    try {
      setLoading(true)
      const response = await axios.post<IWeatherForecast[]>('/api/WeatherForecast/QryDataList')
      await delayPromise(800);
      setForecasts(response.data);
    }
    catch (err) {
      if (err instanceof Error)
        Swal.fire('出現錯誤', err.message, 'error')
      else
        throw err;
    }
    finally {
      setLoading(false)
    }
  }


}

//-----------------------------------------------------------------------------
const SpinningIcon = styled(RefreshIcon)({
  animation: 'spin 1s linear infinite',
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
});

// 使用方式
// <SpinningIcon fontSize="large" color="primary" />