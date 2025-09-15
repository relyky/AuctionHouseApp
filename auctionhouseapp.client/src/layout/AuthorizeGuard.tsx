import { useAtomValue } from "jotai"
import { selectAuthed, staffAccountAtom } from "../atoms/staffAccountAtom"

export default function AuthorizeGuard(props: {
  role: string
  children: React.ReactNode
}) {
  const { children, role } = props
  const isAuthed = useAtomValue(selectAuthed)
  const acct = useAtomValue(staffAccountAtom)

  if (!isAuthed) return (<></>);

  if (acct.roleList.indexOf(role as any) < 0) return (<></>);

  return (children)
}