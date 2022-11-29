import {BaseRepository} from "../lib/repository";
import { PoolClient } from 'pg';
import { User } from '.';

export default class UserRepository extends BaseRepository<User> {
    pc: PoolClient;

    constructor(pc: PoolClient) {
        super();
        this.pc = pc;
    }

    async create(item: User): Promise<User> {
        try {
            let r = await this.pc.query('INSERT INTO indexter.users(email) VALUES($1)', [item.email]);
            if(r.rowCount == 0) {
                throw new Error('User save not successful');
            }
            return item;
        } catch (e) {
            console.log(e);
            throw new Error ('User save not successful');
        }
    }
    
    async delete(id: string): Promise<boolean> {
        try {
            await this.pc.query('DELETE FROM indexter.users WHERE email = ($1)', [id]);
            return true;
        } catch (e) {
            console.log(e);
            throw new Error('Unable to delete User');
        }
    }
    
    async findOne(id: string): Promise<User> {
        try {
            let r = await this.pc.query<User>('SELECT * FROM indexter.users WHERE email = ($1)', [id]);
            return r.rows[0];
        } catch (e) {
            console.log(e);
            throw new Error ('User retrieval not successful')
        }

    }
}