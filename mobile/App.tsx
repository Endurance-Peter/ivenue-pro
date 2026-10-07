import { StatusBar } from 'expo-status-bar';

import { AuthScreen } from './src/features/auth/screens/AuthScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AuthScreen />
    </>
  );
}
