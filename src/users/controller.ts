import {Request, Response, NextFunction} from 'express';
import {UserRepository} from '.';
import {MagicLinkRepository} from '../auth';
import {Emailer} from '../lib/emailer';

const url = require('url');

export default class UserController {
  userDB: UserRepository;
  magicLinkRepository: MagicLinkRepository;
  emailer: Emailer;
  magicLinkUrl = `${
    process.env.MAGIC_LINK_URL || 'http://localhost:3000'
  }/login`;

  constructor(
    userDB: UserRepository,
    magicLinkRepository: MagicLinkRepository,
    emailer: Emailer
  ) {
    this.userDB = userDB;
    this.magicLinkRepository = magicLinkRepository;
    this.emailer = emailer;
  }

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    let q = url.parse(req.url, true).query;
    try {
      let user = await this.userDB.findOne(q.email);
      if (!user) {
        res.status(404).json({message: 'user not found'});
      } else {
        res.status(200).json(user);
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({message: 'unable to get user'});
    }
  };
}
