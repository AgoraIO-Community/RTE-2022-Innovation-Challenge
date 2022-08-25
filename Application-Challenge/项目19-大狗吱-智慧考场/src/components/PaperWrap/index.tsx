import { Button, Modal, Space, Spin, Table } from 'antd';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import delay from 'delay';
import { Provider, useObserver, Observer, useLocalStore } from 'mobx-react';
import { useDebounce } from 'react-use';
import { store } from './store';
import styles from './styles.less';

import {
  PAPER_DATA,
  OnChangePapers,
  ChangePapersEvent,
  OnGetTestPaper,
  HTML_PAPER_DATA,
  TypeEnum,
} from './types';

import TestPaper from './TestPaper';
import lodash from 'lodash';
import Countdown, { zeroPad } from 'react-countdown';
import { serverTime } from '@/utils';

export interface Props {
  /**
   * 提前试卷限制时间
   */
  submitLimit?: number;
  /**
   * 是否只读
   */
  readOnly?: boolean;
  /**
   * 获取考卷数据
   */
  onGetPapers: OnGetTestPaper;
  /**
   * 考卷数据变化回调
   */
  onChangePapers: OnChangePapers;
}

export function PaperWrap(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const localStore = useLocalStore(() => store);

  const handleGetTestPaper = async () => {
    LoadingClass.show();
    await delay(1000);
    if (props?.onGetPapers && typeof props?.onGetPapers === 'function') {
      const data = await props?.onGetPapers();
      /**
       * PDF 数据测试
       */
      // const data = {
      //   type: TypeEnum.PDF,
      //   data: [{
      //     id: '123123',
      //     name: 'test pdf',
      //     startTime: 111,
      //     endTime: 222,
      //     answerSheetUrl: 'https://dagouzhi.oss-cn-qingdao.aliyuncs.com/assets/sample.pdf',
      //     url: 'https://dagouzhi.oss-cn-qingdao.aliyuncs.com/assets/sample.pdf'
      //   }],
      // };
      /**
       * 自定答题 数据测试
       */
      // const data = {
      //   type: TypeEnum.HTML,
      //   data: [
      //     {
      //       id: 'testat',
      //       name: '测试 HTML',
      //       startTime: 1111,
      //       endTime: 111,
      //       totalQuestion: 3,
      //       totalMustQuestion: 3,
      //       bigQuestions: [
      //         {
      //           id: '1231231',
      //           type: 1,
      //           questions: [
      //             {
      //               id: '61109262b71d7efe130b0df81',
      //               score: 1.7599999904632568,
      //               answerType: 1,
      //               description: '1*1=？',
      //               type: 1,
      //               difficulty: 2,
      //               options: [
      //                 {
      //                   desc: '1',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '2',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '3',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '4',
      //                   isRight: false,
      //                 },
      //               ],
      //             },
      //             {
      //               id: '61109262b71d7efe130b0df82',
      //               score: 1.7599999904632568,
      //               answerType: 2,
      //               description: '1*1=？',
      //               type: 2,
      //               difficulty: 2,
      //               options: [
      //                 {
      //                   desc: '1',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '2',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '3',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '4',
      //                   isRight: false,
      //                 },
      //               ],
      //             },
      //             {
      //               id: '61109262b71d7efe130b0df83',
      //               score: 1.7599999904632568,
      //               answerType: 3,
      //               description: '1*1=？',
      //               type: 3,
      //               difficulty: 2,
      //               options: [
      //                 {
      //                   desc: '1',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '2',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '3',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '4',
      //                   isRight: false,
      //                 },
      //               ],
      //             },
      //             {
      //               id: '61109262b71d7efe130b0df84',
      //               score: 1.7599999904632568,
      //               answerType: 4,
      //               description: '1*1=？',
      //               type: 4,
      //               difficulty: 2,
      //               options: [
      //                 {
      //                   desc: '1',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '2',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '3',
      //                   isRight: false,
      //                 },
      //                 {
      //                   desc: '4',
      //                   isRight: false,
      //                 },
      //               ],
      //             },
      //           ]
      //         }
      //       ]
      //     }
      //   ],
      // }
      /**
       * 网页类型 数据测试
       */
      // const data = {
      //   type: TypeEnum.URL,
      //   data: [
      //     {
      //       id: 'testat',
      //       name: '测试URL name',
      //       startTime: 1111,
      //       endTime: 111,
      //       url: 'https://coding.net/'
      //     }
      //   ]
      // }

      // const data = {
      //   type: TypeEnum.WPS,
      //   data: [{
      //     id: '123123',
      //     name: 'test wps',
      //     startTime: 111,
      //     endTime: 222,
      //     url: 'https://wwo.wps.cn/office/f/132aa30a87064?_w_appid=1a3cc59ef1384b8baebd39dd7af708bc&_w_signature=XT%2BL%2BJbFoWlhGMYfQPjL8FQ7gjQ%3D'
      //   }]
      // }
      localStore.setPaperData(data);
    }
    setIsOpen(true);
    LoadingClass.hide();
  };

  useEffect(() => {
    localStore.setReadOnly(!!props?.readOnly);
  }, [props?.readOnly]);

  return (
    <Observer>
      {() => {
        if (isOpen && localStore.paperData) {
          return (
            <RenderTable
              submitLimit={props.submitLimit}
              data={localStore.paperData}
              onChangePapers={props.onChangePapers}
            />
          );
        }
        return (
          <div className={styles.paperWrap}>
            <div className={styles.tipCardWrap}>
              <h2 className={styles.tipCardHeader}>注意事项</h2>
              <div className={styles.tipTextWrap}>
                <p>
                  <strong>1、</strong>
                  考生需在一个安静的房间，中途不能被打扰，噪音应低于40分贝
                </p>
                <p>
                  <strong>2、</strong>
                  考生双手摆放桌面，第一机位从正面拍摄，放置在距离本人30cm处，完整拍摄到考生双手以上身体部位
                </p>
                <p>
                  <strong>3、</strong>
                  考试时需关闭电脑和手机中与考试无关的软件与应用
                </p>
                <p>
                  <strong>4、</strong>
                  请保证稳定的网络环境，最好是网线接入，备用4G/wifi
                </p>
                <p>
                  <strong>5、</strong>保证电脑或者手机充满电
                </p>
                <p>
                  <strong>6、</strong>
                  在面试过程中因断电、断网等情况导致异常退出，若间隔时间很短，可重新登录系统继续参加考试，若间隔时间较长，可联系企业说明情况
                </p>
                <p>
                  <strong>7、</strong>
                  若考试要求使用双机位，则第二机位需从考生侧后方45°距离本人1m处拍摄，可以拍摄到考生侧面及主设备电脑全屏幕，需保证面试考官能够从第二机位清晰看到第一机位的屏幕。
                </p>
              </div>
              <div className={styles.tipCardFooter}>
                <Button
                  type="primary"
                  onClick={() => {
                    handleGetTestPaper();
                  }}
                >
                  查看试卷
                </Button>
              </div>
            </div>
          </div>
        );
      }}
    </Observer>
  );
}

