import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Alert, Box, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material';

export type SnackbarWidgetHandle = {
  showToast: (message: string, severity: AlertColor) => void;
};

const SnackbarWidget = forwardRef<SnackbarWidgetHandle>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const showToast = useCallback((msg: string, sev: AlertColor) => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const handleClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    showToast,
  }));

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={severity} variant="filled" >
        <Box minWidth={220}>{message}</Box>
      </Alert>
    </Snackbar>
  );
});

export default SnackbarWidget;