// todo - move this to its own worker

import express from 'express';
import {PoolClient} from 'pg';
import {Client as ESClient} from '@elastic/elasticsearch';

import ImportController from './controller';
import {GoogleImporter} from './google';
import {CredentialsRepository} from '../account_linking';
import {jwtCookieAuth} from '../lib/auth/jwt_auth/jwt_cookie_auth_middleware';
import DocsRepository from '../docs/repository';
import {AtlassianImporter} from './atlassian';

const importRoutes = (pc: PoolClient, es: ESClient) => {
  let router = express.Router();

  let credsRepo = new CredentialsRepository(pc);
  let docsRepo = new DocsRepository(es);

  const google = new GoogleImporter(credsRepo);
  const atlassian = new AtlassianImporter(credsRepo);

  const googleImportController = new ImportController(google, docsRepo);
  const atlassianImportController = new ImportController(atlassian, docsRepo);

  router
    .get('/googledocs', jwtCookieAuth, googleImportController.importDocs)
    .get('/atlassiandocs', jwtCookieAuth, atlassianImportController.importDocs);

  return router;
};

export default importRoutes;
