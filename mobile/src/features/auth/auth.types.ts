export type AuthStep = 'phone' | 'code' | 'success';
export type AuthMode = 'signup' | 'signin';

export type AuthFormState = {
  phone: string;
  code: string;
  step: AuthStep;
  error: string;
  mode: AuthMode;
};
