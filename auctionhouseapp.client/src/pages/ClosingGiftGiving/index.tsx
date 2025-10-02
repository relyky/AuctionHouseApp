import { Box, Container, Typography } from "@mui/material";

/**
 * 禮品清冊
 * 情境：活動尾聲，貴賓付費完後現場領取禮品。
 * 可列印成紙本讓工作人員發送已付費禮品。
 */
export default function ClosingGiftGiving() {
  return (
    <Container>
      <Typography variant='h5' gutterBottom>禮品清冊</Typography>
      <Box typography='body2' color='text.secondary'>在訂單畫面上針對未付費項目勾選並加總金額。在客人付費後註記『已付費』。已付費項目顯示在另一區。</Box>

    </Container>
  );
}
