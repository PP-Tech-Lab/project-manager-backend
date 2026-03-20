import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

export type User = {
    userId: number;
    username: string;
    password: string;
}

// [TODO] This is a mockup, implement a real ORM connection to DB
// const users: User[] = [
//     {
//         userId: 1,
//         username: 'Alice',
//         password: 'topsecret', //TODO Use a hash
//     },
//     {
//         userId: 2,
//         username: 'Bob',
//         password: '123abc'
//     }
// ];

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
