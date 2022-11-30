import CredentialsRepository from './repository';
import GoogleIntegration from './google';
import AtlassianIntegration from './atlassian';
import SlackIntegration from './slack';
import IntegrationController from './controller';

interface Integration {
  /*
        @async
        @param {string} - the code usually given as a query string parameter in response to users agreeing to your app integration to the data provider
        @returns {Promise<Credentials>} - the Credential containing important info like access_token and refresh_token
    */
  codeToCreds(code: string): Promise<Credentials | null>;
  authUrl: string; // the auth url we'll send to the frontend for users to click and be taken to the authorization prompt
  source: string; // the sourcename of the integration - used to associate token response back to an integration
}

type Credentials = {
  id?: string | null;
  email?: string | null;
  alt_user_id?: string | null;
  source?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
  expires_in?: number | null;
  access_token?: string | null;
  token_type?: string | null;
  id_token?: string | null;
  scope?: string;
};

type Links = {
  google: Link;
  atlassian: Link;
  slack: Link;
};

type Link = {
  linkURL: string;
  linked: boolean;
};

export {
  Credentials,
  CredentialsRepository,
  GoogleIntegration,
  AtlassianIntegration,
  SlackIntegration,
  Integration,
  IntegrationController,
  Links,
};
