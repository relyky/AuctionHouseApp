import { Grid, Paper } from '@mui/material'
import { formatDateString } from '../../../tools/utils'
import AStaticField from '../../../widgets/AStaticField';

/**
 * A component to display the details of a raffle order in a table.
 * @param props The props for the component.
 * @returns A TableContainer component.
 */
export default function RaffleOrderTableWidget(props: {
  order: IRaffleOrder
}) {

  const { order } = props;

  return (
    <Grid container spacing={1} component={Paper} sx={{ mb: 2, p: 2 }}>
      <AStaticField label="訂單編號" value={order.raffleOrderNo} size={6} />
      <AStaticField label="買家名稱" value={order.buyerName} size={6} />
      <AStaticField label="聯絡電話" value={order.buyerPhone} size={6} />
      <AStaticField label="電郵地址" value={order.buyerEmail} size={6} />
      <AStaticField label="購買張數" value={order.purchaseCount} size={6} />
      <AStaticField label="購買金額" value={order.purchaseAmount} size={6} />
      <AStaticField label="是否已付款" value={order.hasPaid === 'Y' ? '是' : '否'} size={6} />
      <AStaticField label="訂單狀態" value={order.status} size={6} />
      <AStaticField label="負責業務" value={order.salesId} size={6} />
      <AStaticField label="賣出時間" value={formatDateString(order.soldDtm)} size={6} />
    </Grid>
  )
}