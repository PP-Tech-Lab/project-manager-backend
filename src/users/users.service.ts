import { Injectable } from '@nestjs/common';

export type User = {
    userId: number;
    username: string;
    password: string;
}

// [TODO] This is a mockup, implement a real ORM connection to DB
const users: User[] = [
    {
        userId: 1,
        username: 'Alice',
        password: 'topsecret', //TODO Use a hash
    },
    {
        userId: 2,
        username: 'Bob',
        password: '123abc'
    }
];

@Injectable()
export class UsersService {
    async findUserByName(username: string): Promise<User | undefined> {
        return users.find((user) => user.username === username);
    }
}