interface RenderTableProps {
  submitLimit?: number;
  data: PAPER_DATA;
  onChangePapers: OnChangePapers;
}

function RenderTable(props: RenderTableProps) {
  const localStore = useLocalStore(() => store);
  const testRef = useRef<HTMLDivElement>();
  const data = props?.data || {};

  const columns = [
    {
      title: '试卷名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '题数',
      dataIndex: 'totalQuestion',
      key: 'totalQuestion',
      render: (data) => {
        return <div>{data || '---'}</div>;
      },
    },
    {
      title: '分数',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: (data, row) => {
        return <div>{data!?.toFixed(2) || '---'}</div>;
      },
    },
    {
      title: '答题进度',
      dataIndex: 'totalQuestion',
      key: 'totalQuestion',
      render: (item, row) => {
        let endS: number = 0;
        const _currentPaper: HTML_PAPER_DATA = lodash.cloneDeep(row) as any;
        _currentPaper?.bigQuestions &&
          _currentPaper?.bigQuestions?.forEach((item) => {
            const { questions = [] } = item;
            questions?.forEach((item) => {
              if (lodash.get(item, 'respond', []).length > 0) {
                endS += 1;
              }
            });
          });
        return (
          <div>
            {endS || '0'}/{item || '---'}
          </div>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'address',
      key: 'address',
      render: (item, row) => {
        return (
          <div>
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                localStore.setCurrentPaper(row);
              }}
            >
              开始答题
            </a>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (data && data.type === TypeEnum.PDF) {
      const row = data.data;
      if (row.length === 1) {
        localStore.setCurrentPaper(lodash.get(data.data, '[0]', undefined));
      }
    }
  }, [data]);

  const [, cancel] = useDebounce(
    () => {
      if (typeof props.onChangePapers === 'function' && localStore.paperData) {
        localStore?.currentPaper;
        debugger;
        props.onChangePapers(
          ChangePapersEvent.更新答案,
          localStore.paperData,
          localStore?.currentPaper?.id,
        );
      }
    },
    1000,
    [localStore.paperData, props.onChangePapers],
  );

  return (
    <Observer>
      {() => {
        return (
          <div ref={testRef} className={styles.testTableWrap}>
            <div className={styles.body}>
              <Table
                pagination={false}
                className={styles.table}
                dataSource={data?.data || []}
                columns={columns}
              />
            </div>
            <div className={styles.footer}>
              <Countdown
                daysInHours
                key={props.submitLimit}
                date={props.submitLimit}
                now={() => {
                  return window?.__room_sdk__?.getTime();
                }}
                onComplete={() => {}}
                renderer={(data) => {
                  const { hours, minutes, seconds } = data?.formatted;
                  const isDisabled =
                    data.hours > 0 || data.minutes > 0 || data.seconds > 0;
                  return (
                    <Button
                      type="primary"
                      disabled={isDisabled}
                      onClick={() => {
                        // handleChangePapers(localStore.paperData, );
                        if (localStore.paperData) {
                          props.onChangePapers(
                            ChangePapersEvent.交卷,
                            localStore.paperData,
                          );
                        }
                      }}
                    >
                      {isDisabled ? (
                        <Space>
                          <span className={styles.countdownItem}>
                            {zeroPad(hours)}
                          </span>
                          <span>:</span>
                          <span className={styles.countdownItem}>
                            {zeroPad(minutes)}
                          </span>
                          <span>:</span>
                          <span className={styles.countdownItem}>
                            {zeroPad(seconds)}
                          </span>
                          <span>我要交卷</span>
                        </Space>
                      ) : (
                        '我要交卷'
                      )}
                    </Button>
                  );
                }}
              />
            </div>
            {localStore?.currentPaper && localStore?.paperData?.type && (
              <div className={styles.mainBody}>
                <TestPaper
                  type={localStore?.paperData?.type}
                  data={localStore?.currentPaper}
                  onBack={() => {
                    localStore.setCurrentPaper(false);
                  }}
                  onChangePapers={props?.onChangePapers}
                />
              </div>
            )}
          </div>
        );
      }}
    </Observer>
  );
}

export default (props: Props) => (
  <Provider store={store}>
    <PaperWrap {...props} />
  </Provider>
);

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
