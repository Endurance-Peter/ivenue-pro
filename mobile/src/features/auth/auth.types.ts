export type AuthStep = 'phone' | 'code' | 'success';

export type AuthFormState = {
  phone: string;
  code: string;
  step: AuthStep;
  error: string;
};
