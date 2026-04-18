import {
  Body,
  Controller,
  Get,
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

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body() input: { credential: string; password: string },
    @Res() res,
  ) {
    if (!input.credential || !input.password) {
      this.logger.warn(`[login] [POST] ${HttpStatus.BAD_REQUEST} Bad request! Missing fields!`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Bad Request. Missing ${!input.credential ? 'username' : 'password'}`,
      });
    } else {
      const data = await this.authService.authenticate(input);
      this.logger.log(
        `[login] [POST] ${HttpStatus.OK} User "${input.credential}" logged in`,
      );
      return res.status(HttpStatus.OK).json(data);
    }
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getUserInfo(@Request() request, @Res() res) {
    const username = request.user.username;
    const user = await this.authService.userExists(username)

    if (user) {
      this.logger.log(`[getUserInfo] [GET] ${HttpStatus.OK} Returning request for user: ${username}`);
      return res.status(HttpStatus.OK).json({ verified: user.verified, username });
    }

    this.logger.warn(`[getUserInfo] [GET] ${HttpStatus.NOT_FOUND} User not found`)
    return res.status(HttpStatus.NOT_FOUND).json({message: "User not found"})
  }

  @Post('register')
  async register(
    @Body() input: { username: string; password: string; email: string },
    @Res() res,
  ) {
    if (!input.username || !input.password || !input.email) {
      this.logger.warn(`[register] [POST] ${HttpStatus.BAD_REQUEST} Bad request! Missing fields!`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: `Bad Request. Missing fields` });
    } else if (await this.authService.emailExists(input.email)) {
      this.logger.warn(`[register] [POST] ${HttpStatus.CONFLICT} Email taken`);
      return res
        .status(HttpStatus.CONFLICT)
        .json({ registrationError: 'email-taken' });
    } else {
      const data = await this.authService.signUp(input);
      this.logger.log(`[register] [POST] ${HttpStatus.CREATED} New user ${data.username} registered`);
      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'New User successfuly created!', ...data });
    }
  }

  // [TODO]: Implement proper query param validation
  @Get('check-username')
  async checkUsername(@Query('username') username: string, @Res() res) {
    if (username === undefined) {
      this.logger.warn(`[check-username] [GET] ${HttpStatus.BAD_REQUEST} Missing params`)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Missing params' });
    }

    this.logger.log(`[check-username] [GET] ${HttpStatus.OK} Returning request`)
    return res.status(HttpStatus.OK).json({
      usernameExists: `${!!await this.authService.userExists(username)}`,
    });
  }

  @Post('email-verification')
  async emailVerification(
    @Body() input: { token: string },
    @Res() res,
  ) {
    if (!input.token) {
      this.logger.warn(`[email-verification] [POST] ${HttpStatus.BAD_REQUEST} Missing fields`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Bad request. Missing fields' });
    }
    if (!await this.authService.emailVerificationHandler(input)) {
      this.logger.warn(`[email-verification] [POST] ${HttpStatus.UNAUTHORIZED} Token Expired or non-existant`) 
      return res.status(HttpStatus.UNAUTHORIZED).json({message: 'Token expired or non-existant'});
    }
      this.logger.log(`[email-verificacion] [POST] ${HttpStatus.OK} Email Verified`)
      return res.status(HttpStatus.OK).json({message: 'Email verified!'});
  }

  @Post('reset-password')
  async requestResetPassword(
    @Body() input: { userEmail: string },
    @Res() res,
  ) {
    if (!input.userEmail) {
      this.logger.warn(
        `[reset-password] [POST] ${HttpStatus.BAD_REQUEST} Missing credential field`,
      );
      return res.status(HttpStatus.BAD_REQUEST).json();
    }
    // [TODO]: check if token exists. if true, update existing record instead of creating new one
    if (!await this.authService.userExists(input.userEmail)) {
      this.logger.warn(`[reset-password] [POST] ${HttpStatus.NOT_FOUND}  Email does not exist`);
      return res
      .status(HttpStatus.NOT_FOUND)
      .json({ message: 'Email does not exist' });
    }

    if (!await this.authService.passwordResetRequestHandler(input)) {
      this.logger.warn(`[reset-password] [POST] ${HttpStatus.UNAUTHORIZED} Token Expired or non-existant`)
      return res.status(HttpStatus.UNAUTHORIZED).json({message: "Token Expired or non-existant"});
    }
    this.logger.log(
      `[reset-password] [POST] ${HttpStatus.OK} Password reset requested for user with email ${input.userEmail}`,
    );

    return res.status(HttpStatus.OK).json({message: "Email sent"});
  }

  @Patch('reset-password')
  async updatePassword(
    @Body() input: { credential: string; token: string; newPassword: string },
    @Res() res,
  ) {
    if (!input.credential || !input.newPassword || !input.token) {
      this.logger.warn(`[reset-password] [PATCH] ${HttpStatus.BAD_REQUEST} Missing fields`);
      return res.status(HttpStatus.BAD_REQUEST).json();
    }

    if (!this.authService.validatePasswordResetToken(input.token)) {
      this.logger.warn(`[reset-password] [PATCH] ${HttpStatus.FORBIDDEN} Token not valid`);
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: 'Token expired or nonexistant' });
    }

    const user = await this.authService.userExists(input.credential);
    if (!user) {
      this.logger.warn(`[reset-password] [PATCH] ${HttpStatus.NOT_FOUND} User does not exist`);
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'User does not exist' });
    }
    
    if (!await this.authService.passwordResetUpdateHandler(user, input)) {
      this.logger.log(
      `[reset-password] [PATCH] ${HttpStatus.GONE} User no longer exists ${input.credential}`,
    );
      return res.status(HttpStatus.GONE).json({message: "User no longer exists"});
    }

    this.logger.log(
      `[reset-password] [PATCH] ${HttpStatus.OK} Password update for user ${input.credential}`,
    );
    return res.status(HttpStatus.OK).json({message: "Password updated"});
  }
}
