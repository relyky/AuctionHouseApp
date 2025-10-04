import { useAtomValue } from "jotai";
import { adminVipAtom } from "./atom";
import AddView from "./AddView";
import EditView from "./EditView";
import ListView from "./ListView";

export default function index() {
  const { mode } = useAtomValue(adminVipAtom);

  return (
    <>
      {mode === 'Add' && <AddView /* Mount/Unmount */ />}
      {mode === 'Edit' && <EditView /* Mount/Unmount */ />}
      <ListView /* Show/Hide */ />
    </>
  );
}
