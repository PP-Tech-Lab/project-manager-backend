import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

// [TODO] Move to users.types.ts
export type User = {
    userId: string;
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

    async registerNewUser(username: string, email: string, password: string): Promise<boolean> { // [TODO] Proper error handleing
        const result = await this.usersRepository.insert({
            username: username,
            email: email,
            password: password,
            isActive: true,
            verified: false
        })
        this.logger.verbose(`[registerNewUser] Result: ${result}`)
        return true
    }

    async findUserByName(username: string): Promise<User | null> {
        return await this.usersRepository.findOneBy({username});
    }

    async findEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOneBy({email});
    }

    async findUser(credentials: string): Promise<User | null> {
        return await this.usersRepository.findOne({
            where: [
                {username: credentials},
                {email: credentials}
                ]
        })
    }
}
