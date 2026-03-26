import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    userId!: number;
    
    @Column()
    username!: string;

    @Column()
    password!: string;

    @Column()
    email!: string

    @Column()
    isActive!: boolean

    @Column()
    verified!: boolean
}