import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
// resource
import mediaImage from '../../../assets/images/D86C6185-0411-40DD-97F8-CB080EC03B70-280x280.jpg';

export default function GiveTicketCardWidget(props: {
  ticket: IGiveTicket
}){
  const { ticket } = props

  return (
    <Card sx={{ display: 'flex' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          {/* 拍賣活動抽獎券 */}
          <Typography component="div" variant="h6">
            Gift Ticket
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
            NO. {ticket.giveTicketNo}
          </Typography>
          <Box>
            {/* 票券擁有人 */}
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Ticket Holder
            </Typography>
            <Box typography='body2' color='text.secondary' sx={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}>😀 {ticket.holderName}</Box>
            <Box typography='body2' color='text.secondary' sx={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}>#️⃣ {ticket.paddleNum}</Box>
          </Box>
        </CardContent>
      </Box>
      <CardMedia
        component="img"
        sx={{
          width: { xs: 90, sm: 180 },
          objectFit: 'cover',
          objectPosition: { xs: 'left', sm: 'center' }
        }}
        image={mediaImage}
        alt="album cover"
      />
    </Card>
  )
}