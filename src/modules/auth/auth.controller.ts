import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Res,
  Logger,
  Query,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../guards/auth.guard';
import { UsersService } from '../../orm-services/users/users.service';
import { EmailNotificationService } from '../../services/email-notification.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private emailNotificationService: EmailNotificationService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() input: { credential: string; password: string },
    @Res() res,
  ) {
    if (!input.credential || !input.password) {
      this.logger.warn('[login] Bad request! Missing fields!');
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Bad Request. Missing ${!input.credential ? 'username' : 'password'}`,
      });
    } else {
      this.logger.debug(
        `[login] User "${input.credential}" attempting to login`,
      );
      const data = await this.authService.authenticate(input);
      return res.status(HttpStatus.OK).json(data);
    }
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getUserInfo(@Request() request, @Res() res) {
    const username = request.user.username;
    console.log(`[getUserInfo] [GET] Returning request for user ${username}`);
    const userVerified = await this.userService.isUserVerified(username);
    return res.status(HttpStatus.OK).json({ verified: userVerified, username });
  }

  @Post('register')
  async register(
    @Body() input: { username: string; password: string; email: string },
    @Res() res,
  ) {
    if (!input.username || !input.password || !input.email) {
      this.logger.warn('[register] Bad request! Missing fields!');
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: `Bad Request. Missing fields` });
    } else if (await this.authService.emailExists(input.email)) {
      this.logger.warn('[register] Conflict! Email taken!');
      return res
        .status(HttpStatus.CONFLICT)
        .json({ registrationError: 'email-taken' });
    } else {
      this.logger.debug('[register] this means its working!');
      const data = await this.authService.signUp(input);
      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'New User successfuly created!', ...data });
    }
  }

  @Get('check-username')
  async checkUsername(
    @Query('username') username: string, 
    @Res() res
  ) {
    const result = await this.userService.findUser(username);
    return res
      .status(HttpStatus.OK)
      .json({ usernameExists: `${result ? true : false}` });
  }

  @Post('email-verification')
  async emailVerification(
    @Body() input: { username: string; token: string },
    @Res() res,
  ) {
    this.logger.debug(
      '[emailVerification] Email verification request recieved',
    );
    if (!input.token || !input.username) {
      this.logger.warn('[emailVerification] Bad Request! Missing fields');
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Bad request. Missing fields' });
    }
    // [TODO]: Validate if token is still valid
    if (
      await this.emailNotificationService.validateToken(
        input.token,
      )
    )
      return res.status(HttpStatus.OK).json();
    else return res.status(HttpStatus.UNAUTHORIZED).json();
  }

  @Post('reset-password')
  async requestResetPassword(
    @Body() input: { credential: string },
    @Res() res,
  ) {
    if (!input.credential) {
      this.logger.warn(
        `[requestResetPassword] Bad request! Missing cretential field`,
      );
      return res.status(HttpStatus.BAD_REQUEST).json();
    }
    // [TODO]: check if token exists. if true, update existing record instead of creating new one

    this.logger.debug(
      `[requestResetPassword] Password reset requested for user ${input.credential}`,
    );
    const user = await this.userService.findUser(input.credential)
    if (!user) {
      this.logger.warn(
        `[requestResetPassword] User does not exist`)
        return res.status(HttpStatus.NOT_FOUND).json({message: 'Email does not exist'})
    }

    if (await this.emailNotificationService.sendPasswordResetEmail(user.email, user.userId)) 
      return res.status(HttpStatus.OK).json();
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json()
  }

  @Patch('reset-password')
  async updatePassword(
    @Body() input: {credential: string, token: string, newpassword: string},
    @Res() res,
  ) {
    if (!input.credential || !input.newpassword || !input.token) {
      this.logger.warn(
        `[updatePassword] Bad request! Missing fields`,
      );
      return res.status(HttpStatus.BAD_REQUEST).json();
    }
    if (!this.emailNotificationService.validateToken(input.token)) {
      this.logger.warn(
        `[updatePassword] Token not valid`
      );
      return res.status(HttpStatus.FORBIDDEN).json({message: 'Token expired or nonexistant'})
    }
    this.logger.debug(
      `[updatePassword] Password update for user ${input.credential}`,
    );
    const user = await this.userService.findUser(input.credential)
    if (!user) {
      this.logger.warn(
        `[updatePassword] User does not exist`)
        return res.status(HttpStatus.NOT_FOUND).json({message: 'User does not exist'})
    }
    const newHash = await this.authService.createPasswordHash(input.newpassword)
    if (await this.userService.updatePassword(user.userId, newHash)) 
      return res.status(HttpStatus.OK).json();
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json()
  }
}

