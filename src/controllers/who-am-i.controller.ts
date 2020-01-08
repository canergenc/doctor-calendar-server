import { inject } from '@loopback/context';
import { securityId, SecurityBindings, UserProfile } from '@loopback/security';
import { authenticate } from '@loopback/authentication';
import { get } from '@loopback/rest';
@authenticate('BasicStrategy')
export class WhoAmIController {
  constructor(@inject(SecurityBindings.USER) private user: UserProfile) { }

  @get('/whoami')
  whoAmI(): string {
    return this.user[securityId];
  }

  @authenticate.skip()
  @get('/hello')
  hello(): string {
    return 'Hello';
  }
}
