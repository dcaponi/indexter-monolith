import express from 'express';
import {PoolClient} from 'pg';
import {
  CredentialsRepository,
  GoogleIntegration,
  AtlassianIntegration,
  SlackIntegration,
  IntegrationController,
  Links,
} from '.';
import {Request, Response, NextFunction} from 'express-serve-static-core';
import {jwtCookieAuth} from '../lib/auth/jwt_auth/jwt_cookie_auth_middleware';

const accountLinkingRoutes = (pc: PoolClient) => {
  let router = express.Router();

  const googleIntegration = new GoogleIntegration();
  const atlassianIntegration = new AtlassianIntegration();
  const slackIntegration = new SlackIntegration();
  const credentialsRepository = new CredentialsRepository(pc);

  const googleIntegrationController = new IntegrationController(
    googleIntegration,
    credentialsRepository
  );
  const atlassianIntegrationController = new IntegrationController(
    atlassianIntegration,
    credentialsRepository
  );
  const slackIntegrationController = new IntegrationController(
    slackIntegration,
    credentialsRepository
  );

  router
    .get(
      '/code/google',
      googleIntegrationController.exchangeAuthCode
    )
    .get(
      '/code/atlassian',
      atlassianIntegrationController.exchangeAuthCode
    )
    .get('/code/slack', slackIntegrationController.exchangeAuthCode)
    .get(
      '/links',
      jwtCookieAuth,
      async (req: Request, res: Response, next: NextFunction) => {
        let email: string = res.locals.loggedInUser.email;
        let links: Links = {
          google: {
            linkURL: googleIntegration.generateAuthUrl(res.locals.loggedInUser.email),
            linked: false,
          },
          atlassian: {
            linkURL: atlassianIntegration.generateAuthUrl(res.locals.loggedInUser.email),
            linked: false,
          },
          slack: {
            linkURL: slackIntegration.authUrl,
            linked: false,
          },
        };
        let creds = await credentialsRepository.find({email});
        creds.forEach(({id, source}) => {
          if (source) {
            links[source as keyof typeof links].linked = true;
          }
        });
        res.status(200).json({message: links});
      }
    );
  return router;
};

export default accountLinkingRoutes;
