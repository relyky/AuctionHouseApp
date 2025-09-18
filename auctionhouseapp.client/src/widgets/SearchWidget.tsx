/**
 * A reusable search input widget with a help popover.
 *
 * @param {SearchWidgetProps} props - The props for the component.
 * @returns {JSX.Element} The rendered search widget.
 *
 * @example
 * // Basic usage in a parent component
 *
 * import SearchWidget from './SearchWidget';
 * import { Typography } from '@mui/material';
 *
 * function MyComponent() {
 *   const handleSearch = (value) => {
 *     console.log('Searching for:', value);
 *   };
 *
 *   const helpContent = (
 *     <>
 *       <Typography>This is the first line of help.</Typography>
 *       <Typography>This is the second line.</Typography>
 *     </>
 *   );
 *
 *   return (
 *     <SearchWidget
 *       placeholder="Search for items..."
 *       helpText={helpContent}
 *       onSearch={handleSearch}
 *     />
 *   );
 * }
 */

import { useState } from 'react';
import { IconButton, InputAdornment, OutlinedInput, styled, Typography, Popover, Box } from "@mui/material";
// icons
import SearchIcon from '@mui/icons-material/Search';
import HelpIcon from '@mui/icons-material/HelpOutline';

interface SearchWidgetProps {
  placeholder?: string;
  helpTitle?: string;
  helpText?: React.ReactNode;
  onSearch: (value: string) => void;
}

export default function SearchWidget({ placeholder, helpTitle, helpText, onSearch }: SearchWidgetProps) {
  const [value, setValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleHelpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHelpClose = () => {
    setAnchorEl(null);
  };

  const handleSearchClick = () => {
    onSearch(value);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'help-popover' : undefined;

  return (
    <>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleHelpClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2 }}> {/* maxWidth: 300 */}
          {helpTitle && <Typography variant="h6" gutterBottom>{helpTitle}</Typography>}
          {helpText}
        </Box>
      </Popover>

      <StyledSearchInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
        placeholder={placeholder}
        endAdornment={
          <InputAdornment position="end">
            <IconButton size="large" onClick={handleSearchClick}>
              <SearchIcon color='primary' />
            </IconButton>
            {Boolean(helpText) &&
              <IconButton size="small" onClick={handleHelpClick}>
                <HelpIcon color='disabled' />
              </IconButton>}
          </InputAdornment>
        }
      />
    </>
  );
}

//------
const StyledSearchInput = styled(OutlinedInput)(({ theme }) => ({
  width: '100%',
  'label + &': {
    marginTop: theme.spacing(3),
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderRadius: '50px',
  },
  '& .MuiOutlinedInput-input': {
    paddingLeft: '25px',
    paddingRight: '25px'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderRadius: '50px',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderRadius: '50px',
  },
}));
