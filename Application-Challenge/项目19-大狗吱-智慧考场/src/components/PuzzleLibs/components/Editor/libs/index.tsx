import React, { useEffect, useState } from 'react';
import BraftEditor, { ControlType, MediaType } from 'braft-editor';
import 'braft-editor/dist/index.css';
import { BiG_QUESTION_TYPE, QuestionsEnum, SubItem } from '../../htmlPaper';
import styles from './styles.less';
import {
  Button,
  Form,
  Space,
  InputNumber,
  Checkbox,
  Radio,
  Select,
  Rate,
  Table,
  FormInstance,
  Tooltip,
  Card,
  Dropdown,
  Menu,
  Modal,
  Input,
  Popconfirm,
  Popover,
} from 'antd';
import { useDebounceEffect, useDebounceFn } from 'ahooks';
import lodash from 'lodash';
import {
  DeleteOutlined,
  DownCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  PlusSquareOutlined,
  QuestionCircleOutlined,
  UpCircleOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import { FormListFieldData } from 'antd/lib/form/FormList';
import md5 from 'md5';
import delay from 'delay';
import { swapArrPlaces } from '../../../utils';
import UpFiles, { UP_CONFIG } from './upFiles';

export interface Props {
  /**
   * 是否是子题
   */
  isSubQ?: boolean;
  data?: SubItem;
  bigQId?: string;
  bigQType?: QuestionsEnum | QuestionsEnum[];
  upConfig?: UP_CONFIG;
  /**
   * 是否显示footer 默认true
   */
  footer?: boolean;
  onOk?: (data: SubItem) => any;
  onCancel?: () => void;
  /**
   * 实时修改反馈
   */
  onChange?: (data: SubItem) => void;
}
const controls: ControlType[] = [
  'bold',
  'italic',
  'underline',
  'text-color',
  'separator',
  'separator',
];
const myUploadFn: MediaType['uploadFn'] = (param) => {
  // const onSuccess = (url) => {
  //   param.success({
  //     url,
  //     meta: {
  //       loop: true, // 指定音视频是否循环播放
  //       autoPlay: false, // 指定音视频是否自动播放
  //       controls: true, // 指定音视频是否显示控制栏
  //       poster: url, // 指定视频播放器的封面
  //     }
  //   })
  // }
  // cosHandleUpload({ ...param, onSuccess })
};
/**
 * 是否同步题库
 */
export enum In_Database_Enum {
  '同步到题库' = 1,
  '不同步到题库' = 2,
}
export default function EditorQ(props: Props) {
  const { bigQType, onOk, onCancel } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<SubItem>();
  const [QTypes, setQTypes] = useState<QuestionsEnum[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (props.bigQType) {
      if (Array.isArray(props.bigQType)) {
        setQTypes([...props.bigQType]);
      } else {
        setQTypes([props.bigQType]);
      }
    } else {
      setQTypes([
        QuestionsEnum.单选题,
        QuestionsEnum.多选题,
        QuestionsEnum.判断题,
        QuestionsEnum.问答题,
        // QuestionsEnum.录音题,
        // QuestionsEnum.录像题,
        QuestionsEnum.听力题,
        // QuestionsEnum.复合题,
      ]);
    }
    return () => {};
  }, [props.bigQType]);

  useEffect(() => {
    if (props.data) {
      const _data = lodash.cloneDeep(props.data);
      setData(_data);
      const subFormInfo = {};
      if (_data?.options) {
        _data?.options?.forEach((item) => {
          /**
           * fix 光标bug 会到头部
           */
          if (!form.getFieldValue('description')) {
            lodash.set(
              subFormInfo,
              getSubOptionItemName(_data.id, item.id, 'description'),
              BraftEditor.createEditorState(item.description),
            );
          }
          lodash.set(
            subFormInfo,
            getSubOptionItemName(_data.id, item.id, 'score'),
            item.score,
          );
          lodash.set(
            subFormInfo,
            getSubOptionItemName(_data.id, item.id, 'isRight'),
            item.isRight,
          );
        });
      }
      const initValue = {
        ..._data,
        type: _data?.type,
        difficulty: _data?.difficulty,
        inDatabase: !!_data?.databaseId
          ? [In_Database_Enum.同步到题库]
          : [In_Database_Enum.不同步到题库],
        databaseId: _data?.databaseId,

        description: BraftEditor.createEditorState(_data.description),
        score: _data.score,
        options: _data?.options,
        ...subFormInfo,
      };
      /**
       * fix 光标bug 会到头部
       */
      if (form.getFieldValue('description')) {
        delete initValue.description;
      }
      form.setFieldsValue(initValue);
      setQTypes([props?.data?.type]);
    } else {
      createNewQ(
        (Array.isArray(props.bigQType) ? props.bigQType[0] : props.bigQType) ||
          QuestionsEnum.单选题,
      );
    }
  }, [props.data]);

  const createNewQ = (type: QuestionsEnum) => {
    if (props.data) {
      return;
    }
    const newQ: SubItem = {
      id: md5(`new_minQ_${new Date().toISOString()}`),
      type: type || QuestionsEnum.单选题,
      difficulty: 1,
      description: '',
      score: undefined,
      options: [],
      recordDuration: 0,
      recordCount: 0,
      answerType: 2,
      media: undefined,
      scoreRule: undefined,
      subs: undefined,
    };
    setData(newQ);
    form.setFieldsValue(newQ);
  };

  const { run: handleOk } = useDebounceFn(
    (cb: Props['onOk'] | Props['onChange']) => {
      try {
        const _data = lodash.cloneDeep(data);
        if (lodash.isEmpty(_data)) {
          return;
        }
        const fromData = form.getFieldsValue();
        const values = formDataConversion(lodash.cloneDeep(fromData));
        console.log('handleOk: == ', values);
        _data && cb && cb(values);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    {
      wait: 100,
    },
  );

  const formDataConversion = (fromData: any = {}): SubItem => {
    let _description = '';
    let _options: SubItem['options'] = undefined;
    let _media: SubItem['media'] = [];
    if (fromData.description) {
      if (fromData.description && fromData.description?.toText) {
        _description = fromData.description?.toText();
      } else {
        _description = fromData.description;
      }
    }
    if (fromData.description) {
      if (fromData.description && fromData.description?.toText) {
        _description = fromData.description?.toText();
      } else {
        _description = fromData.description;
      }
    }

    if (!lodash.isEmpty(fromData.options)) {
      _options = fromData.options?.map((item: any) => {
        let _score = lodash.get(
          fromData,
          getSubOptionItemName(fromData.id, item.id, 'score'),
        );
        let _isRight = lodash.get(
          fromData,
          getSubOptionItemName(fromData.id, item.id, 'isRight'),
        );
        let _description = lodash.get(
          fromData,
          getSubOptionItemName(fromData.id, item.id, 'description'),
        );
        if (_description?.toText) {
          _description = _description?.toText();
        }
        return {
          ...item,
          id: item.id,
          score: lodash.isEmpty(_score)
            ? undefined
            : lodash.toNumber(_score).toFixed(2),
          isRight: !!_isRight,
          description: lodash.isEmpty(_description) ? undefined : _description,
        };
      });
    }

    if (!lodash.isEmpty(fromData.media)) {
      _media = fromData.media?.map((item: any) => {
        return {
          ...item,
          playCount: fromData.playCount || 0,
        };
      });
    }
    return {
      id: fromData.id,
      type: fromData.type,
      databaseId: fromData.databaseId,
      databaseName: fromData.databaseName,
      difficulty: fromData.difficulty,
      score: fromData.score,
      description: _description,
      scoreRule: fromData.scoreRule,
      media: _media,
      options: _options,
      recordDuration: fromData.recordDuration,
      recordCount: fromData.recordCount,
      playCount: fromData.playCount,
      answerType: fromData.answerType,
      subs: fromData.subs,
      referenceVersion: fromData.referenceVersion,
      userValue: fromData.userValue,
      sign: fromData.sign,
    };
  };

  return (
    <div className={styles.EditorQWrap}>
      <div className={styles.containerbody}>
        <Form
          form={form}
          onFieldsChange={(changeFields) => {
            props.onChange && handleOk(props.onChange);
          }}
          onValuesChange={(changedValues) => {
            props.onChange && handleOk(props.onChange);
          }}
        >
          <div className={styles.hideFormItem}>
            <Form.Item noStyle label="选择id：" name="id">
              <Input />
            </Form.Item>
          </div>
          {/* <div className={props.data ? styles.hideFormItem : "" }> */}
          <div>
            <Form.Item label="选择题型：" name="type" required rules={[]}>
              <div>
                <Space>
                  {QTypes.map((item) => {
                    return (
                      <Button
                        size="small"
                        key={QuestionsEnum[item]}
                        type={data?.type === item ? 'primary' : 'default'}
                        onClick={() => {
                          createNewQ(item);
                        }}
                      >
                        {QuestionsEnum[item]?.replace('题', '')}
                      </Button>
                    );
                  })}
                </Space>
              </div>
            </Form.Item>
            <div className={props.isSubQ && styles.hideFormItem}>
              <Space>
                <Form.Item
                  label="选择难度："
                  name="difficulty"
                  required
                  rules={[]}
                >
                  <Rate allowClear={false} style={{ marginTop: -6 }} />
                </Form.Item>
                <Form.Item>
                  <Popover
                    content={
                      <div>
                        <div>
                          <Space>
                            <span>一星：</span>
                            <span>简单</span>
                          </Space>
                        </div>
                        <div>
                          <Space>
                            <span>二星：</span>
                            <span>一般</span>
                          </Space>
                        </div>
                        <div>
                          <Space>
                            <span>三星：</span>
                            <span>普通</span>
                          </Space>
                        </div>
                        <div>
                          <Space>
                            <span>四星：</span>
                            <span>困难</span>
                          </Space>
                        </div>
                        <div>
                          <Space>
                            <span>五星：</span>
                            <span>特难</span>
                          </Space>
                        </div>
                      </div>
                    }
                  >
                    <QuestionCircleOutlined style={{ color: '#bbb' }} />
                  </Popover>
                </Form.Item>
              </Space>
            </div>
          </div>
          {data && data?.type === QuestionsEnum.单选题 && (
            <RadioQForEditor
              bigQId={props.bigQId}
              isSubQ={props.isSubQ || false}
              form={form}
              data={data}
              upConfig={props.upConfig}
            />
          )}
          {data && data?.type === QuestionsEnum.判断题 && (
            <YesNoQForEditor
              bigQId={props.bigQId}
              isSubQ={props.isSubQ || false}
              form={form}
              data={data}
              upConfig={props.upConfig}
            />
          )}
          {data && data?.type === QuestionsEnum.多选题 && (
            <CheckBoxQForEditor
              bigQId={props.bigQId}
              isSubQ={props.isSubQ || false}
              form={form}
              data={data}
              upConfig={props.upConfig}
            />
          )}
          {data && data?.type === QuestionsEnum.问答题 && (
            <InputQForEditor
              bigQId={props.bigQId}
              isSubQ={props.isSubQ || false}
              form={form}
              data={data}
              upConfig={props.upConfig}
            />
          )}
          {data && data?.type === QuestionsEnum.录音题 && (
            <RecordAudioQForEditor
              bigQId={props.bigQId}
              isSubQ={props.isSubQ || false}
              form={form}
              data={data}
              upConfig={props.upConfig}
            />
          )}
          {data && data?.type === QuestionsEnum.录像题 && (
            <RecordVideoQForEditor
              bigQId={props.bigQId}
              isSubQ={props.isSubQ || false}
              form={form}
              data={data}
              upConfig={props.upConfig}
            />
          )}
          {data && data?.type === QuestionsEnum.听力题 && (
            <HearingQForEditor
              bigQId={props.bigQId}
              isSubQ={props.isSubQ || false}
              form={form}
              data={data}
              upConfig={props.upConfig}
            />
          )}
          {data && data?.type === QuestionsEnum.复合题 && (
            <CompositeQForEditor
              bigQId={props.bigQId}
              isSubQ={props.isSubQ || false}
              form={form}
              data={data}
              upConfig={props.upConfig}
            />
          )}
          {/* {!props?.data?.type && (
            <>
              <Form.Item
                label="是否同步到题库："
                name="inDatabase"
                required
                rules={[]}
              >
                <Radio.Group>
                  <Radio value={1}>是</Radio>
                  <Radio value={2}>否</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="题库：" name="database" required rules={[]}>
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="选择同步题库"
                  optionFilterProp="children"
                  onSearch={() => {}}
                >
                  <Select.Option value="jack">Jack</Select.Option>
                </Select>
              </Form.Item>
            </>
          )} */}
        </Form>
      </div>
      {props.footer !== false && (
        <div className={styles.footer}>
          <Space>
            <Button
              onClick={() => {
                props?.onCancel && props.onCancel();
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              loading={loading}
              onClick={async () => {
                try {
                  setLoading(true);
                  const err = form.getFieldsError();
                  const fromData = form.getFieldsValue();
                  const dataInfo = formDataConversion(
                    lodash.cloneDeep(fromData),
                  );

                  const isOk = checkSubItemData(dataInfo, props.isSubQ);
                  if (!isOk) {
                    return;
                  }
                  if (err && err.length) {
                  } else {
                  }
                  props.onOk && handleOk(props.onOk);
                  await delay(1000);
                } catch (error) {
                } finally {
                  setLoading(false);
                }
                // const okList = lodash
                //   .uniqBy(selectList, 'id')
                //   .map((item, index) => {
                //     return {
                //       ...item,
                //       /**
                //        * 生成唯一id
                //        */
                //       id: md5(`${item.id}_${new Date().toISOString()}_${index}`),
                //     };
                //   });
                // props?.onOk && props.onOk(okList);
              }}
            >
              确定
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
}

export interface RadioQForEditorProps {
  /**
   * 是否是子题
   */
  isSubQ?: boolean;
  bigQId?: string;
  form: FormInstance;
  data: SubItem;
  upConfig?: UP_CONFIG;
}
/**
 * 单选编辑
 * @param props
 * @returns
 */
export function RadioQForEditor(props: RadioQForEditorProps) {
  const form = props.form;
  const data = props.data;
  const MIX_OP = 20;
  const init = async () => {
    await addOption();
    await delay(100);
    await addOption();
    await delay(100);
    await addOption();
    await delay(100);
    await addOption();
  };
  useDebounceEffect(
    () => {
      if (lodash.isEmpty(data.options)) {
        init();
      }
      return () => {};
    },
    [data],
    {
      wait: 300,
    },
  );

  const addOption = (value?: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }
    if (_options?.length >= MIX_OP) {
      Modal.warn({
        title: `最多添加${MIX_OP}个选项`,
      });
    } else {
      const item = {
        id: md5(
          `${data.id}_options_${new Date().toISOString()}_${lodash.random(
            1,
            100,
          )}`,
        ),
        description: value || '',
        isRight: false,
        score: 0,
      };
      _options.push(item);
      const name = getSubOptionItemName(data?.id, item?.id, 'description');
      form.setFieldsValue({
        options: [..._options],
        [name]: BraftEditor.createEditorState(value),
      });
    }
  };

  /**
   * 上移
   * @param id
   */
  const upOptions = (id: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }
    const index = _options.findIndex((i) => i.id === id);
    if (lodash.isNumber(index) && index - 1 >= 0) {
      swapArrPlaces(_options, index, index - 1);
    }
    form.setFieldsValue({
      options: [..._options],
    });
  };

  /**
   * 下移
   * @param id
   */
  const downOptions = (id: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }
    const index = _options.findIndex((i) => i.id === id);
    if (
      lodash.isNumber(index) &&
      _options?.length &&
      index + 1 < _options?.length
    ) {
      swapArrPlaces(_options, index, index + 1);
    }
    form.setFieldsValue({
      options: [..._options],
    });
  };

  const delOptions = (id: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }
    form.setFieldsValue({
      options: [..._options.filter((i) => i.id !== id)],
    });
  };

  return (
    <div>
      <Form.Item
        label={`${props.isSubQ ? '子' : ''}题目`}
        name="description"
        required={!props.isSubQ}
        validateTrigger={['onBlur']}
        rules={[
          () => ({
            validator: (_, value, callback) => {
              if (value.isEmpty()) {
                callback('请输入题目');
              } else {
                callback();
              }
            },
          }),
        ]}
        extra={
          <div>
            {props.upConfig && (
              <div className={styles.upFilesWrap}>
                <UpFiles upConfig={props.upConfig} form={form} data={data} />
              </div>
            )}
          </div>
        }
      >
        <BraftEditor
          className={styles.iptWrap}
          controls={controls}
          placeholder="请输入"
          media={{ uploadFn: myUploadFn }}
        />
      </Form.Item>

      <div className={styles.subOptionWarp}>
        <div className={styles.hideFormItem}>
          <Form.Item noStyle name="options"></Form.Item>
        </div>
        <Form.Item label="选项：" required shouldUpdate>
          {() => {
            const _options = form.getFieldValue('options');
            const columns = [
              {
                title: `最多可添加${MIX_OP}个选项`,
                dataIndex: 'name',
                key: 'name',
                render: (_: any, optionItem: any) => {
                  return (
                    <div className={styles.subQListItemWrap}>
                      <div className={styles.subQListItemBody}>
                        <Form.Item
                          name={getSubOptionItemName(
                            data?.id,
                            optionItem?.id,
                            'description',
                          )}
                          // validateTrigger={['onChange', 'onBlur']}
                          validateTrigger={['onBlur']}
                          required
                          rules={[
                            () => ({
                              validator: (_, value, callback) => {
                                if (value.isEmpty()) {
                                  callback('请输入选项内容');
                                } else {
                                  callback();
                                }
                              },
                            }),
                          ]}
                        >
                          <BraftEditor
                            className={styles.iptWrap}
                            controls={controls}
                            placeholder="请输入"
                            media={{ uploadFn: myUploadFn }}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  );
                },
              },
              {
                title: '操作',
                dataIndex: 'name',
                key: 'name',
                width: 100,
                render: (_: any, optionItem: any) => {
                  return (
                    <div className={styles.subQListItemTools}>
                      <Space>
                        <Tooltip mouseEnterDelay={0.3} title="上移">
                          <a
                            className={styles.toolsItem}
                            onClick={(e) => {
                              e.preventDefault();
                              // 上移
                              upOptions(optionItem.id);
                            }}
                          >
                            <UpCircleOutlined />
                          </a>
                        </Tooltip>
                        <Tooltip mouseEnterDelay={0.3} title="下移">
                          <a
                            className={styles.toolsItem}
                            onClick={(e) => {
                              e.preventDefault();
                              // 下移
                              downOptions(optionItem.id);
                            }}
                          >
                            <DownCircleOutlined />
                          </a>
                        </Tooltip>
                        <Tooltip mouseEnterDelay={0.3} title="删除">
                          <a
                            className={styles.toolsItem}
                            onClick={(e) => {
                              e.preventDefault();
                              // 删除
                              Modal.confirm({
                                title: '确定是否删除该选项？',
                                content: '',
                                onOk: () => {
                                  // 删除
                                  delOptions(optionItem.id);
                                },
                              });
                            }}
                          >
                            <DeleteOutlined />
                          </a>
                        </Tooltip>
                      </Space>
                    </div>
                  );
                },
              },
              {
                title: '正确答案',
                dataIndex: 'name',
                key: 'name',
                width: 100,
                render: (_: any, optionItem: any) => {
                  return (
                    <div className={styles.subQListItemTools}>
                      <Space>
                        <Form.Item
                          name={getSubOptionItemName(
                            data.id,
                            optionItem.id,
                            'isRight',
                          )}
                          validateTrigger={['onChange', 'onBlur']}
                          valuePropName={'checked'}
                          // rules={[
                          //   () => ({
                          //     validator: (_, value, callback) => {
                          //       const isTrue = [..._options].filter((i) => {
                          //         return !form.getFieldValue(
                          //           getSubOptionItemName(
                          //             data.id,
                          //             i.id,
                          //             'isRight',
                          //           ),
                          //         );
                          //       })?.length;
                          //       if (isTrue !== 1) {
                          //         callback('必须有一个正确答案');
                          //       } else {
                          //         callback();
                          //       }
                          //     },
                          //   }),
                          // ]}
                          noStyle
                        >
                          <Radio
                            onChange={async () => {
                              const _o: any = {};
                              [..._options]
                                .filter((i) => i.id !== optionItem.id)
                                .forEach((c) => {
                                  _o[
                                    getSubOptionItemName(
                                      data.id,
                                      c.id,
                                      'isRight',
                                    )
                                  ] = false;
                                });
                              form.setFieldsValue(_o);
                              // await delay(300);
                              form.getFieldsError();
                            }}
                          ></Radio>
                        </Form.Item>
                      </Space>
                    </div>
                  );
                },
              },
            ];
            return (
              <>
                <Table
                  size="small"
                  rowKey={(i) => i?.id}
                  columns={columns}
                  dataSource={_options}
                  pagination={false}
                />
                <div className={styles.addSubQOBtn}>
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        addOption();
                      }}
                      style={{ width: '100%' }}
                      icon={<PlusOutlined />}
                    >
                      添加选项
                    </Button>
                    {/* <Form.ErrorList errors={"errors"} /> */}
                  </Form.Item>
                </div>
              </>
            );
          }}
        </Form.Item>
      </div>

      <Form.Item label="分值：" name="score" required rules={[]}>
        <InputNumber
          max={999.99}
          min={0.01}
          precision={2}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </div>
  );
}

export interface YesNoQForEditorProps {
  /**
   * 是否是子题
   */
  isSubQ?: boolean;
  bigQId?: string;
  form: FormInstance;
  data: SubItem;
  upConfig?: UP_CONFIG;
}
/**
 * 判断题编辑
 * @param props
 * @returns
 */
export function YesNoQForEditor(props: YesNoQForEditorProps) {
  const form = props.form;
  const data = props.data;
  const MIX_OP = 2;

  const init = async () => {
    addOption('正确');
    await delay(100);
    addOption('错误');
  };
  useDebounceEffect(
    () => {
      if (lodash.isEmpty(data.options)) {
        init();
      }
      return () => {};
    },
    [data],
    {
      wait: 300,
    },
  );

  const addOption = (value?: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }
    if (_options.length >= MIX_OP) {
      Modal.warn({
        title: `最多添加${MIX_OP}个选项`,
      });
    } else {
      const item = {
        id: md5(
          `${data.id}_options_${new Date().toISOString()}_${lodash.random(
            1,
            100,
          )}`,
        ),
        description: value || '',
        isRight: false,
        score: 0,
      };
      _options.push(item);
      const name = getSubOptionItemName(data?.id, item?.id, 'description');
      form.setFieldsValue({
        options: [..._options],
        [name]: BraftEditor.createEditorState(value),
      });
    }
  };

  /**
   * 上移
   * @param id
   */
  const upOptions = (id: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }
    const index = _options.findIndex((i) => i.id === id);
    if (lodash.isNumber(index) && index - 1 >= 0) {
      swapArrPlaces(_options, index, index - 1);
    }
    form.setFieldsValue({
      options: [..._options],
    });
  };

  /**
   * 下移
   * @param id
   */
  const downOptions = (id: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }
    const index = _options.findIndex((i) => i.id === id);
    if (
      lodash.isNumber(index) &&
      _options?.length &&
      index + 1 < _options?.length
    ) {
      swapArrPlaces(_options, index, index + 1);
    }
    form.setFieldsValue({
      options: [..._options],
    });
  };

  const delOptions = (id: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }

    form.setFieldsValue({
      options: [..._options.filter((i) => i.id !== id)],
    });
  };
  return (
    <div>
      <Form.Item
        label={`${props.isSubQ ? '子' : ''}题目`}
        name="description"
        required={!props.isSubQ}
        rules={[
          () => ({
            validator: (_, value, callback) => {
              if (value.isEmpty()) {
                callback('请输入题目');
              } else {
                callback();
              }
            },
          }),
        ]}
        extra={
          <div>
            {props.upConfig && (
              <div className={styles.upFilesWrap}>
                <UpFiles upConfig={props.upConfig} form={form} data={data} />
              </div>
            )}
          </div>
        }
      >
        <BraftEditor
          className={styles.iptWrap}
          controls={controls}
          placeholder="请输入"
          media={{ uploadFn: myUploadFn }}
        />
      </Form.Item>

      <div className={styles.subOptionWarp}>
        <div className={styles.hideFormItem}>
          <Form.Item noStyle name="options"></Form.Item>
        </div>
        <Form.Item label="选项：" required shouldUpdate>
          {() => {
            const _options = form.getFieldValue('options');
            const columns = [
              {
                title: `最多可添加${MIX_OP}个选项`,
                dataIndex: 'name',
                key: 'name',
                render: (_: any, optionItem: any) => {
                  return (
                    <div className={styles.subQListItemWrap}>
                      <div className={styles.subQListItemBody}>
                        <Form.Item
                          name={getSubOptionItemName(
                            data?.id,
                            optionItem?.id,
                            'description',
                          )}
                          // validateTrigger={['onChange', 'onBlur']}
                          validateTrigger={['onBlur']}
                          required
                          rules={[
                            () => ({
                              validator: (_, value, callback) => {
                                if (value.isEmpty()) {
                                  callback('请输入选项内容');
                                } else {
                                  callback();
                                }
                              },
                            }),
                          ]}
                        >
                          <BraftEditor
                            className={styles.iptWrap}
                            controls={controls}
                            placeholder="请输入"
                            media={{ uploadFn: myUploadFn }}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  );
                },
              },
              // {
              //   title: '操作',
              //   dataIndex: 'name',
              //   key: 'name',
              //   width: 100,
              //   render: (_: any, optionItem: any) => {
              //     return (
              //       <div className={styles.subQListItemTools}>
              //         <Space>
              //           <Tooltip mouseEnterDelay={0.3} title="上移">
              //             <a
              //               className={styles.toolsItem}
              //               onClick={(e) => {
              //                 e.preventDefault();
              //                 // 上移
              //                 upOptions(optionItem.id);
              //               }}
              //             >
              //               <UpCircleOutlined />
              //             </a>
              //           </Tooltip>
              //           <Tooltip mouseEnterDelay={0.3} title="下移">
              //             <a
              //               className={styles.toolsItem}
              //               onClick={(e) => {
              //                 e.preventDefault();
              //                 // 下移
              //                 downOptions(optionItem.id);
              //               }}
              //             >
              //               <DownCircleOutlined />
              //             </a>
              //           </Tooltip>
              //           <Tooltip mouseEnterDelay={0.3} title="删除">
              //             <a
              //               className={styles.toolsItem}
              //               onClick={(e) => {
              //                 e.preventDefault();
              //                 // 删除
              //                 Modal.confirm({
              //                   title: "确定是否删除该选项？",
              //                   content: "",
              //                   onOk: () => {
              //                     // 删除
              //                     delOptions(optionItem.id);
              //                   }
              //                 })
              //               }}
              //             >
              //               <DeleteOutlined />
              //             </a>
              //           </Tooltip>
              //         </Space>
              //       </div>
              //     );
              //   },
              // },
              {
                title: '正确答案',
                dataIndex: 'name',
                key: 'name',
                width: 100,
                render: (_: any, optionItem: any) => {
                  return (
                    <div className={styles.subQListItemTools}>
                      <Space>
                        <Form.Item
                          name={getSubOptionItemName(
                            data.id,
                            optionItem.id,
                            'isRight',
                          )}
                          validateTrigger={['onChange', 'onBlur']}
                          valuePropName={'checked'}
                          // rules={[
                          //   () => ({
                          //     validator: (_, value, callback) => {
                          //       const isTrue = [..._options].filter((i) => {
                          //         return !form.getFieldValue(
                          //           getSubOptionItemName(
                          //             data.id,
                          //             i.id,
                          //             'isRight',
                          //           ),
                          //         );
                          //       })?.length;
                          //       if (isTrue < 1) {
                          //         callback('必须有一个正确答案');
                          //       } else {
                          //         callback();
                          //       }
                          //     },
                          //   }),
                          // ]}
                          noStyle
                        >
                          <Radio
                            onChange={async () => {
                              const _o: any = {};
                              [..._options]
                                .filter((i) => i.id !== optionItem.id)
                                .forEach((c) => {
                                  _o[
                                    getSubOptionItemName(
                                      data.id,
                                      c.id,
                                      'isRight',
                                    )
                                  ] = false;
                                });
                              form.setFieldsValue(_o);
                              // await delay(300);
                              form.getFieldsError();
                            }}
                          ></Radio>
                        </Form.Item>
                      </Space>
                    </div>
                  );
                },
              },
            ];
            return (
              <>
                <Table
                  size="small"
                  rowKey={(i) => i?.id}
                  columns={columns}
                  dataSource={_options}
                  pagination={false}
                />
              </>
            );
          }}
        </Form.Item>
      </div>

      <Form.Item label="分值：" name="score" required rules={[]}>
        <InputNumber
          max={999.99}
          min={0.01}
          precision={2}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </div>
  );
}

