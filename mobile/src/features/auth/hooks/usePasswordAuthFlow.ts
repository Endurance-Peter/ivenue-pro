import { useState } from 'react';

import { authApi } from '../../../lib/api';
import { SessionResponse } from '../../../lib/api';
import { AuthMode } from '../auth.types';

type PasswordAuthState = {
  mode: AuthMode;
  fullName: string;
  email: string;
  password: string;
  role: 'customer' | 'host';
  error: string;
};

export function usePasswordAuthFlow(onAuthenticated: (session: SessionResponse) => void) {
  const [state, setState] = useState<PasswordAuthState>({ mode: 'signup', fullName: '', email: '', password: '', role: 'customer', error: '' });

  const update = (field: keyof PasswordAuthState, value: string) => setState((current) => ({ ...current, [field]: value, error: '' }));
  const setMode = (mode: AuthMode) => setState((current) => ({ ...current, mode, error: '' }));

  const submit = async () => {
    try {
      if (state.mode === 'signup') {
        const session = await authApi.signupWithPassword(state.fullName, state.email, state.password, state.role);
        onAuthenticated(session);
      } else {
        const session = await authApi.signinWithPassword(state.email, state.password);
        onAuthenticated(session);
      }
    } catch (error) {
      setState((current) => ({ ...current, error: error instanceof Error ? error.message : 'Unable to sign in right now.' }));
    }
  };

  return { state, update, setMode, submit };
}
