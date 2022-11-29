import { Doc } from "../docs";
import { CredentialsRepository } from "../account_linking";
import { Importer } from ".";
import { google } from "googleapis";

type GDoc = {
    data: {
        documentId: string,
        title: string,
        body: { content: Array<Paragraph> }
    }
}

type Paragraph = {
    paragraph: { elements: Array<ParagraphElement> }
}

type ParagraphElement = {
    textRun: { content: string }
}

export class GoogleImporter implements Importer {
    credsRepo: CredentialsRepository;
    importSource = "google";
    googleOauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
    )

    constructor(credsRepo: CredentialsRepository){
        this.credsRepo = credsRepo;
    }
    
    importDocuments = async (email: string): Promise <Doc[] | null > => {
        let creds = (await this.credsRepo.findByUser(email)).filter(cred => cred.source == this.importSource)[0];
        this.googleOauth2Client.setCredentials(creds);
        
        let googleDriveClient = google.drive({ version: "v3", auth: this.googleOauth2Client });
        let googleDocsClient = google.docs({ version: "v1", auth: this.googleOauth2Client });

        let docsRes = await googleDriveClient.files.list({
            "corpora": "user",
            "q": "mimeType = 'application/vnd.google-apps.document'",
            "alt": "json",
            "fields": "files(id, permissions(id))"
        });

        if(docsRes.status != 200) {
            return null
        }

        // todo - handle nextPageToken secondary requests

        let docData = await Promise.all(docsRes.data.files?.filter(f => f.id)
            .map((f) => {
                return googleDocsClient.documents.get({
                    "documentId": f.id!,
                    "fields": "documentId,title,body(content(paragraph(elements(textRun(content)))))"
                })
            }) as Iterable<Promise<GDoc>>);

        return docData.map<Doc>(doc => {
            return {
                id: doc.data.documentId,
                title: doc.data.title,
                source: `https://docs.google.com/document/d/${doc.data.documentId}`,
                content: doc.data.body.content
                    .map((c: { paragraph: any; }) => c.paragraph)
                    .filter((p: any) => p)
                    .map((p: { elements: any; }) => p.elements
                        .filter((e: any) => e && e.textRun && e.textRun.content)
                        .map((e: { textRun: any; }) => e.textRun.content))
                    .join("").split("\n").join("")
            }
        });
    }
}