export interface CheckBoxQForEditorProps {
  /**
   * 是否是子题
   */
  isSubQ?: boolean;
  bigQId?: string;
  form: FormInstance;
  data: SubItem;
  upConfig?: UP_CONFIG;
}
/**
 * 多选选编辑
 * @param props
 * @returns
 */
export function CheckBoxQForEditor(props: CheckBoxQForEditorProps) {
  const form = props.form;
  const data = props.data;
  const MIX_OP = 20;

  const init = async () => {
    await addOption();
    await delay(100);
    await addOption();
    await delay(100);
    await addOption();
    await delay(100);
    await addOption();
  };
  useDebounceEffect(
    () => {
      if (lodash.isEmpty(data.options)) {
        init();
      }
      return () => {};
    },
    [data],
    {
      wait: 300,
    },
  );

  const addOption = (value?: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }
    if (_options?.length >= MIX_OP) {
      Modal.warn({
        title: `最多添加${MIX_OP}个选项`,
      });
    } else {
      const item = {
        id: md5(
          `${data.id}_options_${new Date().toISOString()}_${lodash.random(
            1,
            100,
          )}`,
        ),
        description: value || '',
        isRight: false,
        score: 0,
      };
      _options.push(item);
      const name = getSubOptionItemName(data?.id, item?.id, 'description');
      form.setFieldsValue({
        options: [..._options],
        [name]: BraftEditor.createEditorState(value),
      });
    }
  };

  /**
   * 上移
   * @param id
   */
  const upOptions = (id: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }
    const index = _options.findIndex((i) => i.id === id);
    if (lodash.isNumber(index) && index - 1 >= 0) {
      swapArrPlaces(_options, index, index - 1);
    }
    form.setFieldsValue({
      options: [..._options],
    });
  };

  /**
   * 下移
   * @param id
   */
  const downOptions = (id: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }
    const index = _options.findIndex((i) => i.id === id);
    if (
      lodash.isNumber(index) &&
      _options?.length &&
      index + 1 < _options?.length
    ) {
      swapArrPlaces(_options, index, index + 1);
    }
    form.setFieldsValue({
      options: [..._options],
    });
  };

  const delOptions = (id: string) => {
    let _options: SubItem['options'] = form.getFieldValue('options') || [];
    if (!_options) {
      _options = [];
    }

    form.setFieldsValue({
      options: [..._options.filter((i) => i.id !== id)],
    });
  };
  useEffect(() => {
    form.setFieldsValue({
      scoreRule: {
        type: 1,
        score: 0,
      },
    });
  }, []);
  return (
    <div>
      <Form.Item
        label={`${props.isSubQ ? '子' : ''}题目`}
        name="description"
        validateTrigger={['onBlur']}
        required={!props.isSubQ}
        rules={[
          () => ({
            validator: (_, value, callback) => {
              if (value.isEmpty()) {
                callback('请输入题目');
              } else {
                callback();
              }
            },
          }),
        ]}
        extra={
          <div>
            {props.upConfig && (
              <div className={styles.upFilesWrap}>
                <UpFiles upConfig={props.upConfig} form={form} data={data} />
              </div>
            )}
          </div>
        }
      >
        <BraftEditor
          className={styles.iptWrap}
          controls={controls}
          placeholder="请输入"
          media={{ uploadFn: myUploadFn }}
        />
      </Form.Item>
      <div className={styles.subOptionWarp}>
        <div className={styles.hideFormItem}>
          <Form.Item noStyle name="options"></Form.Item>
        </div>
        <Form.Item label="选项：" required shouldUpdate>
          {() => {
            const _options = form.getFieldValue('options');
            const columns = [
              {
                title: `最多可添加${MIX_OP}个选项`,
                dataIndex: 'name',
                key: 'name',
                render: (_: any, optionItem: any) => {
                  return (
                    <div className={styles.subQListItemWrap}>
                      <div className={styles.subQListItemBody}>
                        <Form.Item
                          name={getSubOptionItemName(
                            data?.id,
                            optionItem?.id,
                            'description',
                          )}
                          // validateTrigger={['onChange', 'onBlur']}
                          validateTrigger={['onBlur']}
                          required
                          rules={[
                            () => ({
                              validator: (_, value, callback) => {
                                if (value.isEmpty()) {
                                  callback('请输入选项内容');
                                } else {
                                  callback();
                                }
                              },
                            }),
                          ]}
                        >
                          <BraftEditor
                            className={styles.iptWrap}
                            controls={controls}
                            placeholder="请输入"
                            media={{ uploadFn: myUploadFn }}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  );
                },
              },
              {
                title: '操作',
                dataIndex: 'name',
                key: 'name',
                width: 100,
                render: (_: any, optionItem: any) => {
                  return (
                    <div className={styles.subQListItemTools}>
                      <Space>
                        <Tooltip mouseEnterDelay={0.3} title="上移">
                          <a
                            className={styles.toolsItem}
                            onClick={(e) => {
                              e.preventDefault();
                              // 上移
                              upOptions(optionItem);
                            }}
                          >
                            <UpCircleOutlined />
                          </a>
                        </Tooltip>
                        <Tooltip mouseEnterDelay={0.3} title="下移">
                          <a
                            className={styles.toolsItem}
                            onClick={(e) => {
                              e.preventDefault();
                              // 下移
                              downOptions(optionItem);
                            }}
                          >
                            <DownCircleOutlined />
                          </a>
                        </Tooltip>
                        <Tooltip mouseEnterDelay={0.3} title="删除">
                          <a
                            className={styles.toolsItem}
                            onClick={(e) => {
                              e.preventDefault();
                              // 删除
                              Modal.confirm({
                                title: '确定是否删除该选项？',
                                content: '',
                                onOk: () => {
                                  // 删除
                                  delOptions(optionItem.id);
                                },
                              });
                            }}
                          >
                            <DeleteOutlined />
                          </a>
                        </Tooltip>
                      </Space>
                    </div>
                  );
                },
              },
              {
                title: '正确答案',
                dataIndex: 'name',
                key: 'name',
                width: 100,
                render: (_: any, optionItem: any) => {
                  return (
                    <div className={styles.subQListItemTools}>
                      <Space>
                        <Form.Item
                          name={getSubOptionItemName(
                            data.id,
                            optionItem.id,
                            'isRight',
                          )}
                          validateTrigger={['onChange', 'onBlur']}
                          valuePropName={'checked'}
                          // rules={[
                          //   () => ({
                          //     validator: (_, value, callback) => {
                          //       const isTrue = [..._options].filter((i) => {
                          //         return !form.getFieldValue(
                          //           getSubOptionItemName(
                          //             data.id,
                          //             i.id,
                          //             'isRight',
                          //           ),
                          //         );
                          //       })?.length;
                          //       if (isTrue <= 1) {
                          //         callback('必须多于一个正确答案');
                          //       } else {
                          //         callback();
                          //       }
                          //     },
                          //   }),
                          // ]}
                          noStyle
                        >
                          <Checkbox
                            onChange={async () => {
                              const _o: any = {};
                              // [..._options]
                              //   .filter((i) => i.id !== optionItem.id)
                              //   .forEach((c) => {
                              //     _o[
                              //       getSubOptionItemName(
                              //         data.id,
                              //         c.id,
                              //         'isRight',
                              //       )
                              //     ] = false;
                              //   });
                              form.setFieldsValue(_o);
                              // await delay(300);
                              form.getFieldsError();
                            }}
                          ></Checkbox>
                        </Form.Item>
                      </Space>
                    </div>
                  );
                },
              },
            ];
            return (
              <>
                <Table
                  size="small"
                  rowKey={(i) => i?.id}
                  columns={columns}
                  dataSource={_options}
                  pagination={false}
                />
                <div className={styles.addSubQOBtn}>
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        addOption();
                      }}
                      style={{ width: '100%' }}
                      icon={<PlusOutlined />}
                    >
                      添加选项
                    </Button>
                    {/* <Form.ErrorList errors={"errors"} /> */}
                  </Form.Item>
                </div>
              </>
            );
          }}
        </Form.Item>
      </div>
      <Form.Item label="分值：" name="score" required rules={[]}>
        <InputNumber
          max={999.99}
          min={0.01}
          precision={2}
          style={{ width: '100%' }}
        />
      </Form.Item>
      <Form.Item noStyle name="scoreRule" required rules={[]}></Form.Item>
      <Form.Item label="计分规则：" name="scoreRuleTemp" required rules={[]}>
        <Select
          defaultValue={'1'}
          onChange={() => {
            form.setFieldsValue({
              scoreRule: {
                type: 1,
                score: 0,
              },
            });
          }}
        >
          <Select.Option value={'1'}>多选少选均不得分</Select.Option>
        </Select>
      </Form.Item>
    </div>
  );
}

