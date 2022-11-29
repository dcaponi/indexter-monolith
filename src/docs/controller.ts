import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { CredentialsRepository } from "../account_linking";
import DocsRepository from "./repository";

export default class DocsController {
    docsRepo: DocsRepository;
    credsRepo: CredentialsRepository;
    constructor(credsRepo: CredentialsRepository, docsRepo: DocsRepository) {
        this.docsRepo = docsRepo;
        this.credsRepo = credsRepo;
    }
    // Hack - needed to do this to test the slack command for the demo
    slackSearch = async (req: Request, res: Response, next: NextFunction) => {
        let text = req.body.event ? req.body.event.text : req.body.text;
        let challenge = req.body.challenge || "";
        let teamId = req.body.team_id || req.body.event.team
        
        if (challenge) {
            return res.status(200).json({challenge})
        }

        let creds = await this.credsRepo.find({ alt_user_id: teamId, source: "slack" })
        let cred = creds[0]
        let searchResults = await this.docsRepo.find(cred.email || "", { title: text, content: text, source: '', id: '' })
        
        if (req.body.event && text) {
            try {
                if (searchResults.length > 0) {
                    await axios.post("https://slack.com/api/chat.postMessage",
                        {
                            "text": searchResults.map(r => `<${r.source}|${r.title}>`).join("\n"),
                            "thread_ts": req.body.event.ts,
                            "channel": req.body.event.channel,
                        },
                        {
                            headers: { 
                                "Content-Type": 'application/json',
                                "Authorization": `Bearer ${cred.access_token}` // todo - this should be fetched from the credentials
                            },
                        })
                } else {
                    axios.post("https://slack.com/api/chat.postMessage",
                        {
                            "text": "Sorry - I couldn't find anything on that 🤷‍♀️",
                            "thread_ts": req.body.event.ts,
                            "channel": req.body.event.channel,
                        },
                        {
                            headers: { 
                                "Content-Type": 'application/json',
                                "Authorization": `Bearer ${cred.access_token}`
                            },
                        })
                }
                return res.status(200).json({ message: searchResults })
            } catch (e) {
                console.log(e)
                return res.status(500).json({ message: e })
            }
        } else if (text) {
            if (searchResults.length > 0) {
                return res.status(200).json(searchResults.map(r => `<${r.source}|${r.title}>`).join("  "))
            } else {
                return res.status(200).json("Sorry - I couldn't find anything on that 🤷‍♀️")
            }
        }
        else {
            return res.status(200).json({
                message: "no query given"
            })
        }
    }

    search = async (req: Request, res: Response, next: NextFunction) => {
        let text = req.body.text || req.query.text;
        let owner = res.locals.loggedInUser.email;
        if (text) {
            let searchResults = await this.docsRepo.find(owner, { title: text, content: text, source: '', id: '' })
            if (searchResults.length > 0) {
                return res.status(200).json({ message: searchResults })
            } else {
                return res.status(404).json({ message: "no results that match query found" })
            }
        } else {
            return res.status(200).json({
                message: "no query given"
            })
        }
    }
}