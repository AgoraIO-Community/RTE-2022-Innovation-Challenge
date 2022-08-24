import {
  Button,
  Form,
  Input,
  Modal,
  Popover,
  Radio,
  Select,
  Space,
  Spin,
} from 'antd';
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  LoadingOutlined,
  NotificationOutlined,
  SwapLeftOutlined,
  SwapRightOutlined,
} from '@ant-design/icons';
import lodash from 'lodash';
import CustomScroll from 'react-custom-scroll';
import { Scrollbars } from 'react-custom-scrollbars';
import 'react-custom-scroll/dist/customScroll.css';
import styles from './styles.less';
import classNames from 'classnames';
import delay from 'delay';
import { v5 as uuidv5 } from 'uuid';
import { ToSystemEnum } from '@hongtangyun/rooms-sdk/dist/socket/types';
import { serverTime, UserRole } from '@/utils';
import { PageProps } from '@/pages/RoomTypes';
import { useDebounce } from 'react-use';
const { Option } = Select;

class LoadingClass {
  static modal: any = undefined;
  static timeoutFun: any = undefined;
  static show() {
    this.hide();
    const modal = Modal.success({
      centered: true,
      width: 200,
      icon: null,
      className: styles.loadingWrap,
      title: (
        <div className={styles.loadingContent}>
          <div className={styles.loadingIcon}>
            <Spin size="large" />
          </div>
          <strong className={styles.loadingTip}>正在组卷，请稍后</strong>
        </div>
      ),
      content: ``,
    });
    this.modal = modal;
    /**
     * 超出3分钟 自己动关闭 loading
     */
    this.timeoutFun = setTimeout(() => {
      this.hide();
    }, 1000 * 60 * 3);
  }
  static hide() {
    this.timeoutFun && clearTimeout(this.timeoutFun);
    this.modal && this.modal?.destroy();
    this.modal = undefined;
    this.timeoutFun = undefined;
  }
}

function getChatItemKey(index: number): string {
  return `CHAT_ITEM_KEY_FOR_${index}`;
}

export interface ChatMessages {
  id: string | number;
  text: string;
  createdAt: string | number;
  user: {
    id: string | number;
    name?: string;
    avatar?: string;
    phone?: string;
  };
  to?: {
    id: string | number;
    name?: string;
    avatar?: string;
  };
  image?: string;
  video?: string;
  audio?: string;
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
}

interface Props {
  className?: string;
}

