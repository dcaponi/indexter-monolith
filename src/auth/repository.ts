import {BaseRepository} from '../lib/repository';
import {PoolClient} from 'pg';
import {MagicLink} from '.';

export default class MagicLinkRepository extends BaseRepository<MagicLink> {
  pc: PoolClient;

  constructor(pc: PoolClient) {
    super();
    this.pc = pc;
  }

  async create(item: MagicLink): Promise<MagicLink> {
    try {
      let r = await this.pc.query<MagicLink>(
        'INSERT INTO indexter.magic_links(email) VALUES($1)',
        [item.email]
      );
      if (r.rowCount == 0) {
        throw new Error('Magic Link save not successful');
      }
      let savedMagicLinks = await this.find(item);
      if (savedMagicLinks.length == 1) {
        return savedMagicLinks[0];
      }
      throw new Error(
        'Magic Link save not successful. Unable to retrieve link'
      );
    } catch (e) {
      console.log(e);
      throw new Error('Magic Link save not successful');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.pc.query<MagicLink>(
        'DELETE FROM indexter.magic_links WHERE id = ($1)',
        [id]
      );
      return true;
    } catch (e) {
      console.log(e);
      throw new Error('Magic Link deletion not successful');
    }
  }

  async deleteByEmail(email: string): Promise<Boolean> {
    try {
      await this.pc.query<MagicLink>(
        `DELETE FROM indexter.magic_links WHERE email = ($1)`,
        [email]
      );
      return true;
    } catch (e) {
      console.log(e);
      throw new Error('Magic Link deletion not successful');
    }
  }

  async find(item: MagicLink): Promise<MagicLink[]> {
    try {
      let q = `SELECT * FROM indexter.magic_links WHERE `;
      let r;
      if (item.email) {
        q += `email = ($1)`;
        r = await this.pc.query<MagicLink>(q, [item.email]);
        return r.rows;
      } else {
        throw new Error('email required for magic link search');
      }
    } catch (e) {
      console.log(e);
      throw new Error('Magic Link retrieval not successful');
    }
  }

  async findOne(id: string): Promise<MagicLink> {
    try {
      let r = await this.pc.query<MagicLink>(
        'SELECT * FROM indexter.magic_links WHERE id = ($1)',
        [id]
      );
      return r.rows[0];
    } catch (e) {
      console.log(e);
      throw new Error('Magic Link retrieval not successful');
    }
  }
}
