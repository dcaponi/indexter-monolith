import express from 'express'
import { Client as ESClient } from '@elastic/elasticsearch'
import { PoolClient } from 'pg'
import DocsRepository from './repository';
import { CredentialsRepository } from '../account_linking';
import DocsController from './controller';
import { jwtCookieAuth } from '../lib/auth/jwt_auth/jwt_cookie_auth_middleware';

const docsRoutes = (pc: PoolClient, es: ESClient) => {
    let router = express.Router();
    let docsRepo = new DocsRepository(es);
    let credsRepo = new CredentialsRepository(pc)
    let docsController = new DocsController(credsRepo, docsRepo);
    router.route('/').get(jwtCookieAuth, docsController.search)
    router.route('/slack').post(docsController.slackSearch) // slack uses this
    return router;
}

export default docsRoutes;