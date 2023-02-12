import axios from 'axios';
import {Credentials, Integration} from '.';

export default class MicrosoftIntegration implements Integration {
  public source = 'microsoft';
  public authUrl: string;

  constructor() {
    let scope = `scope=${encodeURIComponent([].join(' '))}`;

    let auth_base_url = process.env.MICROSOFT_AUTH_URL;
    let clientId = `client_id=${process.env.MICROSOFT_CLIENT_ID}`;
    let redirect_uri = `redirect_uri=${process.env.MICROSOFT_CALLBACK_URL}`;
    let audience = ``;
    let response_type = `response_type=code`;
    let prompt = `prompt=consent`;

    this.authUrl = `${auth_base_url}?${clientId}&${scope}&${redirect_uri}&${audience}&${response_type}&${prompt}`;
  }

  generateAuthUrl(email: string) {
    this.authUrl += `&state=${email}`;
    return this.authUrl;
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
