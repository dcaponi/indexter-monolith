import {BaseRepository} from "../lib/repository";
import { PoolClient } from 'pg';
import { Credentials } from '.';

export default class CredentialsRepository extends BaseRepository<Credentials> {
    pc: PoolClient;

    constructor(pc: PoolClient) {
        super();
        this.pc = pc;
    }

    async upsert(item: Credentials): Promise<Credentials> {
        let existingCreds = await this.find(item);
        if (existingCreds.length > 1) {
            console.log("unexpected preexisting credential")
            throw new Error()
        }
        try {
            if (existingCreds.length == 1 && existingCreds[0].id != null) {
                return await this.update(existingCreds[0].id, item);
            } else {
                return await this.create(item);
            }
        }
        catch (e) {
            console.log(e);
            throw new Error('Credentials upsert not successful');
        }
    }

    async create(item: Credentials): Promise<Credentials> {
        try {
            let r = await this.pc.query('INSERT INTO indexter.creds(source, email, access_token, refresh_token, expiry_date, alt_user_id) VALUES($1, $2, $3, $4, $5, $6)', [item.source, item.email, item.access_token, item.refresh_token, item.expiry_date, item.alt_user_id]);
            if (r.rowCount == 0) {
                throw new Error('Credentials save not successful');
            }
            return item;
        } catch (e) {
            console.log(e);
            throw new Error('Credentials save not successful');
        }
    }

    async update(id: string, item: Credentials): Promise<Credentials> {
        try {
            let r = await this.pc.query('UPDATE indexter.creds SET access_token = ($1), refresh_token = ($2), expiry_date = ($3) WHERE id = ($4)', [item.access_token, item.refresh_token, item.expiry_date, id])
            if (r.rowCount == 0) {
                throw new Error('Credentials save not successful');
            }
            return item;
        } catch (e) {
            console.log(e);
            throw new Error('Credentials update not successful');
        }
    }

    async find(item: Credentials): Promise<Credentials[]> {
        try {
            let q = `SELECT * FROM indexter.creds WHERE `;
            let r;
            if(item.email && item.source) {
                q += `email = ($1) AND source = ($2)`
                r = await this.pc.query<Credentials>(q, [item.email, item.source]);
            } else if (item.email) {
                q += `email = ($1)`
                r = await this.pc.query<Credentials>(q, [item.email]);
            } else if (item.source) {
                q += `source = ($1)`
                r = await this.pc.query<Credentials>(q, [item.source]);
            } else {
                throw new Error('email or source are required for credential search');
            }
            return r.rows;
        } catch(e) {
            console.log(e);
            throw new Error('Credential search not succesful')
        }
    }

    async findOne(id: string): Promise<Credentials> {
        try {
            let r = await this.pc.query<Credentials>('SELECT * FROM indexter.creds WHERE id = ($1)', [id]);
            return r.rows[0];
        } catch (e) {
            console.log(e);
            throw new Error('Credentials retrieval not successful')
        }
    }

    async findByUser(email: string): Promise<Credentials[]> {
        try {
            let r = await this.pc.query<Credentials>('SELECT * FROM indexter.creds WHERE email = ($1)', [email]);
            if (r.rowCount == 0) {
                throw new Error('Credentials retrieval by email not successful');
            }
            return r.rows;
        } catch(e) {
            console.log(e);
            throw new Error('Credential retrieval by email not succesful')
        }
    }
}