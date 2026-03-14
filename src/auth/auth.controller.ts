import { Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Request, Post, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() input: { username: string; password: string}, // [TODO]: ```Getting errors using @Res({passthrough: true}) res: Response```
    ) {
        if (!input.username || !input.password) {
            return {message: "Bad Request" ,statusCode: 400};
        }
        else {
            return this.authService.authenticate(input);}
    }

    @UseGuards(AuthGuard)
    @Get('me')
    getUserInfo(@Request() request) {
        return request.user
    }
}
