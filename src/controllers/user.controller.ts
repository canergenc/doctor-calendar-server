import { Filter, repository, model, property, CountSchema, Count, Where } from '@loopback/repository';
import { post, param, get, getFilterSchemaFor, getModelSchemaRef, del, requestBody, HttpErrors, getWhereSchemaFor, patch } from '@loopback/rest';
import { UserProfile, securityId, SecurityBindings } from '@loopback/security';
import { User, UserInfoOutputModel, ResetPassword } from '../models';
import { UserRepository, Credentials } from '../repositories';
import { authenticate, TokenService, UserService } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { CredentialsRequestBody, UserProfileSchema } from './specs/user-controller.specs';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { PasswordHasher } from '../services/hash.password.bcryptjs';
import { validateCredentials } from '../services/validator';
import _ from 'lodash';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import isemail from 'isemail';
import { MyUserService } from '../services/user-service';
import { RoleType } from '../enums/roleType.enum';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 16,
      minLength: 8,
      errorMessage:
        'parola minimum 8 karakter uzunluğunda olmalı!',
    },
  })
  password: string;
}

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @service(MyUserService) public myUserService: MyUserService
  ) { }

  @post('/users', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User> {

    // All new users have the "RoleType.User" role by default
    newUserRequest.roles = [RoleType.User];

    newUserRequest.email = newUserRequest.email.trim().toLowerCase();

    const foundUser = await this.userRepository.findEmail(newUserRequest.email);
    if (foundUser) { throw new HttpErrors.Conflict('Email daha önce kullanılmış!'); }

    // ensure a valid email value and password value
    validateCredentials(_.pick(newUserRequest, ['email', 'password']));
    // encrypt the password
    const password = await this.passwordHasher.hashPassword(
      newUserRequest.password,
    );

    try {
      // create the new user
      const savedUser = await this.userRepository.create(
        _.omit(newUserRequest, 'password'),
      );

      // set the password
      await this.userRepository
        .userCredentials(savedUser.id)
        .create({ password });

      // const token = await this.myUserService.generateVerifyToken(savedUser.id)

      // this.myUserService.sendMailRegisterUser(savedUser.email, savedUser.fullName, token);

      return savedUser;
    } catch (error) {

      // MongoError 11000 duplicate key
      if (error.code === 11000 && error.errmsg?.includes('index: uniqueEmail')) {
        throw new HttpErrors.BadRequest('Email daha önce kullanılmış!');
      } else {
        throw error;
      }
    }
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{
    tokenModel: {
      token: string,
      iat: number,
      exp: number,
      userId: string
    }
  }> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    //Token iat and exp result
    const decodeResult = await this.myUserService.decodeToken(token);

    return {
      tokenModel: { token: token, iat: decodeResult?.decodeModel?.iat, exp: decodeResult?.decodeModel?.exp, userId: decodeResult?.decodeModel?.userId }
    };
  }

  @get('/users/count', {
    responses: {
      '200': {
        description: 'Users model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  @authenticate('jwt')
  async count(
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async find(
    @param.query.object('filter', getFilterSchemaFor(User)) filter?: Filter<User>,
  ): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async printCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<UserInfoOutputModel> {
    currentUserProfile.id = currentUserProfile[securityId];
    delete currentUserProfile[securityId];
    return this.myUserService.printCurrentUser(currentUserProfile);
  }

  @post('/users/verification', {
    responses: {
      '200': {
        description: 'Email verification.',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
              properties: {
                success: {
                  type: 'boolean',
                },
              }
            },
          },
        },
      },
    },
  })
  async verification(
    @param.query.string('key') key: string
  ): Promise<Boolean> {
    return this.myUserService.verifyEmail(key);
  }

  @post('/users/re-verification', {
    responses: {
      '200': {
        description: 'Activation Link Email re-verification.',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
              properties: {
                success: {
                  type: 'boolean',
                },
              }
            }
          },
        },
      },
    },
  })
  async reVerification(
    @param.query.string('email') email: string
  ): Promise<Boolean> {
    return this.myUserService.reVerify(email);
  }

  @post('/users/forgot', {
    responses: {
      '200': {
        description: 'Account forgot password service',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
              properties: {
                success: {
                  type: 'boolean',
                },
              }
            },
          },
        },
      },
    },
  })
  async forgot(
    @param.query.string('email') email: string
  ): Promise<Boolean> {
    return this.myUserService.verifyEmail(email);
  }

  @patch('/users/reset', {
    responses: {
      '200': {
        description: 'Account reset password service',
        content: {
          'application/json': {
            schema: {
              type: 'boolean',
              properties: {
                success: {
                  type: 'boolean',
                },
              }
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async reset(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ResetPassword),
        },
      },
    })
    resetPassword: ResetPassword,
  ): Promise<Boolean> {
    //validatePassword(password.password);
    return true; //this.myUserService.resetPassword(resetPassword);
  }

  @get('/users/emailCheck', {
    parameters: [{ name: 'email', schema: { type: 'string' }, in: 'query', required: true }],
    responses: {
      '200': {
        description: 'Email check control api.',
        content: {
          'application/json': {
            schema: {
              type: 'boolean'
            },
          },
        },
      },
    },
  })
  async emailCheckControl(@param.query.string('email') email: string): Promise<Boolean> {

    // Validate Email
    if (!isemail.validate(email)) {
      throw new HttpErrors.BadRequest('invalid email');
    }
    return this.userRepository.findEmail(email);
  }

  @get('/users/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async findById(
    @param.path.string('userId') userId: string,
    @param.query.object('filter', getFilterSchemaFor(User)) filter?: Filter<User>
  ): Promise<User> {
    return this.userRepository.findById(userId, filter);
  }

  @patch('/users/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'User patch success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @param.path.string('userId') userId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, { partial: true }),
        },
      },
    })
    user: User,
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    try {
      // Only admin can assign roles
      if (!currentUserProfile.roles?.includes(RoleType.Admin)) {
        delete user.roles;
      }
      user.updatedDate = new Date();
      await this.userRepository.updateById(userId, user);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  @del('/users/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteById(@param.path.string('userId') userId: string): Promise<void> {
    await this.myUserService.deleteById(userId);
  }
}
