import { AbilityBuilder, PureAbility } from '@casl/ability';
import type { AuthUser } from '@/types/user';

export type AppAbility = PureAbility<[string, string]>;

export function defineAbilityFor(user: AuthUser | null): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

  for (const permission of user?.permissions ?? []) {
    can(permission.action, permission.subject);
  }

  return build();
}
