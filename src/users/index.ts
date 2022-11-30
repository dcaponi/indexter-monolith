import {Credentials} from '../account_linking';
import UserController from './controller';
import UserRepository from './repository';

type User = {
  email: string;
  gDriveCreds?: Credentials;
  atlassianCreds?: Credentials;
  slackCreds?: Credentials;
};

export {User, UserController, UserRepository};
