import Ajv, { JSONSchemaType } from 'ajv';
const ajv = new Ajv();

/**
 * 用户信息 json Schema
 */
export const userConfigSchema: JSONSchemaType<UserConfig> = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      pattern: '^([10|11|20|30|40])([0-9]{1,1000})$',
    },
    name: { type: 'string' },
    avatar: { type: 'string' },
    info: { type: 'string' },
  },
  required: ['id', 'name', 'avatar'],
};
/**
 * 用户信息 json type
 */
export type UserConfig = {
  id: number;
  name: string;
  avatar: string;
  info: string;
};
/**
 * 用户例子
 */
export const userDemo = {
  id: 1011,
  name: '大狗吱',
  avatar: '',
  info: '',
};

/**
 * 模板配置json Schema
 */
export const TempConfigSchema: JSONSchemaType<TempConfig> = {
  type: 'object',
  properties: {
    startTime: { type: 'number' },
    endTime: { type: 'number' },
    isDualCamera: { type: 'boolean' },
    getPapersAPIURL: { type: 'string' },
    savePapersAPIURL: { type: 'string' },
  },
  required: [
    'startTime',
    'endTime',
    'isDualCamera',
    'getPapersAPIURL',
    'savePapersAPIURL',
  ],
};

/**
 * 模板配置json type
 */
export type TempConfig = {
  startTime: number;
  endTime: number;
  isDualCamera: boolean;
  getPapersAPIURL: string;
  savePapersAPIURL: string;
};

/**
 * 模板例子
 */
export const defaultTempConfig: TempConfig = {
  startTime: -1,
  endTime: -1,
  isDualCamera: true,
  getPapersAPIURL: '',
  savePapersAPIURL: '',
};

/**
 * 验证 用户json 是否正确
 */
const validateForUser = ajv.compile(userConfigSchema);

if (validateForUser(userDemo)) {
  console.log('validateForUser: ', userDemo);
} else {
  console.log('validateForUser:', validateForUser.errors);
}

/**
 * 验证 模板json 是否正确
 */
const validateForTemp = ajv.compile(TempConfigSchema);
if (validateForTemp(defaultTempConfig)) {
  console.log('validateForTemp: ', defaultTempConfig);
} else {
  console.log('validateForTemp: ', validateForTemp.errors);
}

export default {};
