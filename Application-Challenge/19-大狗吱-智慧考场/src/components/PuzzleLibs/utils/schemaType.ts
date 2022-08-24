import { JSONSchemaType } from 'ajv';
import { SubItem } from '../components/htmlPaper';

export const SubItemSchema: JSONSchemaType<SubItem> = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    difficulty: {
      type: 'number',
    },
    score: {
      type: 'number',
    },
    media: {
      nullable: true,
      type: 'array',
    },
    options: {
      nullable: true,
      type: 'array',
    },
    recordDuration: {
      nullable: true,
      type: 'number',
    },
    recordCount: {
      nullable: true,
      type: 'number',
    },
    playCount: {
      nullable: true,
      type: 'number',
    },
    answerType: {
      nullable: true,
      type: 'number',
    },
    subs: {
      nullable: true,
      type: 'array',
    },
  },
  required: [],
  additionalProperties: true,
};
