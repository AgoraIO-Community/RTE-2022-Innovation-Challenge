import React, { useEffect, useState } from 'react';
import styles from './styles.less';
import PdfPaper from './components/pdfPaper';
import HtmlPaper from './components/htmlPaper';
import WPSPaper from './components/wpsPaper';
import URLPaper from './components/urlPaper';
import { Button, Table } from 'antd';

import {
  TypeEnum,
  PDF_PAPER_DATA,
  HTML_PAPER_DATA,
  URL_PAPER_DATA,
  WPS_PAPER_DATA,
  OnChangePapers,
  PAPER_DATA,
  CURRENT_PAPER_DATA,
} from '../types';
import { Observer, useLocalStore } from 'mobx-react';
import { store } from '../store';

export interface TestPaperProps {
  type?: TypeEnum;
  onBack?: () => void;
  onChangePapers?: OnChangePapers;
  paperData?: PAPER_DATA | undefined;
  currentPaper?: CURRENT_PAPER_DATA['data'] | undefined;
  readonly?: boolean;
}
function TestPaper(props: TestPaperProps) {
  const localStore = useLocalStore(() => store);
  const paperData = props!?.paperData || localStore.paperData;
  const currentPaper = props!?.currentPaper || localStore.currentPaper;
  const type = props!?.type || paperData?.type;
  console.log('paperData?.type', paperData?.type, currentPaper)
  return (
    <Observer>
      {() => {
        return (
          <div className={styles.testPaperWrap}>
            {type === TypeEnum.PDF && currentPaper && (
              <PdfPaper
                readonly={!!props?.readonly}
                onBack={props?.onBack}
                data={currentPaper}
                onChangePapers={props?.onChangePapers}
              />
            )}
            {type === TypeEnum.HTML && (
              <HtmlPaper
                readonly={!!props?.readonly}
                onBack={props?.onBack}
                data={currentPaper}
                onChangePapers={props?.onChangePapers}
              />
            )}
            {type === TypeEnum.WPS && (
              <WPSPaper
                readonly={!!props?.readonly}
                onBack={props?.onBack}
                data={currentPaper}
                onChangePapers={props?.onChangePapers}
              />
            )}
            {type === TypeEnum.URL && (
              <URLPaper
                readonly={!!props?.readonly}
                onBack={props?.onBack}
                data={currentPaper}
                onChangePapers={props?.onChangePapers}
              />
            )}
          </div>
        );
      }}
    </Observer>
  );
}

export default TestPaper;
