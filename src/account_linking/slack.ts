import axios from 'axios';
import { Credentials, Integration } from ".";

export default class SlackIntegration implements Integration {
    public source = "slack";
    public authUrl: string;

    constructor() {
        let scopes = [
            "commands",
            "app_mentions:read",
            "channels:join",
            "chat:write",
            "users:write",
            "reactions:read"
        ].join(',');

        let userScopes = [].join('')

        this.authUrl = `${process.env.SLACK_AUTH_URL}?client_id=${process.env.SLACK_CLIENT_ID}&scope=${scopes}&user_scope=${userScopes}`
    };

    async codeToCreds(code: string): Promise<Credentials | null> {
        try {
            let params = new URLSearchParams();
            params.append("grant_type", "authorization_code")
            params.append("client_id", process.env.SLACK_CLIENT_ID || "")
            params.append("client_secret", process.env.SLACK_CLIENT_SECRET || "")
            params.append("code", code)
            let r = await axios.post(process.env.SLACK_TOKEN_URL || "", params, { headers: { "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8' } })
            let creds = r.data;
            creds.source = this.source;
            creds.alt_user_id = r.data.team.id
            creds.expiry_date = Date.now() + ((creds.expires_in || 0) * 1000)
            return creds;

        } catch (e) {
            console.log(e);
            return null;
        }
    }
}