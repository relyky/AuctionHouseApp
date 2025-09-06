import { NavLink } from "react-router";
import { Alert, Button, Container, Typography } from "@mui/material";

export default function RaffleIndex_AppForm() {

  return (
    <Container>
      <Alert security='error'>
        未登入請先登入。
        <Button href='/stafflogin'>工作人員登入</Button>
      </Alert>

      <Typography variant='h3' gutterBottom>hi {`員工名稱`} 歡迎回來</Typography>

      <Typography variant='h6' gutterBottom>業務</Typography>
      <Button LinkComponent={NavLink} href='/raffle/sell'>銷售抽獎券</Button>
      <Button LinkComponent={NavLink} href='/raffle/sellquery '>銷售查詢</Button>

      <Typography variant='h6' gutterBottom>後台</Typography>
      <Button LinkComponent={NavLink} href='/backend/rafflecheck'>抽獎券銷售收費檢查</Button>
      <Button LinkComponent={NavLink} href='/backend/rafflequery'>抽獎券銷售查詢</Button>

    </Container>
  )
}
