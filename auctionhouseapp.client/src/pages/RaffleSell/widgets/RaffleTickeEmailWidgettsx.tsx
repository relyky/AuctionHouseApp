import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, LinearProgress, Stack } from '@mui/material';
import { postData, ResponseError } from '../../../tools/httpHelper';
import RaffleTicketCardWidget from './RaffleTicketCardWidget';
import { useEventCallback } from 'usehooks-ts';

export default function RaffleTickeEmailWidget(props: {
  raffleOrderNo: string;
}) {
  const [ticketList, setTicketList] = useState<IRaffleTicket[]>([])
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  //# 一進入就取出訂單下的抽獎券清單
  useEffect(() => {
    setLoading(true)
    setErrMsg(null)
    postData<IRaffleTicket[]>(`/api/RaffleSell/LoadRaffleTicket/${props.raffleOrderNo}`)
      .then(setTicketList)
      .catch(error => {
        if (error instanceof ResponseError) {
          console.error('handleSubmit ResponseError', error.message);
          setErrMsg(error.message)
        }
        else {
          console.error('handleSubmit error', { error });
          setErrMsg("出現預期之外的錯誤請通知系統工程師。" + error);
        }
      }).finally(() => {
        setLoading(false)
      })
  }, [])

  const emailTimes = useMemo(() => {
    return ticketList[0]?.emailTimes ?? 0
  },[])

  const handleSendTicketEmail = useEventCallback(() => {
    alert('未實作')
  });

  return (
    <Box>
      {/*<Typography variant='h6'>抽獎券清單({props.raffleOrderNo})</Typography>*/}

      {f_loading && <LinearProgress color='info' />}

      {errMsg && <Alert severity='error' sx={{ m: 3 }} >{errMsg}</Alert>}

      <Stack gap={2}>
        {ticketList.map((ticket) => (
          <RaffleTicketCardWidget key={ticket.raffleTicketNo} ticket={ticket} />
        ))}
      </Stack>

      {ticketList.length > 0 &&
        <Button variant='contained' size='large' fullWidth sx={{ my: 2 }}
          onClick={handleSendTicketEmail}>
          寄出抽獎券<small>(已寄出{emailTimes}次)</small></Button>
      }

      {/* import.meta.env.DEV &&
        <pre>setTicketList: {JSON.stringify(ticketList, null, 2)}</pre>
      */}
    </Box>
  );
};
