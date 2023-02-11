import {google} from 'googleapis';
import {Credentials, Integration} from '.';

export default class GoogleIntegration implements Integration {
  public source = 'google';
  public authUrl: string;

  private googleOauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  constructor() {
    this.authUrl = ""
  }

  generateAuthUrl(email: string){
    this.authUrl = this.googleOauth2Client.generateAuthUrl({
      scope: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/documents.readonly',
      ],
      include_granted_scopes: true,
      access_type: 'offline',
      prompt: 'consent',
      state: email,
    });
    return this.authUrl
  }

  async codeToCreds(code: string): Promise<Credentials | null> {
    console.log(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    let {tokens} = await this.googleOauth2Client.getToken(code);
    return {source: this.source, ...tokens};
  }
}
