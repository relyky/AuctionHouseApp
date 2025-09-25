import { Container } from "@mui/material";
import RaffleStatisticsPanel from "./RaffleStatisticsPanel";

/**
 * 後台-抽獎券銷售統計
 */
export default function RaffleSellQuery_AppForm() {
  return (
    <Container maxWidth='xs'>
      {/* 抽獎券銷售統計 */}
      <RaffleStatisticsPanel />


    </Container>
  )
}
