import { useState } from 'react';

import { AuthFormState, AuthMode } from '../auth.types';
import { isCodeValid, isPhoneValid } from '../auth.validation';

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

  const continueToCode = () => {
    if (!isPhoneValid(state.phone)) {
      setState((current) => ({ ...current, error: 'Enter a valid mobile number to continue.' }));
      return;
    }

    setState((current) => ({ ...current, step: 'code', error: '' }));
  };

  const verifyCode = () => {
    if (!isCodeValid(state.code)) {
      setState((current) => ({ ...current, error: 'Enter the six-digit code we sent you.' }));
      return;
    }

    setState((current) => ({ ...current, step: 'success', error: '' }));
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
  };
}
