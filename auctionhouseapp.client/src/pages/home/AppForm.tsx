import Swal from "sweetalert2";
import { useAtom } from 'jotai';
import { counterAtom } from '../../atoms/metaAtom';
import { Box, Button, Container, Typography } from "@mui/material";
//import SendIcon from '@mui/icons-material/Send';

export default function Home_AppForm() {
  const [count, setCount] = useAtom(counterAtom);

  return (
    <Container>
      <Typography variant='h3' gutterBottom>這是首頁</Typography>

      <Button onClick={() => Swal.fire('go')}>Call Swal</Button>

      <Box typography='h1'>{count}</Box>
      <Button onClick={handleClick}>送出</Button>    
    </Container>
  )

  function handleClick() {
    setCount(prev => prev + 1)
  }
}
