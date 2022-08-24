import { Modal, Table, Image, Button, Space, Pagination } from 'antd';
import moment from 'moment';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Scrollbars } from 'react-custom-scrollbars';
import 'react-custom-scroll/dist/customScroll.css';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import styles from './styles.less';
import { useMeasure } from 'react-use';

interface Props {}

function ResumeModalWrap(props: Props, ref: React.Ref<unknown> | undefined) {
  const [resumeUrl, setResumeUrl] = useState<string>();
  const [isShowFaceImg, setShowFaceImg] = useState<string>();
  const [data, setData] = useState<{
    current: number;
    list: Array<{}>;
    total: number;
    totalPage?: number;
  }>();
  const callbackRef = useRef();
  useImperativeHandle(ref, () => ({
    show: async (url: string) => {
      setResumeUrl(url);
    },
    hide: () => {
      setResumeUrl(undefined);
    },
    addMessages: (msg: any) => {
      if (!msg) {
        return;
      }
    },
  }));

  useEffect(() => {}, []);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [refBox, { width, height }] = useMeasure();
  const scroolRef = useRef<Scrollbars>();
  // const height = useD
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }
  const onChangePage = (page) => {
    setPageNumber(page);
    scroolRef.current?.scrollToTop();
  };
  return (
    <>
      <Modal
        title="简历"
        maskClosable={false}
        keyboard={false}
        className={styles.modalWrap}
        visible={!!resumeUrl}
        okText={'确定'}
        cancelText="取消"
        destroyOnClose
        onCancel={() => {
          setResumeUrl(undefined);
        }}
        onOk={() => {
          setResumeUrl(undefined);
        }}
      >
        <div className={styles.modalBox}>
          <div ref={refBox} className={styles.testWrap}>
            <Scrollbars ref={scroolRef} className={styles.document}>
              <Document file={resumeUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page width={width} pageNumber={pageNumber} />
              </Document>
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
          </div>
        </div>
      </Modal>
    </>
  );
}

export const ResumeModal = forwardRef(ResumeModalWrap);
