import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.less';
import { pdfjs, Document, Page, } from 'react-pdf';
import { useMeasure, usePermission } from 'react-use';
import { Button, Empty, Input, Pagination, Result, Space, Spin } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
// pdfjs.GlobalWorkerOptions.workerSrc = `//dagouzhi.oss-cn-qingdao.aliyuncs.com/assets/js/pdf.js/2.9.359/pdf.worker.min.js`;
import lodash from 'lodash';
import { PAPER_DATA } from '../..';
import { Modal } from 'antd';
import delay from 'delay';

export interface Props {
  onBack?: () => void;
  data: PAPER_DATA | undefined;
  readonly?: boolean;
  onChange?: any;
}

function PdfPaper(props: Props) {
  const [refresh, setRefresh] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [ref, { width, height }] = useMeasure();
  const [data, setData] = useState<PAPER_DATA>();
  const scroolRef = useRef<Scrollbars>();
  // const height = useD
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }
  const onChangePage = (page) => {
    setPageNumber(page);
    scroolRef.current?.scrollToTop();
  };
  useEffect(() => {
    const _data = lodash.cloneDeep(props?.data);
    setData(_data);
    return () => {};
  }, [props?.data]);
  const refreshCallback = async () => {
    await delay(500);
    if (refresh) {
      setRefresh(false);
    }
  }
  useEffect(() => {
    if (refresh) {
      refreshCallback();
    }
  }, [refresh]);

  
  return (
    <div ref={ref as any} className={styles.testWrap}>
      <Scrollbars ref={scroolRef as any} className={styles.document}>
        {
          refresh === false && <Document
          file={data?.url}
          onLoadSuccess={onDocumentLoadSuccess}
          error={() => {
            return  <Result
              status="warning"
              title="加载PDF文件失败"
              subTitle="可点击 `刷新重试`,尝试重新加载"
              extra={
                <Button type="primary" key="console"
                  onClick={async () => {
                    setRefresh(true);
                  }}
                >
                  刷新重试
                </Button>
              }
            />
          }}
          loading={<Result
            status="warning"
            icon={<Spin size="large" />}
            title="加载PDF..."
            subTitle="如长时间加载不出/密码错误, 可点击 `刷新重试`"
            extra={
              <Button type="primary" key="console"
                onClick={async () => {
                  setRefresh(true);
                }}
              >
                刷新重试
              </Button>
            }
          />}
          noData={<Empty description="暂无数据" />}
          onLoadError={(err) => {
            console.error(err);
          }}
          onPassword={(callback, reason) => {
            function callbackProxy(password: string) {
              // Cancel button handler
              if (password === null) {
                // Reset your `document` in `state`, un-mount your `<Document />`, show custom message, whatever
              }

              callback(password);
            }

            switch (reason as any) {
              case pdfjs.PasswordResponses.NEED_PASSWORD: {
                let password = '';
                Modal.confirm({
                  centered: true,
                  icon: null,
                  content: (
                    <Result
                      status="warning"
                      title="请输入密码"
                      subTitle="输入密码后,才能正常查看PDF文档"
                      extra={
                        <Input
                          placeholder="请输入密码"
                          onChange={(e) => {
                            password = e.target.value;
                          }}
                        />
                      }
                    />
                  ),
                  onOk: () => {
                    callbackProxy(password);
                  },
                });
                break;
              }
              case pdfjs.PasswordResponses.INCORRECT_PASSWORD: {
                let password = '';
                Modal.confirm({
                  centered: true,
                  icon: null,
                  content: (
                    <Result
                      status="warning"
                      title="请输入密码"
                      subTitle="输入密码后,才能正常查看PDF文档"
                      extra={
                        <div>
                          <Input
                            style={{width: '100%'}}
                            placeholder="请输入密码"
                            onChange={(e) => {
                              password = e.target.value;
                            }}
                          />
                          <div style={{ marginTop: 8, color: 'red'}}>密码错误请重输</div>
                        </div>
                      }
                    />
                  ),
                  onOk: () => {
                    callbackProxy(password);
                  },
                });
                break;
              }
              default:
            }
          }}
        >
          <Page width={width} pageNumber={pageNumber} />
        </Document>
        }
      </Scrollbars>
      <div className={styles.paginationWrap}>
        <div className={styles.pagination}>
          <Space>
            <Pagination
              total={numPages}
              showTotal={(total) => `共 ${total} 页`}
              current={pageNumber}
              pageSize={1}
              size="small"
              onChange={onChangePage}
            />
          </Space>
        </div>
      </div>
      {props?.onBack && (
        <Button
          className={styles.btn}
          onClick={() => {
            props?.onBack && props?.onBack();
          }}
          type="default"
        >
          返回
        </Button>
      )}
    </div>
  );
}

export default PdfPaper;
