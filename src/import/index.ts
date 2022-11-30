import {Doc} from '../docs';

export interface Importer {
  /*
    @async
    @returns {Promise<Doc[] | null>} - Returns a list of the documents exfiltrated or nothing if there was an issue
    */
  importDocuments(email: string): Promise<Doc[] | null>;
}
