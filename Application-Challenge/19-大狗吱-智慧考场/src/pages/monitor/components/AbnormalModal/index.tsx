import { Modal, Table, Image, Button, Divider, Space } from 'antd';
import moment from 'moment';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import 'react-custom-scroll/dist/customScroll.css';
import styles from './styles.less';

interface Props {
  onClose?: () => Promise<any>;
}

enum AbnormalTypeEnum {
  '改变窗口大小' = 4,
  '切标签页/最小化' = 3,
  '使用双屏' = 2,
}

function AbnormalModalWrap(props: Props, ref: React.Ref<unknown> | undefined) {
  const [visible, setVisible] = useState(false);
  const [isShowFaceImg, setShowFaceImg] = useState<string>();
  const [data, setData] = useState<{
    current: number;
    list: Array<{}>;
    total: number;
    totalPage?: number;
  }>();
  const callbackRef = useRef();
  useImperativeHandle(ref, () => ({
    show: async (callback) => {
      callbackRef.current = callback;
      if (callbackRef.current && typeof callbackRef.current === 'function') {
        const data = await callbackRef.current(1);
        setData(data);
      }
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

  useEffect(() => {}, []);

  const dataSource = [
    {
      key: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖底公园1号',
    },
    {
      key: '2',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖底公园1号',
    },
  ];

  const columns = [
    {
      title: '学生姓名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '学校',
      dataIndex: 'school_name',
      key: 'school_name',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: '异常行为',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        return `${AbnormalTypeEnum[type]}`;
      },
    },
    {
      title: '时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (createTime: number) => {
        return createTime
          ? moment(createTime * 1000).format('YYYY/MM/DD HH:mm:ss')
          : '--';
      },
    },
    {
      title: '截图',
      dataIndex: 'snapshot',
      key: 'snapshot',
      render: (snapshot: string) => {
        return (
          <Button
            type="link"
            onClick={() => {
              setShowFaceImg(snapshot);
            }}
          >
            {snapshot ? '查看' : '无'}
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Modal
        title="异常行为"
        maskClosable={false}
        keyboard={false}
        visible={visible}
        className={styles.modalWrap}
        wrapClassName={styles.wrapClassName}
        okText={'确定'}
        cancelText="取消"
        destroyOnClose
        afterClose={() => {
          props.onClose && props.onClose();
        }}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          setVisible(false);
        }}
        footer={false}
      >
        <div className={styles.modalBox}>
          <div className={styles.mainBox}>
            <div className={styles.formWrap}>
              <div className={styles.scrollbarsWrap}>
                <Scrollbars>
                  <Table
                    size="small"
                    dataSource={data!?.list}
                    columns={columns}
                    pagination={{
                      size: 'default',
                      total: data!?.total,
                      current: data!?.current,
                      showSizeChanger: false,
                      onChange: async (page) => {
                        if (
                          callbackRef.current &&
                          typeof callbackRef.current === 'function'
                        ) {
                          const data = await callbackRef.current(page);
                          setData(data);
                        }
                      },
                    }}
                  />
                </Scrollbars>
              </div>
              <Divider />
              <div className={styles.btnsWrap}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => {
                      setVisible(false);
                    }}
                  >
                    关闭
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        </div>
        <Image
          preview={{
            visible: !!isShowFaceImg,
            onVisibleChange: (value) => {
              setShowFaceImg(undefined);
            },
            destroyOnClose: true,
          }}
          width={0}
          height={0}
          src={isShowFaceImg}
        />
      </Modal>
    </>
  );
}

export const AbnormalModal = forwardRef(AbnormalModalWrap);