export default function ChatWrap(props: PageProps['chatProps'] & Props) {
  const { users = [], user, messages = [] } = props;
  const [form] = Form.useForm();
  const scroolRef = useRef<Scrollbars>();
  const onFinish = (values: any) => {
    console.log(values);
    let to;
    if (values!?.target) {
      const itemUser = lodash.find(users, (i) => {
        return i.id === values!?.target;
      });
      to = {
        id: itemUser!?.id,
        name: itemUser!?.name,
        avatar: itemUser!?.avatar,
      };
    }
    const msg: ChatMessages = {
      id: new Date().getTime(),
      text: values?.text,
      createdAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user?.name,
        avatar: user?.avatar,
      },
      to: to?.id ? to : undefined,
    };
    msg.id = uuidv5(JSON.stringify(msg), uuidv5.URL);
    props.onSend &&
      props.onSend(
        msg,
        [values!?.target || ToSystemEnum.ALL_USER].map((i) => parseInt(`${i}`)),
      );
    form.setFieldsValue({
      text: undefined,
    });
  };
  const handleScroolToBottom = async () => {
    await delay(10);
    scroolRef.current?.scrollToBottom();
  };
  useEffect(() => {
    if (props?.messages && props?.messages?.length) {
      handleScroolToBottom();
      ChatMsgNum.setNum(props?.messages?.length);
    }
  }, [props?.messages]);
  const _users = users.filter((userItem) => {
    if (user.id === userItem.id) {
      return false;
    }
    if (
      `${userItem.id}`.startsWith(`${UserRole.主考官屏幕分享}`) ||
      `${userItem.id}`.startsWith(`${UserRole.候考官屏幕分享}`) ||
      `${userItem.id}`.startsWith(`${UserRole.副考官屏幕分享}`) ||
      `${userItem.id}`.startsWith(`${UserRole.监考官屏幕分享}`) ||
      `${userItem.id}`.startsWith(`${UserRole.第二机位}`) ||
      `${userItem.id}`.startsWith(`${UserRole.考生屏幕分享}`)
    ) {
      return false;
    }
    return true;
  });
  useEffect(() => {
    form.setFieldsValue({
      target: ToSystemEnum.ALL_USER,
    });
  }, []);

  useEffect(() => {
    return () => {
      cancelMsgReadEvent();
      props.onRead(window?.__room_sdk__?.getTime());
    };
  }, []);

  const [, cancelMsgReadEvent] = useDebounce(
    () => {
      if (props.messages.length) {
        props.onRead(window?.__room_sdk__?.getTime());
      }
    },
    1000 * 3,
    [props?.messages],
  );

  return (
    <Form
      className={classNames(styles.chatWrap, props?.className)}
      form={form}
      name="control-hooks"
      onFinish={onFinish}
    >
      <div className={styles.chatMain}>
        <div className={styles.chatList}>
          <Scrollbars ref={scroolRef} style={{ height: '100%' }}>
            {messages.map((item, index) => {
              const { text, user: itemUser, to } = item;
              const isMe: boolean = itemUser.id === user.id;
              return (
                <div key={index}>
                  <div
                    className={classNames(
                      styles.chatItemWrap,
                      isMe && styles.isMeMsg,
                    )}
                  >
                    <div className={styles.chatItemUserInfo}>
                      {!isMe && (
                        <Space>
                          <span>
                            {itemUser?.name}
                            {itemUser.phone && ` (${itemUser.phone}) `}
                          </span>
                          {to!?.id && <SwapRightOutlined />}
                          {to!?.id && (
                            <span>
                              {to!?.id === user?.id ? '我' : `${to!?.name}`}
                            </span>
                          )}
                        </Space>
                      )}
                      {isMe && (
                        <Space>
                          {to!?.id && (
                            <span>
                              {to!?.id === user?.id ? '我' : `${to!?.name}`}
                            </span>
                          )}
                          {to!?.id && <SwapLeftOutlined />}
                          <span>我</span>
                        </Space>
                      )}
                    </div>
                    <div className={styles.chatItemMsgWrap}>
                      <div dangerouslySetInnerHTML={{ __html: text }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </Scrollbars>
        </div>
        <div className={styles.chatSendWrap}>
          <div className={styles.chatSendHeader}>
            <div className={styles.chatSendTools}>
              <Space>
                <span>发送至</span>
                <div>
                  <Form.Item shouldUpdate noStyle>
                    {() => {
                      return (
                        <Popover
                          placement="top"
                          title="用户列表"
                          content={
                            <div
                              style={{ maxHeight: 230, overflowX: 'scroll' }}
                            >
                              <Radio.Group
                                value={form.getFieldValue('target')}
                                onChange={(e) => {
                                  console.log('ssadsfadsf', e);
                                  form.setFieldsValue({
                                    target: e.target.value,
                                  });
                                }}
                              >
                                <Space direction="vertical">
                                  <Radio value={ToSystemEnum.ALL_USER}>
                                    所有人
                                  </Radio>
                                  {_users.map((userItem) => {
                                    console.log(
                                      'userItemuserItemuserItemuserItem',
                                      userItem,
                                    );
                                    return (
                                      <Radio value={userItem?.id}>
                                        <Space>
                                          <span>{userItem?.name}</span>
                                          {userItem?.phone && (
                                            <span>{userItem?.phone}</span>
                                          )}
                                        </Space>
                                      </Radio>
                                    );
                                  })}
                                </Space>
                              </Radio.Group>
                            </div>
                          }
                        >
                          <a>
                            {lodash.find(users, (i) => {
                              console.log(
                                'ssadsfadsf',
                                i.id,
                                form.getFieldValue('target'),
                              );
                              return i.id === form.getFieldValue('target');
                            })!?.name || '所有人'}
                          </a>
                        </Popover>
                      );
                    }}
                  </Form.Item>
                  <div style={{ width: 0, height: 0, overflow: 'hidden' }}>
                    <Form.Item noStyle name="target">
                      <Select
                        className={styles.selectTools}
                        defaultValue={ToSystemEnum.ALL_USER}
                        bordered={false}
                      >
                        <Option
                          // value={users?.map((userItem) => userItem.uid).join(',')}
                          value={ToSystemEnum.ALL_USER}
                        >
                          所有人
                        </Option>
                        {users.map((userItem) => {
                          return (
                            <Option value={userItem?.id}>
                              {userItem?.name}({userItem?.id})
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </Space>
            </div>
          </div>
          <div className={styles.textAreaWrap}>
            <Form.Item
              noStyle
              style={{ width: '100%' }}
              name="text"
              rules={[{ required: true }]}
            >
              <Input.TextArea
                autoSize={false}
                className={styles.textArea}
                placeholder="请输入消息……"
                onPressEnter={(e) => {
                  e.preventDefault();
                  form.submit();
                }}
              />
            </Form.Item>
            {/* <Button htmlType="submit" type="primary" className={styles.sendBtn}>
              发送
            </Button> */}
          </div>
        </div>
      </div>
    </Form>
  );
}

function ChatModalWrap(
  props: PageProps['chatProps'] & Props,
  ref: React.Ref<unknown> | undefined,
) {
  const { users = [], user, messages = [] } = props;
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    show: () => {
      setVisible(true);
    },
    hide: () => {
      setVisible(false);
    },
    addMessages: (msg: any) => {
      if (!msg) {
        return;
      }
    },
  }));

  return (
    <>
      <Modal
        title="聊天"
        maskClosable={false}
        keyboard={false}
        className={styles.modalWrap}
        visible={visible}
        okText={'关闭'}
        cancelText="关闭"
        destroyOnClose
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          setVisible(false);
        }}
        footer={null}
      >
        <div className={styles.modalBox}>
          <ChatWrap {...props} />
        </div>
      </Modal>
    </>
  );
}

export const ChatModal = forwardRef(ChatModalWrap);

export class ChatMsgNum {
  static num = 0;
  static setNum(_num: number) {
    this.num = _num;
  }
  static getNum() {
    return this.num;
  }
}
