import type { FC } from 'react'
import { MenuItem, Select } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

const ColorSwitcher: FC = () => {
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }
  return (
    <Select
      value={mode}
      onChange={(event) =>
        setMode(event.target.value as 'system' | 'light' | 'dark')
      }
      sx={{ minWidth: 120 }}
    >
      <MenuItem value="system">System</MenuItem>
      <MenuItem value="light">Light</MenuItem>
      <MenuItem value="dark">Dark</MenuItem>
    </Select>
  );
}

export { ColorSwitcher }