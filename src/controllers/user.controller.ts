import { Filter, repository, model, property, CountSchema, Count, Where } from '@loopback/repository';
import { post, param, get, getFilterSchemaFor, getModelSchemaRef, del, requestBody, HttpErrors, getWhereSchemaFor, patch, RequestContext } from '@loopback/rest';
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
import { RoleType } from '../enums/role-type.enum';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 16,
      minLength: 8,
      errorMessage:
        'parola minimum 8 karakter uzunluğunda olmalı! ',
    },
  })
  password: string;
}
@model()
export class UpdateUserRequest extends User {
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
  oldPassword: string;

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
  currentPassword: string;
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
    @service(MyUserService) public myUserService: MyUserService,
    @inject.context() public context: RequestContext
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

      const token = await this.myUserService.generateVerifyToken(savedUser.id)

      this.myUserService.sendMailRegisterUser(savedUser.email, savedUser.fullName, token, this.context.request.headers["origin"]);

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
      tokenModel: { token: token, iat: decodeResult?.decodeModel?.iat, exp: decodeResult?.decodeModel?.exp, userId: decodeResult?.decodeModel?.id }
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

  @get('/users/verification/{key}', {
    parameters: [{ name: 'key', schema: { type: 'string' }, in: 'path', required: true }],
    responses: {
      '200': {
        description: 'Account verify api.',
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
  async verification(
    @param.path.string('key') key: string
  ): Promise<Boolean> {
    return this.myUserService.verifyEmail(key);
  }

  @get('/users/re-verification', {
    parameters: [{ name: 'email', schema: { type: 'string' }, in: 'query', required: true }],
    responses: {
      '200': {
        description: 'Account re-verify api.',
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
  async reVerification(
    @param.query.string('email') email: string
  ): Promise<Boolean> {
    const link = this.context?.request?.headers["origin"];
    return this.myUserService.reVerify(email, link ?? undefined);
  }

  @get('/users/forgot', {
    parameters: [{ name: 'email', schema: { type: 'string' }, in: 'query', required: true }],
    responses: {
      '200': {
        description: 'Forgot api.',
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
  async forgot(
    @param.query.string('email') email: string
  ): Promise<Boolean> {
    const link = this.context.request.headers["origin"];
    return this.myUserService.forgot(email, link);
  }

  @post('/users/resetPassword', {
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
    return this.myUserService.resetPassword(resetPassword);
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
          schema: getModelSchemaRef(UpdateUserRequest, { partial: true }),
        },
      },
    })
    user: UpdateUserRequest,
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    await this.myUserService.updateById(userId, user, currentUserProfile);
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
