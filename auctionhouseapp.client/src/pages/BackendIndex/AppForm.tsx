import { NavLink } from "react-router";
import { Alert, Button, Container, Link, Typography } from "@mui/material";

export default function BackendIndex_AppForm() {

  return (
    <Container>
      <Alert severity='error'>
        未登入請先登入。
        <Link href='/stafflogin'>工作人員登入</Link>
      </Alert>

      <Typography variant='h3' gutterBottom>hi {`員工名稱`} 歡迎回來</Typography>

      <Typography variant='h6' gutterBottom>業務</Typography>
      <Button component={NavLink} to='/raffle/sell'>銷售抽獎券</Button>
      <Button component={NavLink} to='/raffle/sellquery'>銷售查詢</Button>

      <Typography variant='h6' gutterBottom>後台</Typography>
      <Button component={NavLink} to='/backend/rafflecheck'>抽獎券銷售收費檢查</Button>
      <Button component={NavLink} to='/backend/rafflequery'>抽獎券銷售查詢</Button>

    </Container>
  )
}
