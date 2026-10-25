import { createContext, useContext } from 'react';
import { createContextualCan } from '@casl/react';
import { PureAbility } from '@casl/ability';
import type { AppAbility } from './ability';

export const AbilityContext = createContext<AppAbility>(new PureAbility([]));
export const Can = createContextualCan(AbilityContext.Consumer);

export function useAbility(): AppAbility {
  return useContext(AbilityContext);
}
