import { useAtomValue } from "jotai";
import { closingPaymentAtom } from "./atom";
import EditView from "./EditView";
import ListView from "./ListView";

/**
 * 結帳項目註記
 * 在訂單畫面上針對未付費項目勾選並加總金額。在客人付費後註記『已付費』。已付費項目顯示在另一區。
 */
export default function ClosingPayment() {
  const { mode } = useAtomValue(closingPaymentAtom);

  return (
    <>
      {mode === 'Edit' && <EditView />}
      <ListView />
    </>
  );
}
