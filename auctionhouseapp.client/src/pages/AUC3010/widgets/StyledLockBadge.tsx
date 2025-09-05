import type { ReactNode } from 'react';
import { Badge } from "@mui/material";
// icons
import LockIcon from '@mui/icons-material/Lock';

export default function StyledLockBadge(props: {
  children: ReactNode
  isLocked: boolean
}) {
  return (
    <Badge invisible={!props.isLocked} badgeContent={<LockIcon color='error' fontSize='large' />}
      sx={{
        '& .MuiBadge-badge': {
          top: 20,
          right: 20,
        }
      }}
    >
      {props.children}
    </Badge >
  )
}