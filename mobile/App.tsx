import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { AuthScreen } from './src/features/auth/screens/AuthScreen';
import { BrowseScreen } from './src/features/browse/screens/BrowseScreen';
import { HostScreen } from './src/features/host/screens/HostScreen';
import { SessionResponse } from './src/lib/api';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [session, setSession] = useState<SessionResponse | null>(null);

  return (
    <>
      <StatusBar style="light" />
      {authenticated && session?.user.role === 'host' ? <HostScreen token={session.access_token} /> : authenticated ? <BrowseScreen /> : <AuthScreen onAuthenticated={(nextSession) => { setSession(nextSession); setAuthenticated(true); }} />}
    </>
  );
}
