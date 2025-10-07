import type { AlertColor, SnackbarCloseReason } from '@mui/material';
import { Alert, IconButton, Snackbar, Slide } from '@mui/material';
import type { SlideProps } from '@mui/material/Slide';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
// icons
import CloseIcon from '@mui/icons-material/Close';

interface SnackbarMessage {
  severity: AlertColor;
  message: string;
  key: number;
}

// This type defines the functions that will be exposed via the ref.
export interface ConsecutiveSnackbarRef {
  showSnackbar: (message: string, severity: AlertColor) => void;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction={props.in ? "up" : "down"} />;
}

// Wrap the component with forwardRef to receive the ref.
const ConsecutiveSnackbar = forwardRef<ConsecutiveSnackbarRef>((_props, ref) => {
  const [snackPack, setSnackPack] = useState<readonly SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined);

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      // Close an active snack when a new one is added
      setOpen(false);
    }
  }, [snackPack, messageInfo, open]);

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackPack((prev) => [
      ...prev,
      { message, severity, key: new Date().getTime() },
    ]);
  };

  // Expose the showSnackbar function via the ref.
  useImperativeHandle(ref, () => ({
    showSnackbar,
  }));

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  return (
    <Snackbar
      key={messageInfo ? messageInfo.key : undefined}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      slots={{ transition: SlideTransition }}
      slotProps={{
        transition: {
          onExited: handleExited
        }
      }}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          sx={{ p: 0.5 }}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      }
    >
      <Alert
        onClose={handleClose}
        severity={messageInfo?.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {messageInfo ? messageInfo.message : undefined}
      </Alert>
    </Snackbar>
  );
});

export default ConsecutiveSnackbar;

