import { useAtomValue } from "jotai";
import { giveUnitPriceAtom } from "./atom";
import { Container, Typography } from "@mui/material";

function Step1View() {
  const giveUnitPrice = useAtomValue(giveUnitPriceAtom) // 抽獎券單價


  return (
    <Container maxWidth='xs'>
      {/* 銷售福袋抽獎券 */}
      <Typography variant='h5'>銷售福袋抽獎券</Typography>

      <pre>giveUnitPrice: {giveUnitPrice }</pre>
    </Container>
  );
}

export default Step1View;