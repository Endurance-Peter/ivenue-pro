import { useState } from 'react';

import { AuthFormState, AuthMode } from '../auth.types';
import { isCodeValid, isPhoneValid } from '../auth.validation';
import { authApi } from '../../../lib/api';

const initialState: AuthFormState = {
  phone: '',
  code: '',
  step: 'phone',
  error: '',
  mode: 'signup',
};

export function useAuthFlow() {
  const [state, setState] = useState<AuthFormState>(initialState);

  const updatePhone = (phone: string) => {
    setState((current) => ({ ...current, phone, error: '' }));
  };

  const updateCode = (code: string) => {
    setState((current) => ({ ...current, code, error: '' }));
  };

  const continueToCode = async () => {
    if (!isPhoneValid(state.phone)) {
      setState((current) => ({ ...current, error: 'Enter a valid mobile number to continue.' }));
      return;
    }

    try {
      if (state.mode === 'signin') await authApi.requestSigninCode(state.phone);
      else await authApi.requestSignupCode(state.phone);
      setState((current) => ({ ...current, step: 'code', error: '' }));
    } catch (error) {
      setState((current) => ({ ...current, error: error instanceof Error ? error.message : 'Unable to send code.' }));
    }
  };

  const verifyCode = async () => {
    if (!isCodeValid(state.code)) {
      setState((current) => ({ ...current, error: 'Enter the six-digit code we sent you.' }));
      return;
    }

    if (state.mode === 'signup') {
      setState((current) => ({ ...current, step: 'success', error: '' }));
      return;
    }
    try {
      await authApi.verifySignin(state.phone, state.code);
      setState((current) => ({ ...current, step: 'success', error: '' }));
    } catch (error) {
      setState((current) => ({ ...current, error: error instanceof Error ? error.message : 'Unable to verify code.' }));
    }
  };

  const useDifferentNumber = () => {
    setState((current) => ({ ...current, step: 'phone', error: '' }));
  };

  const backToVerification = () => {
    setState((current) => ({ ...current, step: 'code', error: '' }));
  };

  const setMode = (mode: AuthMode) => {
    setState((current) => ({ ...initialState, mode }));
  };

  const completeSignup = async (fullName: string, email: string, role: 'customer' | 'host') => {
    await authApi.verifySignup({ phone: state.phone, code: state.code, full_name: fullName, email, role });
  };

  return {
    state,
    canContinue: isPhoneValid(state.phone),
    canVerify: isCodeValid(state.code),
    updatePhone,
    updateCode,
    continueToCode,
    verifyCode,
    useDifferentNumber,
    backToVerification,
    setMode,
    completeSignup,
  };
}
