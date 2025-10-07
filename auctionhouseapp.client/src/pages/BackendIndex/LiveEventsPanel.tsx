import { Button, Divider, Grid, Paper, Typography } from "@mui/material";
import { NavLink } from "react-router";
import AuthorizeGuard from "../../layout/AuthorizeGuard";

export default function LiveEventsView() {
  return (
    <>
      <Divider sx={{ my: 3 }} />
      <Paper square sx={{ p: 2 }}>
        <Typography variant='h6' gutterBottom>現場活動</Typography>
        <Grid container spacing={2}>
          <AuthorizeGuard role='Admin'>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button component={NavLink} fullWidth variant='outlined' to='/site'>
                活動主控台(大螢幕切換)</Button>
            </Grid>
          </AuthorizeGuard>
          <AuthorizeGuard role='Admin'>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button component={NavLink} fullWidth variant='outlined' to='/site/auction'>
                Live Auction 競價輸入</Button>
            </Grid>
          </AuthorizeGuard>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button component={NavLink} fullWidth variant='outlined' to='/site/ask'>
              Open Ask 認捐輸入</Button>
          </Grid>
          <AuthorizeGuard role='Admin'>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button component={NavLink} fullWidth variant='outlined' to='/site/askfix'>
                Open Ask 認捐校正</Button>
            </Grid>
          </AuthorizeGuard>
          <AuthorizeGuard role='Admin'>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button component={NavLink} fullWidth variant='outlined' to='/site/silentqrcode'>
                Silent Auction Prizes QR Code</Button>
            </Grid>
          </AuthorizeGuard>
          <AuthorizeGuard role='Admin'>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button component={NavLink} fullWidth variant='outlined' to='/site/adminvip'>
                貴賓聯絡資料</Button>
            </Grid>
          </AuthorizeGuard>
        </Grid>
      </Paper>
    </>
  )
}