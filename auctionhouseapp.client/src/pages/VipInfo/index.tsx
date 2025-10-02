import { Box, Container, Typography } from "@mui/material";

/**
 * 貴賓基本資料維護(應該不會新增吧？)
 * 情境：來賓買多張入場券但朋友現場才定。人名也可以改。
 */
export default function VipInfo() {
  return (
    <Container>
      <Typography variant='h5' gutterBottom>貴賓基本資料維護</Typography>
      <Box typography='body2' color='text.secondary'>情境：來賓買多張入場券但朋友現場才定。人名也可以改。</Box>

    </Container>
  );
}
