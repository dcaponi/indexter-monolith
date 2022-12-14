import axios from 'axios';
import {Credentials, Integration} from '.';

export default class AtlassianIntegration implements Integration {
  public source = 'atlassian';
  public authUrl: string;

  constructor() {
    let scope = `scope=${encodeURIComponent([].join(' '))}`;

    let auth_base_url = process.env.MICROSOFT_AUTH_URL;
    let clientId = `client_id=${process.env.MICROSOFT_CLIENT_ID}`;
    let redirect_uri = `redirect_uri=${process.env.MICROSOFT_CALLBACK_URL}`;
    let audience = ``;
    let state = `state=todo_something_pkceish`; //todo generate this and validate it on /code request
    let response_type = `response_type=code`;
    let prompt = `prompt=consent`;

    this.authUrl = `${auth_base_url}?${clientId}&${scope}&${redirect_uri}&${audience}&${state}&${response_type}&${prompt}`;
  }

  async codeToCreds(code: string): Promise<Credentials | null> {
    try {
      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
