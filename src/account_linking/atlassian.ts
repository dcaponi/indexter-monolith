import axios from 'axios';
import { Credentials, Integration } from ".";

export default class AtlassianIntegration implements Integration {
    public source = "atlassian";
    public authUrl: string;

    constructor() {
        let scope = `scope=${encodeURIComponent([
            "read:page:confluence",
            "read:confluence-space.summary",
            "read:confluence-content.summary",
            "read:confluence-content.all",
            "read:confluence-props",
            "read:blogpost:confluence",
            "read:content:confluence",
            "read:custom-content:confluence",
            "read:content-details:confluence",
            "read:content.metadata:confluence",
            "search:confluence",
            "offline_access"
        ].join(" "))}`;

        let auth_base_url = process.env.ATLASSIAN_AUTH_URL
        let clientId = `client_id=${process.env.ATLASSIAN_CLIENT_ID}`
        let redirect_uri = `redirect_uri=${process.env.ATLASSIAN_CALLBACK_URL}`
        let audience = `audience=api.atlassian.com`
        let state = `state=todo_something_pkceish` //todo generate this and validate it on /code request
        let response_type = `response_type=code`
        let prompt = `prompt=consent`

        this.authUrl = `${auth_base_url}?${clientId}&${scope}&${redirect_uri}&${audience}&${state}&${response_type}&${prompt}`
    };

    async codeToCreds(code: string): Promise<Credentials | null> {
        try {
            let r = await axios.post<Credentials>(process.env.ATLASSIAN_TOKEN_URL || "",
                {
                    "grant_type": "authorization_code",
                    "client_id": process.env.ATLASSIAN_CLIENT_ID,
                    "client_secret": process.env.ATLASSIAN_CLIENT_SECRET,
                    "redirect_uri": process.env.ATLASSIAN_CALLBACK_URL,
                    code
                },
                {
                    headers: { "Content-Type": 'application/json' },
                })
            
            let creds = r.data;
            creds.source = this.source;
            creds.expiry_date = Date.now() + ((creds.expires_in || 0) * 1000)
            return creds;
            
        } catch (e) {
            console.log(e);
            return null;
        }
    }
}