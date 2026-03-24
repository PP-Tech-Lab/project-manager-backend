import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

export type User = {
    userId: number;
    username: string;
    password: string;
}

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>
    ) {}
    async findUserByName(username: string): Promise<User | null> {
        return this.usersRepository.findOneBy({username});
    }
}
