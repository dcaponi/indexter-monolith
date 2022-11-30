import {Client as ESClient} from '@elastic/elasticsearch';
import {ErrorCause} from '@elastic/elasticsearch/lib/api/types';

import {Doc} from '.';
import {OwnedESIndexBaseRepository} from '../lib/repository';

type ESResult = 'created' | 'updated' | 'deleted' | 'not_found' | 'noop';

export default class DocsRepository extends OwnedESIndexBaseRepository<
  Doc | ESResult
> {
  pc: ESClient;
  idx: string;
  constructor(pc: ESClient) {
    super();
    this.pc = pc;
    this.idx = process.env.DOCS_INDEX || 'docs';
  }

  async create(owner: string, item: Doc): Promise<ESResult> {
    let doc = await this.pc.index({
      index: owner + '_' + this.idx,
      id: item.id,
      document: item,
    });
    return doc.result;
  }

  async bulkCreate(owner: string, items: Doc[]): Promise<ESResult> {
    let ops = items.flatMap(doc => [
      {index: {_index: owner + '_' + this.idx, _id: doc.id}},
      doc,
    ]);
    let bulkResponse = await this.pc.bulk({refresh: true, operations: ops});
    if (bulkResponse.errors) {
      let erroredDocs: {status: number; error: ErrorCause}[] = [];
      bulkResponse.items.forEach((action, i) => {
        if (action.create?.error) {
          erroredDocs.push({
            status: action.create.status,
            error: action.create.error,
          });
        }
      });
      console.log(`unable to index ${erroredDocs.length} docs: `, erroredDocs);
    }
    return 'created';
  }

  async find(owner: string, item: Doc): Promise<Doc[]> {
    let res = await this.pc.search<Doc>({
      index: owner + '_' + this.idx,
      query: {
        multi_match: {
          query: `${item.title} ${item.content}`,
          fields: ['title', 'content'],
        },
      },
    });
    return res.hits.hits.map(hit => hit._source as Doc);
  }

  async findOne(owner: string, id: string): Promise<Doc> {
    let res = await this.pc.get<Doc>({
      index: owner + '_' + this.idx,
      id: id,
    });
    return res._source as Doc;
  }
}
