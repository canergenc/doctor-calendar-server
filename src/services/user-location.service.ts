import {bind, /* inject, */ BindingScope} from '@loopback/core';

@bind({scope: BindingScope.TRANSIENT})
export class UserLocationService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */
}
