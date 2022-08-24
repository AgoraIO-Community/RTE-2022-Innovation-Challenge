import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.less';
import { pdfjs, Document, Page } from 'react-pdf';
import { useMeasure, usePermission } from 'react-use';
import { Button, Pagination, Space } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import 'react-custom-scroll/dist/customScroll.css';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
// pdfjs.GlobalWorkerOptions.workerSrc = `https://examdesktop-1259785003.cos.ap-chengdu.myqcloud.com/pdf.worker.min.js`;
import { PDF_PAPER_DATA } from '../../../types';
import lodash from 'lodash';
import { Observer } from 'mobx-react';

export interface Props {
  onBack?: () => void;
  data: PDF_PAPER_DATA;
  readonly?: boolean;
}

function PdfPaper(props: Props) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [ref, { width, height }] = useMeasure();
  const [data, setData] = useState<PDF_PAPER_DATA>();
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
  console.log(props?.data, data, 1111);
  return (
    <Observer>
      {() => {
        return (
          <div ref={ref} className={styles.testWrap}>
            <Scrollbars ref={scroolRef} className={styles.document}>
              <Document file={data?.url} onLoadSuccess={onDocumentLoadSuccess}>
                <Page width={width} pageNumber={pageNumber} />
              </Document>
            </Scrollbars>
            <div className={styles.paginationWrap}>
              <div className={styles.pagination}>
                <Space>
                  {/* {props?.onBack && <Button
                    className={styles.btn}
                    onClick={() => {
                      props?.onBack && props?.onBack();
                    }}
                    type="default"
                  >
                    返回试卷列表(去交卷)
                  </Button>} */}
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
        );
      }}
    </Observer>
  );
}

export default PdfPaper;
