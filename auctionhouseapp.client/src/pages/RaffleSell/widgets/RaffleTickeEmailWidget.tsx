import { useEffect, useState } from 'react';
import { Alert, Box, Button, LinearProgress, Stack } from '@mui/material';
import { postData, ResponseError } from '../../../tools/httpHelper';
import RaffleTicketCardWidget from './RaffleTicketCardWidget';
import { useEventCallback } from 'usehooks-ts';
import type { ISendNoteEmailResult } from '../dto/ISendNoteEmailResult';
import { delayPromise } from '../../../tools/utils';
import Swal from 'sweetalert2';

export default function RaffleTickeEmailWidget(props: {
  raffleOrderNo: string
  afterSendEmail: (emailTimes: number) => void
}) {
  const [ticketList, setTicketList] = useState<IRaffleTicket[]>([])
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [emailTimes, setEmailTimes] = useState<number>(0)

  //# 一進入就取出訂單下的抽獎券清單
  useEffect(() => {
    setLoading(true)
    setErrMsg(null)
    postData<IRaffleTicket[]>(`/api/RaffleSell/LoadRaffleTicket/${props.raffleOrderNo}`)
      .then((newTicketList) => {
        setTicketList(newTicketList)
        setEmailTimes(newTicketList[0]?.emailTimes ?? 0)
      }).catch(error => {
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

  const handleSendNoteEmail = useEventCallback(async () => {
    try {
      setLoading(true)
      setErrMsg(null)

      const result = await postData<ISendNoteEmailResult>(`/api/RaffleSell/SendNoteEmail/${props.raffleOrderNo}`)
      await delayPromise(800); // 增強UX

      // SUCCESS: 更新寄信次數
      setEmailTimes(result.emailTimes)
      props.afterSendEmail(result.emailTimes)
    }
    catch (error) {
      if (error instanceof ResponseError) {
        console.error('handleSubmit ResponseError', error.message);
        setErrMsg(error.message)
        Swal.fire('執行失敗！', error.message, 'error')
      }
      else {
        console.error('handleSubmit error', { error });
        setErrMsg("出現預期之外的錯誤請通知系統工程師。" + error);
      }
    }
    finally {
      setLoading(false)
    }
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
        <Button variant={emailTimes > 0 ? 'outlined' : 'contained'} fullWidth sx={{ my: 2 }}
          loading={f_loading}
          onClick={handleSendNoteEmail}>
          寄出抽獎券<small>(已寄出{emailTimes}次)</small></Button>
      }

      {/* import.meta.env.DEV &&
        <pre>setTicketList: {JSON.stringify(ticketList, null, 2)}</pre>
      */}
    </Box>
  );
};
