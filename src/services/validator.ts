import { Credentials } from '../repositories/user.repository';
import isemail from 'isemail';
import { HttpErrors } from '@loopback/rest';

export function validateCredentials(credentials: Credentials) {
  // Validate Email
  if (!isemail.validate(credentials.email)) {
    throw new HttpErrors.BadRequest('invalid email');
  }

  // Validate Password Length
  if (!credentials.password || credentials.password.length < 8) {
    throw new HttpErrors.BadRequest(
      'password must be minimum 8 characters',
    );
  }
}