export interface InputQForEditorProps {
  /**
   * 是否是子题
   */
  isSubQ?: boolean;
  bigQId?: string;
  form: FormInstance;
  data: SubItem;
  upConfig?: UP_CONFIG;
}
/**
 * 问答题编辑
 * @param props
 * @returns
 */
export function InputQForEditor(props: InputQForEditorProps) {
  const form = props.form;
  const data = props.data;

  return (
    <div>
      <Form.Item
        label={`${props.isSubQ ? '子' : ''}题目`}
        name="description"
        validateTrigger={['onBlur']}
        required={!props.isSubQ}
        rules={[
          () => ({
            validator: (_, value, callback) => {
              if (value.isEmpty()) {
                callback('请输入题目');
              } else {
                callback();
              }
            },
          }),
        ]}
        extra={
          <div>
            {props.upConfig && (
              <div className={styles.upFilesWrap}>
                <UpFiles upConfig={props.upConfig} form={form} data={data} />
              </div>
            )}
          </div>
        }
      >
        <BraftEditor
          className={styles.iptWrap}
          controls={controls}
          placeholder="请输入"
          media={{ uploadFn: myUploadFn }}
        />
      </Form.Item>
      <Form.Item label="分值：" name="score" required rules={[]}>
        <InputNumber
          max={999.99}
          min={0.01}
          precision={2}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </div>
  );
}

