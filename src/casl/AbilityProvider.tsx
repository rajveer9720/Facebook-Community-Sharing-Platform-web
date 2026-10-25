import { useMemo, type ReactNode } from 'react';
import { useAppSelector } from '@/app/hooks';
import { defineAbilityFor } from './ability';
import { AbilityContext } from './AbilityContext';

export function AbilityProvider({ children }: { children: ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const ability = useMemo(() => defineAbilityFor(user), [user]);

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}
