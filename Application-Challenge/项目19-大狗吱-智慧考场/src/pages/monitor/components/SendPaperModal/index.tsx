import {
  Modal,
  Table,
  Image,
  Button,
  Space,
  Divider,
  Form,
  Input,
  Spin,
} from 'antd';
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
import { SendPaperListItem, SendPapersType } from '@/pages/RoomTypes';
import { DataType } from 'ajv/dist/compile/validate/dataType';
import { CURRENT_PAPER_DATA, TypeEnum } from '@/components/PaperWrap/types';
import lodash from 'lodash';
import delay from 'delay';
import PuzzleLibs from '@/components/PuzzleLibs';

interface Props {
  onGetSendPaperList: () => Promise<any>;
  onSelectSendPaper: (data: any) => Promise<any>;
  onPreviewPaperInfo: (data: any) => Promise<any>;
  onUnGivePaper: (data: any) => Promise<any>;
}

function SendPaperModalWrap(props: Props, ref: React.Ref<unknown> | undefined) {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<SendPapersType>();
  const [isShowFaceImg, setShowFaceImg] = useState<string>();
  const [userSelectLoadingModalVisible, setUserSelectLoadingModalVisible] =
    useState(false);
  const [paperModalVisible, setPaperModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState<SendPaperListItem[]>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>();
  const [previewPaperInfo, setPreviewPaperInfo] =
    useState<CURRENT_PAPER_DATA>();

  const [form] = Form.useForm();
  const [data, setData] = useState<{
    page: number;
    list: Array<{}>;
    total: number;
    pageSize?: number;
  }>();
  const callbackRef = useRef();
  useImperativeHandle(ref, () => ({
    show: async (type: SendPapersType) => {
      if (type) {
        setType(type);
        // const data = await props!?.onGetScoreInfo(uid);
      }
      if (type === SendPapersType.学生选取) {
        await delay(1000);
        setUserSelectLoadingModalVisible(false);
      }
      if (
        type === SendPapersType.指定下发 ||
        type === SendPapersType.随机下发
      ) {
        setVisible(true);
        const data = await props.onGetSendPaperList();
        setDataSource(data?.list);
        // debugger
      }
    },
    showPaper: async (id: string) => {
      setPaperModalVisible(true);
      const data = await props!?.onPreviewPaperInfo(id);
      setPreviewPaperInfo(data);
    },
    hide: () => {
      setVisible(false);
      setPaperModalVisible(false);
      setUserSelectLoadingModalVisible(false);
    },
    addMessages: (msg: any) => {
      if (!msg) {
        return;
      }
    },
  }));
  const handleUserSelect = async () => {
    if (type && type === SendPapersType.学生选取) {
      await handlSelectSendPaper();
      setUserSelectLoadingModalVisible(true);
    }
  };

  useEffect(() => {
    handleUserSelect();
  }, [type]);

  const columns = [
    {
      title: '试卷名称',
      dataIndex: 'name',
      key: 'name',
    },
    // {
    //   title: '题数',
    //   dataIndex: 'questionNum',
    //   key: 'questionNum',
    // },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      render: (id) => {
        return (
          <div>
            <Space>
              <a
                onClick={async (e) => {
                  e.preventDefault();
                  setPreviewPaperInfo(undefined);
                  setPaperModalVisible(true);
                  const data = await props!?.onPreviewPaperInfo(id);
                  setPreviewPaperInfo(data);
                }}
              >
                预览
              </a>
              <a
                onClick={async (e) => {
                  e.preventDefault();
                  await props!?.onUnGivePaper({
                    type: type,
                    id,
                    customUrl: '',
                    customType: '',
                  });
                }}
              >
                取消下发
              </a>
            </Space>
          </div>
        );
      },
    },
  ];

  const onFinish = (values: any) => {
    console.log(values);
  };
  let title = '';
  if (type === SendPapersType.指定下发) {
    title = '指定下发试卷';
  }
  if (type === SendPapersType.随机下发) {
    title = '随机下发试卷';
  }
  if (type === SendPapersType.学生选取) {
    title = '学生选取试卷';
  }
  const rowSelection: any = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows,
      );
      setSelectedRowKeys(selectedRows);
    },
    // getCheckboxProps: (record: DataType) => ({
    //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
    //   name: record.name,
    // }),
  };

  const handlSelectSendPaper = async () => {
    let id = undefined;
    if (type === SendPapersType.指定下发) {
      id = lodash.get(selectedRowKeys, '[0].id', undefined);
      if (!id) {
        Modal.warn({
          title: '请先选择一份试卷',
        });
        return;
      }
    }
    if (type === SendPapersType.随机下发) {
      id = lodash.get(
        dataSource,
        `[${Math.floor(Math.random() * dataSource!?.length)}].id`,
        undefined,
      );
      if (!id) {
        Modal.warn({
          title: '请先选择一份试卷',
        });
        return;
      }
    }
    try {
      await props!?.onSelectSendPaper({
        type: type,
        id: id,
      });
      setVisible(false);
    } catch (err) {}
  };

  return (
    <>
      <Modal
        title={type}
        maskClosable={false}
        keyboard={false}
        className={styles.modalWrap}
        visible={visible}
        okText={'确定'}
        cancelText="取消"
        destroyOnClose
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          setVisible(false);
        }}
        afterClose={() => {
          setType(undefined);
        }}
        footer={null}
      >
        <div className={styles.modalBox}>
          <div className={styles.mainBox}>
            <Form
              className={styles.formWrap}
              form={form}
              name="control-hooks"
              onFinish={onFinish}
            >
              <div className={styles.scrollbarsWrap}>
                <Scrollbars>
                  <Table
                    size="small"
                    bordered
                    rowKey={(i: any) => i!?.id}
                    dataSource={dataSource || data!?.list}
                    columns={columns}
                    pagination={false}
                    rowSelection={
                      type === SendPapersType.指定下发
                        ? {
                            type: 'radio',
                            ...rowSelection,
                          }
                        : undefined
                    }
                  />
                </Scrollbars>
              </div>
              <Divider />
              <div className={styles.btnsWrap}>
                <Form.Item noStyle>
                  <Space>
                    <Button
                      onClick={() => {
                        setVisible(false);
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      onClick={() => {
                        handlSelectSendPaper();
                      }}
                    >
                      下发
                    </Button>
                  </Space>
                </Form.Item>
              </div>
            </Form>
          </div>
        </div>
      </Modal>
      <Modal
        visible={paperModalVisible}
        className={styles.modalWrapPaper}
        title={previewPaperInfo!?.data?.name || undefined}
        centered
        onCancel={() => {
          setPaperModalVisible(false);
        }}
        destroyOnClose
        keyboard={false}
        maskClosable={false}
        onOk={() => {
          setPaperModalVisible(false);
        }}
        afterClose={() => {
          // setType(undefined);
        }}
        footer={null}
      >
        <PuzzleLibs
          width={'100%'}
          height={'100%'}
          currentPaper={previewPaperInfo}
          readonly={true}
          showTip={false}
        />
      </Modal>
      <Modal
        visible={userSelectLoadingModalVisible}
        centered
        width={200}
        onCancel={() => {
          setUserSelectLoadingModalVisible(false);
        }}
        destroyOnClose
        keyboard={false}
        maskClosable={false}
        onOk={() => {
          setUserSelectLoadingModalVisible(false);
        }}
        afterClose={() => {
          setType(undefined);
        }}
        footer={null}
      >
        <div className={styles.userSelectLoading}>
          <Spin size="large" />
          <div>等待学生选取试卷</div>
          <Button
            type="link"
            onClick={() => {
              setUserSelectLoadingModalVisible(false);
            }}
          >
            取消
          </Button>
        </div>
      </Modal>
    </>
  );
}

export const SendPaperModal = forwardRef(SendPaperModalWrap);
