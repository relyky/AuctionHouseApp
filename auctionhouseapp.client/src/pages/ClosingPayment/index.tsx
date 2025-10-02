import { Box, Container, Typography } from "@mui/material";

/**
 * 結帳項目註記
 * 在訂單畫面上針對未付費項目勾選並加總金額。在客人付費後註記『已付費』。已付費項目顯示在另一區。
 */
export default function ClosingPayment() {
  return (
    <Container>
      <Typography variant='h5' gutterBottom>結帳項目註記</Typography>
      <Box typography='body2' color='text.secondary'>在訂單畫面上針對未付費項目勾選並加總金額。在客人付費後註記『已付費』。已付費項目顯示在另一區。</Box>
     
    </Container>
  );
}
