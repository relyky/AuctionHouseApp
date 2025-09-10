import { useTheme } from '@mui/material/styles';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
// resource
import mediaImage from '../../../assets/images/live-from-space.jpg';

/**
 * 專門顯示抽獎券
 * ref: https://mui.com/material-ui/react-card/#media
 */
export default function RaffleTicketCardWidget(props: {
  ticket: IRaffleTicket
}) {
  const { ticket } = props
  const theme = useTheme();

  return (
    <Card sx={{ display: 'flex' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h6">
            拍賣活動抽獎券
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
            NO. {ticket.raffleTicketNo}
          </Typography>
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              票券擁有人
            </Typography>
            <Box typography='body2' color='text.secondary'>😀 {ticket.buyerName}</Box>
            <Box typography='body2' color='text.secondary'>📧 {ticket.buyerEmail}</Box>
            <Box typography='body2' color='text.secondary'>☎️ {ticket.buyerPhone}</Box>
          </Box>
        </CardContent>
      </Box>
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image={mediaImage}
        alt="album cover"
      />
    </Card>
  );
}