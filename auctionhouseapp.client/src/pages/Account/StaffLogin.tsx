/**
 * 工作人員登入
 * export default function StaffLogin()
 */

import { Box, Button, FormControl, FormLabel, Link, Stack, TextField, Typography } from '@mui/material';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useAtomValue } from 'jotai';
import type { FormEvent } from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { selectAuthed, selectAuthing, selectIsAuthedStaff, useStaffAccountAction } from '../../atoms/staffAccountAtom';
import type { ILoginArgs } from '../../dto/ILoginArgs';
import { postData } from '../../tools/httpHelper';

export default function SignIn() {
  const { loginAsync } = useStaffAccountAction()
  const navigate = useNavigate()
  const isAuthedStaff = useAtomValue(selectIsAuthedStaff);
  const isAuthed = useAtomValue(selectAuthed)
  const isAuthing = useAtomValue(selectAuthing)
  // GO
  const [userIdError, setUserIdError] = useState(false);
  const [userIdErrorMessage, setUserIdErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  useLayoutEffect(() => {
    postData('/api/Account/GetXsrfToken')
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (userIdError || passwordError) {
      //  event.preventDefault();
      return;
    }

    const data = new FormData(event.currentTarget)
    const loginArgs: ILoginArgs = {
      userId: data.get('userId') as string,
      mima: data.get('password') as string,
      vcode: '123456'
    };

    await loginAsync(loginArgs)
  };

  const validateInputs = () => {
    const userId = document.getElementById('userId') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!userId.value || !/\S+/.test(userId.value)) {
      setUserIdError(true);
      setUserIdErrorMessage('Please enter a valid user name.');
      isValid = false;
    } else {
      setUserIdError(false);
      setUserIdErrorMessage('');
    }

    if (!password.value || password.value.length < 4) {
      setPasswordError(true);
      setPasswordErrorMessage('Enter as least 4 characters.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  //# 成功後轉址到主畫面
  useEffect(() => {
    //console.log('isAuthed', { isAuthed, isAuthedStaff })
    if (isAuthedStaff) {
      navigate('/backend')
    } else if (isAuthed) {
      navigate('/');
    }
  }, [isAuthed, isAuthedStaff])

  return (
    <SignInContainer direction="column" justifyContent="space-between">
      <Card variant="outlined">
        {/* 工作人員登入 */}
        <Typography component="h1" variant="h5">
          Staff Login
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="userId">User name</FormLabel>
            <TextField
              error={userIdError}
              helperText={userIdErrorMessage}
              id="userId"
              type="text"
              name="userId"
              placeholder="User name"
              autoComplete="userId"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={userIdError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="********"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          /> */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={validateInputs}
            loading={isAuthing}
            disabled={isAuthed || isAuthing}
          >
            Log in
          </Button>
          <Link
            component="button"
            type="button"
            variant="body2"
            sx={{ alignSelf: 'center', display: 'none' }}
          >
            Forgot your password?
          </Link>
        </Box>
      </Card>

      {/*<pre>for debug:accountInfo: {JSON.stringify(accountInfo, null, 2)}</pre>*/}
    </SignInContainer>
  );
}

//-------------------------------------

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));
