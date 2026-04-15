import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { User } from './users.types'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async registerNewUser(
    username: string,
    email: string,
    password: string,
  ): Promise<UserEntity> {
    // [TODO] Proper error handleing
    const result = await this.usersRepository.save({
      username: username,
      email: email,
      password: password,
      isActive: true,
      verified: false,
    });
    this.logger.verbose(`[registerNewUser] Result: ${result}`);
    return result;
  }

  async findUserByName(username: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ username });
  }

  async findEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ email });
  }

  async updateUserVerified(credential: string): Promise<boolean> {
    const user = await this.findUser(credential)
    if (user)
    {
      await this.usersRepository.update(user.userId, { verified: true });
      return true
    } 
    return false
  }

  async updateUserPassword(credential: string, newpassword: string): Promise<boolean> {
    const user = await this.findUser(credential)
    if (user) {
      await this.usersRepository.update(user.userId, {password: newpassword})
      return true 
    }
    return false
  }

  async findUser(credential: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: [{ username: credential }, { email: credential }],
    });
  }

  async isUserVerified(username: string): Promise<boolean> {
    return !!(await this.usersRepository.findOne({where: {username: username, verified: true}}))
  }

}
