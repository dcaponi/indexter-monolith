import {Request, Response, NextFunction} from 'express';
import {Integration} from '.';

import {CredentialsRepository} from '.';

const url = require('url');

export default class IntegrationController {
  integration: Integration;
  db: CredentialsRepository;

  constructor(integration: Integration, db: CredentialsRepository) {
    this.integration = integration;
    this.db = db as CredentialsRepository;
  }

  exchangeAuthCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let q = url.parse(req.url, true).query;
    let code = q.code as string;
    let state = q.state as string;

    let token = await this.integration.codeToCreds(code);
    if (!token) {
      console.log('no token returned from source');
      res.redirect(500, process.env.FRONTEND_URL || 'http://localhost:8080');
      return;
    }

    token.email = state;

    console.log(token.email);
    try {
      await this.db.upsert(token);
      res.redirect(
        301,
        `${process.env.FRONTEND_URL || 'http://localhost:8080'}/links`
      );
    } catch (e) {
      res.status(500).json({message: 'unexpected error'});
    }
  };
}
