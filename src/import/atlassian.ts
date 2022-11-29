import axios, { AxiosError } from "axios";
import { Doc } from "../docs";
import { Credentials, CredentialsRepository } from "../account_linking";
import { Importer } from ".";
import { removeTags } from "../lib/util";
import { time } from "console";

type AtlassianDoc = {
    id: string;
    type: string;
    status: string;
    title: string;
    body: { view: { value: string; }; };
    _links: { webui: string };
}

export class AtlassianImporter implements Importer {
    credsRepo: CredentialsRepository;
    importSource = "atlassian";
    constructor(credsRepo: CredentialsRepository){
        this.credsRepo = credsRepo;
    }

    importDocuments = async (email: string): Promise < Doc[] | null > => {
        let creds = (await this.credsRepo.findByUser(email)).filter(cred => cred.source == this.importSource)[0];
        if (!creds){
            return null;
        }
        if(!creds.expiry_date || creds.expiry_date < Date.now()) {
            creds = await this.refreshAccessToken(creds);
        }
        try {
            let headers = {
                Authorization: `Bearer ${creds.access_token}`,
                Accept: 'application/json',
                ContentType: 'application/json'
            }
            let tenants: {id: string, url: string, name: string}[] = (await axios.get("https://api.atlassian.com/oauth/token/accessible-resources", {headers})).data;

            return (await Promise.all(tenants.map(async (t) => {
                let [pageRes, blogRes] = await Promise.all([
                    axios.get(`https://api.atlassian.com/ex/confluence/${t.id}/wiki/rest/api/content?expand=body.view&type=page`, { headers }),
                    axios.get(`https://api.atlassian.com/ex/confluence/${t.id}/wiki/rest/api/content?expand=body.view&type=blogpost`, { headers })
                ]);
                return pageRes.data.results
                    .concat(blogRes.data.results)
                    .map((r: AtlassianDoc): Doc => {
                        return {
                            id: r.id,
                            source: `${t.url}/wiki${r._links.webui}`,
                            content: removeTags(r.body.view.value).replace(/\s\s+/g, ' '),
                            title: r.title,
                        }
                    })
            }))).reduce((acc, n) => acc.concat(n))
        } catch(e) {
            let err = e as AxiosError;
            if (err.code == AxiosError.ERR_BAD_REQUEST){
                this.refreshAccessToken(creds);
                return await this.importDocuments(email);
            }
            return null
        }
    }

    private refreshAccessToken = async (creds: Credentials): Promise<Credentials> => {
        let r = await axios.post<Credentials>(process.env.ATLASSIAN_TOKEN_URL || "",
            {
                "grant_type": "refresh_token",
                "client_id": process.env.ATLASSIAN_CLIENT_ID,
                "client_secret": process.env.ATLASSIAN_CLIENT_SECRET,
                "refresh_token": creds.refresh_token
            },
            {
                headers: { "Content-Type": 'application/json' },
            }
        )
        creds.access_token = r.data.access_token;
        return await this.credsRepo.update(creds.id || '', creds);
    }
}

