import { Box, Grid, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { postData } from '../../../tools/httpHelper';
import { formatDateString } from '../../../tools/utils';
import AGridField from '../../../widgets/AGridField';
import type { IStaffProfile } from '../../RaffleSell/dto/IStaffProfile';

export default function RaffleOrderTableWidget(props: {
  order: IRaffleOrder
}) {
  const { order } = props;
  const [sales, setSales] = useState<IStaffProfile | null>(null);

  useEffect(() => {
    postData<IStaffProfile>(`/api/RaffleSell/GetStaffProfile/${order.salesId}`)
      .then(data => setSales(data))
      .catch(console.error);
  }, [order])

  return (
    <Paper sx={{ mb: 2, p: 2 }}>
      <Box typography='h6' borderBottom='solid 1px #ddd'>Order No. {order.raffleOrderNo}</Box>

      <Grid container spacing={1}>
        {/* 買家名稱 */}
        <AGridField label="Buyer Name" value={order.buyerName} size={12} />
        {/* 聯絡電話 */}
        <AGridField label="Phone Number" value={order.buyerPhone} size={5} />
        {/* 電郵地址 */}
        <AGridField label="Email Address" value={order.buyerEmail} size={7} />
        {/* 購買張數 */}
        <AGridField label="Quantity" value={order.purchaseCount} size={5} />
        {/* 購買金額 */}
        <AGridField label="Total Amount" value={order.purchaseAmount} size={7} />

        {/* <AStaticField label="是否已付款" value={order.hasPaid === 'Y' ? '是' : '否'} size={6} />
      <AStaticField label="訂單狀態" value={order.status} size={6} /> */}

        {/* 負責業務 */}
        <AGridField label="Sales" value={sales?.nickname ?? order.salesId} size={5} />
        {/* 賣出時間 */}
        <AGridField label="Sales Time" value={formatDateString(order.soldDtm)} size={7} />
      </Grid>

    </Paper>
  )
}
