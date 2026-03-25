import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

export type User = {
    userId: number;
    username: string;
    password: string;
    email: string;
}

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>
    ) {}

    async registerNewUser(username: string, email: string, password: string): Promise<boolean> {
        var result = await this.usersRepository.insert({
            username: username,
            email: email,
            password: password,
            isActive: false
        })
        this.logger.verbose(`[registerNewUser] Result: ${result}`)
        return true
    }

    async findUserByName(username: string): Promise<User | null> {
        return this.usersRepository.findOneBy({username});
    }
    async findEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({email});
    }
}