export interface RecordAudioQForEditorProps {
  /**
   * 是否是子题
   */
  isSubQ?: boolean;
  bigQId?: string;
  form: FormInstance;
  data: SubItem;
  upConfig?: UP_CONFIG;
}
/**
 * 录音题编辑
 * @param props
 * @returns
 */
export function RecordAudioQForEditor(props: RecordAudioQForEditorProps) {
  const form = props.form;
  const data = props.data;
  useEffect(() => {
    console.log('RecordAudioQForEditor', data);
    if (!data?.recordCount || data?.recordCount <= 0) {
      form.setFieldsValue({
        recordCountType: '1',
      });
    } else {
      form.setFieldsValue({
        recordCountType: '2',
      });
    }
  }, [data]);
  return (
    <div>
      <Form.Item
        label={`${props.isSubQ ? '子' : ''}题目`}
        name="description"
        validateTrigger={['onBlur']}
        required={!props.isSubQ}
        rules={[
          () => ({
            validator: (_, value, callback) => {
              if (value.isEmpty()) {
                callback('请输入题目');
              } else {
                callback();
              }
            },
          }),
        ]}
        extra={
          <div>
            {props.upConfig && (
              <div className={styles.upFilesWrap}>
                <UpFiles upConfig={props.upConfig} form={form} data={data} />
              </div>
            )}
          </div>
        }
      >
        <BraftEditor
          className={styles.iptWrap}
          controls={controls}
          placeholder="请输入"
          media={{ uploadFn: myUploadFn }}
        />
      </Form.Item>
      <Form.Item
        label="单次最长录制时间："
        name="recordDuration"
        required
        rules={[]}
      >
        <InputNumber style={{ width: '100%' }} addonAfter={'分'} />
      </Form.Item>
      <Form.Item
        label="可录制次数："
        name="recordCountType"
        required
        rules={[]}
      >
        <Radio.Group
          onChange={(e) => {
            if (e.target.value === '1') {
              form.setFieldsValue({
                recordCount: undefined,
              });
            } else {
              form.setFieldsValue({
                recordCount: 1,
              });
            }
          }}
        >
          <Radio value={'1'}>不限次</Radio>
          <Radio value={'2'}>
            <Form.Item shouldUpdate noStyle required rules={[]}>
              {() => {
                const recordCountType = form.getFieldValue('recordCountType');
                return (
                  <Form.Item noStyle name="recordCount" required rules={[]}>
                    <InputNumber
                      disabled={recordCountType === '1'}
                      min={1}
                      max={10}
                      precision={0}
                      addonAfter={'次'}
                      placeholder="请输入"
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="分值：" name="score" required rules={[]}>
        <InputNumber
          max={999.99}
          min={0.01}
          precision={2}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </div>
  );
}

export interface RecordVideoQForEditorProps {
  /**
   * 是否是子题
   */
  isSubQ?: boolean;
  bigQId?: string;
  form: FormInstance;
  data: SubItem;
  upConfig?: UP_CONFIG;
}
/**
 * 录像题编辑
 * @param props
 * @returns
 */
export function RecordVideoQForEditor(props: RecordVideoQForEditorProps) {
  const form = props.form;
  const data = props.data;
  useEffect(() => {
    console.log('RecordVideoQForEditor', data);
    if (!data?.recordCount || data?.recordCount <= 0) {
      form.setFieldsValue({
        recordCountType: '1',
      });
    } else {
      form.setFieldsValue({
        recordCountType: '2',
      });
    }
  }, [data]);
  return (
    <div>
      <Form.Item
        label={`${props.isSubQ ? '子' : ''}题目`}
        name="description"
        validateTrigger={['onBlur']}
        required={!props.isSubQ}
        rules={[
          () => ({
            validator: (_, value, callback) => {
              if (value.isEmpty()) {
                callback('请输入题目');
              } else {
                callback();
              }
            },
          }),
        ]}
        extra={
          <div>
            {props.upConfig && (
              <div className={styles.upFilesWrap}>
                <UpFiles upConfig={props.upConfig} form={form} data={data} />
              </div>
            )}
          </div>
        }
      >
        <BraftEditor
          className={styles.iptWrap}
          controls={controls}
          placeholder="请输入"
          media={{ uploadFn: myUploadFn }}
        />
      </Form.Item>
      <Form.Item
        label="单次最长录制时间："
        name="recordDuration"
        required
        rules={[]}
      >
        <InputNumber style={{ width: '100%' }} addonAfter={'分'} />
      </Form.Item>
      <Form.Item
        label="可录制次数："
        name="recordCountType"
        required
        rules={[]}
      >
        <Radio.Group
          onChange={(e) => {
            if (e.target.value === '1') {
              form.setFieldsValue({
                recordCount: undefined,
              });
            } else {
              form.setFieldsValue({
                recordCount: 1,
              });
            }
          }}
        >
          <Radio value={'1'}>不限次</Radio>
          <Radio value={'2'}>
            <Form.Item shouldUpdate noStyle required rules={[]}>
              {() => {
                const recordCountType = form.getFieldValue('recordCountType');
                return (
                  <Form.Item noStyle name="recordCount" required rules={[]}>
                    <InputNumber
                      min={1}
                      max={10}
                      precision={0}
                      disabled={recordCountType === '1'}
                      addonAfter={'次'}
                      placeholder="请输入"
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="分值：" name="score" required rules={[]}>
        <InputNumber
          max={999.99}
          min={0.01}
          precision={2}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </div>
  );
}

export enum AddMinQEnum {
  '手动添加' = 1,
  '从题库选择' = 2,
}
export interface CompositeQForEditorProps {
  /**
   * 是否是子题
   */
  isSubQ?: boolean;
  bigQId?: string;
  form: FormInstance;
  data: SubItem;
  upConfig?: UP_CONFIG;
}
/**
 * 复合题编辑
 * @param props
 * @returns
 */
export function CompositeQForEditor(props: CompositeQForEditorProps) {
  const form = props.form;
  const data = props.data;
  const [manualAddQForBID, setManualAddQForBID] = useState<
    string | undefined
  >();
  /**
   * 上移
   * @param id
   */
  const upOptions = (id: string) => {
    const _subs: SubItem[] = form.getFieldValue('subs');
    const index = _subs.findIndex((i) => i.id === id);
    if (lodash.isNumber(index) && index - 1 >= 0) {
      swapArrPlaces(_subs, index, index - 1);
    }
    form.setFieldsValue({
      subs: [..._subs],
    });
  };

  /**
   * 下移
   * @param id
   */
  const downOptions = (id: string) => {
    const _subs: SubItem[] = form.getFieldValue('subs');
    const index = _subs.findIndex((i) => i.id === id);
    if (lodash.isNumber(index) && _subs?.length && index + 1 < _subs?.length) {
      swapArrPlaces(_subs, index, index + 1);
    }
    form.setFieldsValue({
      subs: [..._subs],
    });
  };

  const delOptions = (id: string) => {
    const _subs: SubItem[] = form.getFieldValue('subs');

    form.setFieldsValue({
      subs: [..._subs.filter((i) => i.id !== id)],
    });
  };

  /**
   * 编辑小题
   * @param minQID
   * @param changeData
   */
  const { run: onEditorQMin } = useDebounceFn(
    (minQID: string, changeData: Partial<Omit<SubItem, 'id'>>) => {
      const _subs: SubItem[] = form.getFieldValue('subs') || [];
      const index = _subs?.findIndex((i) => i.id === minQID);
      if (_subs && lodash.isNumber(index) && index > -1) {
        lodash.set(_subs, `[${index}]]`, {
          ...lodash.get(_subs, `[${index}]`, {}),
          ...changeData,
        });
      } else {
        const newQ = {
          type: changeData.type,
          difficulty: 1,
          description: '',
          score: 0,
          media: [],
          options: [],
          subs: [],
          ...changeData,
          id: minQID,
        } as SubItem;
        _subs.push(newQ);
      }
      try {
        form.setFieldsValue({
          subs: _subs,
        });
        form.validateFields(['subs']);
      } catch (error) {}
    },
    {
      wait: 100,
    },
  );

  return (
    <div className={styles.CompositeQForEditor}>
      <Form.Item
        label={`${props.isSubQ ? '子' : ''}题目`}
        name="description"
        validateTrigger={['onBlur']}
        required={!props.isSubQ}
        rules={[
          () => ({
            validator: (_, value, callback) => {
              if (value.isEmpty()) {
                callback('请输入题目');
              } else {
                callback();
              }
            },
          }),
        ]}
        extra={
          <div>
            {props.upConfig && (
              <div className={styles.upFilesWrap}>
                <UpFiles upConfig={props.upConfig} form={form} data={data} />
              </div>
            )}
            <div className={styles.subsQWrap}>
              <div className={styles.hideFormItem}>
                <Form.Item noStyle name={'subs'} />
              </div>
              <Card
                title="子题目"
                extra={
                  <div>
                    <Space>
                      {/* <a className={styles.toolsItem}>
                        <EditOutlined /> 批量修改分值
                      </a> */}
                      <Dropdown
                        trigger={['click']}
                        overlay={
                          <Menu onClick={({ key }) => {}}>
                            <Menu.Item key={`${AddMinQEnum.手动添加}`}>
                              <a
                                onClick={(e) => {
                                  e.preventDefault();
                                  setManualAddQForBID(data.id);
                                }}
                              >
                                手动添加
                              </a>
                            </Menu.Item>
                            {/* <Menu.Item key={`${AddMinQEnum.从题库选择}`}>
                              <a
                                onClick={(e) => {
                                  e.preventDefault();
                                  setQSearchTypeForBigQID(item?.id);
                                }}
                              >
                                从题库选择
                              </a>
                            </Menu.Item> */}
                          </Menu>
                        }
                        placement="bottomCenter"
                        arrow
                      >
                        <a className={styles.toolsItem}>
                          <PlusSquareOutlined /> 添加题目
                        </a>
                      </Dropdown>
                    </Space>
                  </div>
                }
              >
                <Form.Item shouldUpdate noStyle>
                  {() => {
                    const subs = form.getFieldValue('subs');
                    if (!subs) {
                      return undefined;
                    }
                    return subs?.map((subItem: SubItem, index) => {
                      if (!QuestionsEnum[subItem.type]) {
                        return undefined;
                      }
                      return (
                        <div
                          className={styles.EditorQItemWrap}
                          key={subItem.id}
                        >
                          <div className={styles.EditorQItemHeaderWrap}>
                            <Space>
                              <strong>
                                {index + 1} {QuestionsEnum[subItem.type]}
                              </strong>
                              <Tooltip mouseEnterDelay={0.3} title="上移">
                                <a
                                  className={styles.toolsItem}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    // 上移
                                    upOptions(subItem.id);
                                  }}
                                >
                                  <UpCircleOutlined />
                                </a>
                              </Tooltip>
                              <Tooltip mouseEnterDelay={0.3} title="下移">
                                <a
                                  className={styles.toolsItem}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    // 下移
                                    downOptions(subItem.id);
                                  }}
                                >
                                  <DownCircleOutlined />
                                </a>
                              </Tooltip>
                              <Tooltip mouseEnterDelay={0.3} title="删除">
                                <a
                                  className={styles.toolsItem}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    Modal.confirm({
                                      title: '确定是否删除该题？',
                                      content: '',
                                      onOk: () => {
                                        // 删除
                                        delOptions(subItem.id);
                                      },
                                    });
                                  }}
                                >
                                  <DeleteOutlined />
                                </a>
                              </Tooltip>
                            </Space>
                          </div>
                          <EditorQ
                            footer={false}
                            bigQType={data.type}
                            data={subItem}
                            onOk={() => {}}
                            onCancel={() => {}}
                            onChange={(data) => {
                              onEditorQMin(data.id, data);
                            }}
                            upConfig={props?.upConfig}
                          />
                        </div>
                      );
                    });
                  }}
                </Form.Item>
              </Card>
            </div>
          </div>
        }
      >
        <BraftEditor
          className={styles.iptWrap}
          controls={controls}
          placeholder="请输入"
          media={{ uploadFn: myUploadFn }}
        />
      </Form.Item>

      {/* <Form.Item label="分值：" name="score" required rules={[]}>
        <InputNumber style={{ width: '100%' }} />
      </Form.Item> */}
      <Modal
        title="手动添加题目"
        closable
        width={'80%'}
        centered
        visible={!!manualAddQForBID}
        wrapClassName={styles.addQMinModalWrap}
        className={styles.addQMinModalContent}
        onCancel={() => {
          setManualAddQForBID(undefined);
          props?.form?.validateFields(['subs']);
        }}
        afterClose={() => {
          setManualAddQForBID(undefined);
          props?.form?.validateFields(['subs']);
        }}
        destroyOnClose
        cancelText="关闭"
        okText="确定"
        footer={false}
      >
        <div className={styles.body}>
          <EditorQ
            bigQType={[
              QuestionsEnum.判断题,
              QuestionsEnum.单选题,
              QuestionsEnum.多选题,
              QuestionsEnum.问答题,
            ]}
            onOk={(data) => {
              setManualAddQForBID(undefined);
              onEditorQMin(
                md5(
                  `${JSON.stringify(
                    data,
                  )}_${new Date().getTime()}_CompositeQ_minQ`,
                ),
                data,
              );
            }}
            onCancel={() => {
              setManualAddQForBID(undefined);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export interface HearingQForEditorProps {
  /**
   * 是否是子题
   */
  isSubQ?: boolean;
  bigQId?: string;
  form: FormInstance;
  data: SubItem;
  upConfig?: UP_CONFIG;
}
/**
 * 听力题编辑
 * @param props
 * @returns
 */
export function HearingQForEditor(props: HearingQForEditorProps) {
  const form = props.form;
  const data = props.data;
  const [manualAddQForBID, setManualAddQForBID] = useState<
    string | undefined
  >();
  useEffect(() => {
    console.log('RecordVideoQForEditor', data);
    const _playCount = lodash.get(data, `media[0].playCount`);
    if (!_playCount || _playCount <= 0) {
      form.setFieldsValue({
        playCountType: '1',
        playCount: undefined,
      });
    } else {
      form.setFieldsValue({
        playCountType: '2',
        playCount: _playCount,
      });
    }
  }, [data]);
  /**
   * 上移
   * @param id
   */
  const upOptions = (id: string) => {
    const _subs: SubItem[] = form.getFieldValue('subs');
    const index = _subs.findIndex((i) => i.id === id);
    if (lodash.isNumber(index) && index - 1 >= 0) {
      swapArrPlaces(_subs, index, index - 1);
    }
    form.setFieldsValue({
      subs: [..._subs],
    });
  };

  /**
   * 下移
   * @param id
   */
  const downOptions = (id: string) => {
    const _subs: SubItem[] = form.getFieldValue('subs');
    const index = _subs.findIndex((i) => i.id === id);
    if (lodash.isNumber(index) && _subs?.length && index + 1 < _subs?.length) {
      swapArrPlaces(_subs, index, index + 1);
    }
    form.setFieldsValue({
      subs: [..._subs],
    });
  };

  const delOptions = (id: string) => {
    const _subs: SubItem[] = form.getFieldValue('subs');

    form.setFieldsValue({
      subs: [..._subs.filter((i) => i.id !== id)],
    });
  };

  /**
   * 编辑小题
   * @param minQID
   * @param changeData
   */
  const { run: onEditorQMin } = useDebounceFn(
    (minQID: string, changeData: Partial<Omit<SubItem, 'id'>>) => {
      const _subs: SubItem[] = form.getFieldValue('subs') || [];
      const index = _subs?.findIndex((i) => i.id === minQID);
      if (_subs && lodash.isNumber(index) && index > -1) {
        lodash.set(_subs, `[${index}]]`, {
          ...lodash.get(_subs, `[${index}]`, {}),
          ...changeData,
        });
      } else {
        const newQ = {
          type: changeData.type,
          difficulty: 1,
          description: '',
          score: undefined,
          media: [],
          options: [],
          subs: [],
          ...changeData,
          id: minQID,
        } as SubItem;
        _subs.push(newQ);
      }
      try {
        form.setFieldsValue({
          subs: _subs,
        });
        form.validateFields(['subs']);
      } catch (error) {}
    },
    {
      wait: 100,
    },
  );

  return (
    <div className={styles.CompositeQForEditor}>
      <Form.Item
        label={
          <div style={{ minWidth: 30 }}>{`${
            props.isSubQ ? '子' : ''
          }题目`}</div>
        }
        name="description"
        validateTrigger={['onBlur']}
        required={!props.isSubQ}
        rules={[
          () => ({
            validator: (_, value, callback) => {
              if (value.isEmpty()) {
                callback('请输入题目');
              } else {
                callback();
              }
            },
          }),
        ]}
      >
        <BraftEditor
          className={styles.iptWrap}
          controls={controls}
          placeholder="请输入"
          media={{ uploadFn: myUploadFn }}
        />
      </Form.Item>
      <Form.Item colon={false} label={<div style={{ width: 40 }}></div>}>
        <div>
          <Form.Item
            style={{
              marginBottom: 0,
            }}
            colon={false}
            label={
              <span className={styles.labelWrap}>
                上传音频资源: <strong>(请上传mp3文件)</strong>
              </span>
            }
            required
          ></Form.Item>
          <div
            style={{
              marginBottom: 24,
            }}
          >
            {props.upConfig && (
              <UpFiles
                maxCount={1}
                upTypes={['audio']}
                upConfig={props.upConfig}
                form={form}
                data={data}
                upIcons={{
                  audio: <Button size={'small'}>选择</Button>,
                }}
              />
            )}
          </div>
          <Form.Item
            style={{
              marginBottom: 0,
            }}
            colon={false}
            label={
              <span className={styles.labelWrap}>
                可播放次数: <strong>(最大可输入10次)</strong>
              </span>
            }
            name="playCountTypess"
            required
          ></Form.Item>
          <div>
            <Form.Item name="playCountType" required>
              <Radio.Group
                onChange={(e) => {
                  if (e.target.value === '1') {
                    form.setFieldsValue({
                      playCount: undefined,
                    });
                  } else {
                    form.setFieldsValue({
                      playCount: 1,
                    });
                  }
                }}
              >
                <Space direction="vertical">
                  <Radio value={'1'}>
                    <div style={{ marginLeft: 5, height: 34 }}>不限次</div>
                  </Radio>
                  <Space>
                    <Radio value={'2'}></Radio>
                    <Form.Item shouldUpdate noStyle>
                      {() => {
                        const recordCountType =
                          form.getFieldValue('playCountType');
                        return (
                          <Form.Item noStyle name="playCount">
                            <InputNumber
                              min={1}
                              max={10}
                              precision={0}
                              disabled={recordCountType === '1'}
                              addonAfter={'次'}
                              placeholder="请输入"
                            />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                  </Space>
                </Space>
              </Radio.Group>
            </Form.Item>
          </div>
          <div className={styles.subsQWrap}>
            <div className={styles.hideFormItem}>
              <Form.Item noStyle name={'subs'} />
            </div>
            <Card
              title="子题目"
              extra={
                <div>
                  <Space>
                    {/* <a className={styles.toolsItem}>
                      <EditOutlined /> 批量修改分值
                    </a> */}
                    <Dropdown
                      trigger={['click']}
                      overlay={
                        <Menu onClick={({ key }) => {}}>
                          <Menu.Item key={`${AddMinQEnum.手动添加}`}>
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                setManualAddQForBID(data.id);
                              }}
                            >
                              手动添加
                            </a>
                          </Menu.Item>
                          {/* <Menu.Item key={`${AddMinQEnum.从题库选择}`}>
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                setQSearchTypeForBigQID(item?.id);
                              }}
                            >
                              从题库选择
                            </a>
                          </Menu.Item> */}
                        </Menu>
                      }
                      placement="bottomCenter"
                      arrow
                    >
                      <a className={styles.toolsItem}>
                        <PlusSquareOutlined /> 添加题目
                      </a>
                    </Dropdown>
                  </Space>
                </div>
              }
            >
              <Form.Item shouldUpdate noStyle>
                {() => {
                  const subs = form.getFieldValue('subs');
                  if (!subs) {
                    return undefined;
                  }
                  return subs?.map((subItem: SubItem, index) => {
                    if (!QuestionsEnum[subItem.type]) {
                      return undefined;
                    }
                    return (
                      <div className={styles.EditorQItemWrap} key={subItem.id}>
                        <div className={styles.EditorQItemHeaderWrap}>
                          <Space>
                            <strong>
                              {index + 1} {QuestionsEnum[subItem.type]}
                            </strong>
                            <Tooltip mouseEnterDelay={0.3} title="上移">
                              <a
                                className={styles.toolsItem}
                                onClick={(e) => {
                                  e.preventDefault();
                                  // 上移
                                  upOptions(subItem.id);
                                }}
                              >
                                <UpCircleOutlined />
                              </a>
                            </Tooltip>
                            <Tooltip mouseEnterDelay={0.3} title="下移">
                              <a
                                className={styles.toolsItem}
                                onClick={(e) => {
                                  e.preventDefault();
                                  // 下移
                                  downOptions(subItem.id);
                                }}
                              >
                                <DownCircleOutlined />
                              </a>
                            </Tooltip>
                            <Tooltip mouseEnterDelay={0.3} title="删除">
                              <a
                                className={styles.toolsItem}
                                onClick={(e) => {
                                  e.preventDefault();
                                  // 删除
                                  Modal.confirm({
                                    title: '确定是否删除该题？',
                                    content: '',
                                    onOk: () => {
                                      // 删除
                                      delOptions(subItem.id);
                                    },
                                  });
                                }}
                              >
                                <DeleteOutlined />
                              </a>
                            </Tooltip>
                          </Space>
                        </div>
                        <EditorQ
                          isSubQ={true}
                          footer={false}
                          bigQType={data.type}
                          bigQId={data.id}
                          data={subItem}
                          onOk={() => {}}
                          onCancel={() => {}}
                          onChange={(data) => {
                            onEditorQMin(data.id, data);
                          }}
                          upConfig={props?.upConfig}
                        />
                      </div>
                    );
                  });
                }}
              </Form.Item>
            </Card>
          </div>
        </div>
      </Form.Item>
      {/* <Form.Item label="分值：" name="score" required rules={[]}>
        <InputNumber style={{ width: '100%' }} />
      </Form.Item> */}
      <Modal
        title="手动添加题目"
        closable
        width={'80%'}
        centered
        visible={!!manualAddQForBID}
        wrapClassName={styles.addQMinModalWrap}
        className={styles.addQMinModalContent}
        onCancel={() => {
          setManualAddQForBID(undefined);
          props?.form?.validateFields(['subs']);
        }}
        afterClose={() => {
          setManualAddQForBID(undefined);
          props?.form?.validateFields(['subs']);
        }}
        destroyOnClose
        cancelText="关闭"
        okText="确定"
        footer={false}
      >
        <div className={styles.body}>
          <EditorQ
            isSubQ={true}
            bigQType={[
              QuestionsEnum.判断题,
              QuestionsEnum.单选题,
              QuestionsEnum.多选题,
              QuestionsEnum.问答题,
            ]}
            onOk={(data) => {
              setManualAddQForBID(undefined);
              onEditorQMin(
                md5(
                  `${JSON.stringify(
                    data,
                  )}_${new Date().getTime()}_HearingQ_minQ`,
                ),
                data,
              );
            }}
            onCancel={() => {
              setManualAddQForBID(undefined);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

/**
 *
 * @param qID 题id
 * @param oID 选项id
 * @param tag 备注
 */
function getSubOptionItemName(
  qID: string,
  oID: string,
  tag?: 'description' | 'isRight' | 'score',
) {
  return `optionItem_Qid_${qID}_Oid_${oID}_${tag}`;
}

/**
 * 检查题目数据是否正确
 * @param dataInfo
 * @param isSubQ 是否是子题
 * @returns
 */
export function checkSubItemData(dataInfo: SubItem, isSubQ?: boolean) {
  let isOk = true;
  if (dataInfo) {
    // @ts-ignore
    if (lodash.isEmpty(dataInfo.description) && !isSubQ) {
      isOk = false;
      Modal.warn({
        title: '请填写题目',
      });
      return isOk;
    }
    /**
     * 判断媒体文件是否上传成功
     */
    if (lodash.isArray(dataInfo.media)) {
      const isNotUpM = [...dataInfo.media].filter((i) => !/^http/i.test(i.url));
      if (isNotUpM.length) {
        isOk = false;
        Modal.warn({
          title: '文件上传中/上传失败',
          content: '请检查文件是否上传成功',
        });
        return isOk;
      }
    }

    if (dataInfo.type === QuestionsEnum.单选题) {
      /**
       * 判断分数是否大于0
       */
      if (!dataInfo.score || dataInfo.score <= 0) {
        isOk = false;
        Modal.warn({
          title: '分数必须大于0',
        });
        return isOk;
      }
      if (lodash.isEmpty(dataInfo?.options)) {
        isOk = false;
        Modal.warn({
          title: '请先完善答题选项',
        });
        return isOk;
      }
      if (dataInfo?.options) {
        let err: string[] = [];
        let _isRightNum = 0;
        if (dataInfo?.options.length < 2) {
          err.push('选项应大于等于2个');
        }
        dataInfo?.options.forEach((item) => {
          if (lodash.isEmpty(item.description)) {
            err.push('选项内容未填写');
          }
          if (item.isRight) {
            _isRightNum += 1;
          }
        });
        if (_isRightNum !== 1) {
          err.push('选项只能有一个正确答案');
        }
        err = lodash.uniq(err);
        if (err.length) {
          isOk = false;
          Modal.warn({
            title: '选项未完善',
            content: err.map((item, index) => {
              return <div key={item}>{`${index + 1}. ${item}`}</div>;
            }),
          });
          return isOk;
        }
      }
    }
    if (dataInfo.type === QuestionsEnum.多选题) {
      /**
       * 判断分数是否大于0
       */
      if (!dataInfo.score || dataInfo.score <= 0) {
        isOk = false;
        Modal.warn({
          title: '分数必须大于0',
        });
        return isOk;
      }
      if (lodash.isEmpty(dataInfo?.options)) {
        isOk = false;
        Modal.warn({
          title: '请先完善答题选项',
        });
        return isOk;
      }
      if (dataInfo?.options) {
        let err: string[] = [];
        let _isRightNum = 0;
        if (dataInfo?.options.length < 3) {
          err.push('选项应大于等于3个');
        }
        dataInfo?.options.forEach((item) => {
          if (lodash.isEmpty(item.description)) {
            err.push('选项内容未填写');
          }
          if (item.isRight) {
            _isRightNum += 1;
          }
        });
        if (_isRightNum < 2) {
          err.push('选项正确答案应大于等于2个');
        }
        if (lodash.isEmpty(dataInfo.scoreRule)) {
          err.push('请选择计分规则');
        }
        err = lodash.uniq(err);
        if (err.length) {
          isOk = false;
          Modal.warn({
            title: '选项未完善',
            content: err.map((item, index) => {
              return <div key={item}>{`${index + 1}. ${item}`}</div>;
            }),
          });
          return isOk;
        }
      }
    }
    if (dataInfo.type === QuestionsEnum.判断题) {
      /**
       * 判断分数是否大于0
       */
      if (!dataInfo.score || dataInfo.score <= 0) {
        isOk = false;
        Modal.warn({
          title: '分数必须大于0',
        });
        return isOk;
      }
      if (lodash.isEmpty(dataInfo?.options)) {
        isOk = false;
        Modal.warn({
          title: '请先完善答题选项',
        });
        return isOk;
      }
      if (dataInfo?.options) {
        let err: string[] = [];
        let _isRightNum = 0;
        if (dataInfo?.options.length < 2) {
          err.push('选项应大于等于2个');
        }
        dataInfo?.options.forEach((item) => {
          if (lodash.isEmpty(item.description)) {
            err.push('选项内容未填写');
          }
          if (item.isRight) {
            _isRightNum += 1;
          }
        });
        if (_isRightNum !== 1) {
          err.push('选项只能有一个正确答案');
        }
        err = lodash.uniq(err);
        if (err.length) {
          isOk = false;
          Modal.warn({
            title: '选项未完善',
            content: err.map((item, index) => {
              return <div key={item}>{`${index + 1}. ${item}`}</div>;
            }),
          });
          return isOk;
        }
      }
    }
    if (dataInfo.type === QuestionsEnum.问答题) {
      /**
       * 判断分数是否大于0
       */
      if (!dataInfo.score || dataInfo.score <= 0) {
        isOk = false;
        Modal.warn({
          title: '分数必须大于0',
        });
        return isOk;
      }
    }
    if (dataInfo.type === QuestionsEnum.听力题) {
      if (lodash.isEmpty(dataInfo.media)) {
        isOk = false;
        Modal.warn({
          title: '听力题未上传音频',
        });
        return isOk;
      }
      if (lodash.isArray(dataInfo.media)) {
        const isNotUpM = [...dataInfo.media].filter(
          (i) => !/^http/i.test(i.url),
        );
        if (isNotUpM.length) {
          isOk = false;
          Modal.warn({
            title: '听力题正在上传音频',
          });
          return isOk;
        }
      }
      if (dataInfo?.media?.length != 1) {
        isOk = false;
        Modal.warning({
          title: '听力题只能有一份音频文件',
        });
        return isOk;
      }
      if (lodash.isEmpty(dataInfo.subs)) {
        isOk = false;
        Modal.warn({
          title: '听力题子题目必填',
        });

        return isOk;
      }
      if (dataInfo.subs) {
        let _scoreList: any[] = [];
        dataInfo.subs?.forEach((item) => {
          if (!item.score) {
            _scoreList.push(item);
          }
        });
        if (!lodash.isEmpty(_scoreList)) {
          isOk = false;
          Modal.warn({
            title: '子题分数必须大于0',
          });
          return isOk;
        }
        let subErr = false;
        dataInfo.subs.forEach((item) => {
          const err = checkSubItemData(item, true);
          if (!err) {
            subErr = true;
          }
        });
        if (subErr) {
          isOk = false;
          return isOk;
        }
      }
    }

    if (dataInfo.type === QuestionsEnum.复合题) {
      if (lodash.isEmpty(dataInfo.subs)) {
        isOk = false;
        Modal.warn({
          title: '听力题子题目必填',
        });
        return isOk;
      }
      if (dataInfo.subs) {
        let _scoreList: any[] = [];
        dataInfo.subs?.forEach((item) => {
          if (!item.score) {
            _scoreList.push(item);
          }
        });
        if (!lodash.isEmpty(_scoreList)) {
          isOk = false;
          Modal.warn({
            title: '子题分数必须大于0',
          });
          return isOk;
        }
      }
    }
  }
  return isOk;
}
