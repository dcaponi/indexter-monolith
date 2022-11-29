import { Request, Response, NextFunction } from 'express';
import { Importer } from '.';
import DocsRepository from '../docs/repository';

export default class ImportController {
    importer: Importer;
    docsRepo: DocsRepository;

    constructor(importer: Importer, docsRepo: DocsRepository) {
        this.importer = importer;
        this.docsRepo = docsRepo;
    }
    importDocs = async (req: Request, res: Response, next: NextFunction) => {
        let email = res.locals.loggedInUser.email;

        let docs = await this.importer.importDocuments(email);

        if (!docs) {
            return res.status(500).json({
            message: `unable to reach document source`
            })
        } else {
            this.docsRepo.bulkCreate(email, docs)
            // todo return a status ding dong for the client to poll
            return res.status(200).json({
                message: `indexed ${docs.length} documents`
            })
        }
    }
}