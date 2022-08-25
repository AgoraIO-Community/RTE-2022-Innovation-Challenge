import React, { useEffect, useState } from 'react';
import { dynamic } from 'umi';
import styles from './styles.less';
// import PdfPaper from './components/pdfPaper';
import { HtmlPaperProps } from './components/htmlPaper';
// import WPSPaper from './components/wpsPaper';
// import URLPaper from './components/urlPaper';
import { Button, Table } from 'antd';


const PdfPaper = dynamic({
  loader: async function() {
    const { default: HugeA } = await import('./components/pdfPaper');
    return HugeA;
  },
});

const HtmlPaper = dynamic({
  loader: async function() {
    const { default: HugeA } = await import('./components/htmlPaper');
    return HugeA;
  },
});

const WPSPaper = dynamic({
  loader: async function() {
    const { default: HugeA } = await import('./components/wpsPaper');
    return HugeA;
  },
});

const URLPaper = dynamic({
  loader: async function() {
    const { default: HugeA } = await import('./components/urlPaper');
    return HugeA;
  },
});


export enum TypeEnum {
  'PDF' = 'PDF',
  'HTML' = 'HTML',
  'WPS' = 'WPS',
  'URL' = 'URL',
}

export interface PAPER_DATA {}

export type OnChange = (data: any) => Promise<any>;

export interface TestPaperProps {
  currentPaper: {
    type?: TypeEnum;
    data?: PAPER_DATA;
  };
  onBack?: () => void;
  onChange?: OnChange;
  onSubmit?: OnChange;
  readonly?: boolean;
  width?: number;
  height?: number;
  showTip?: boolean;
  onGetMediaPlayNum?: HtmlPaperProps['onGetMediaPlayNum'];
  onMediaPlay?: HtmlPaperProps['onMediaPlay'];
  timingConfig?: HtmlPaperProps['timingConfig'];
}
function TestPaper(props: TestPaperProps) {
  const currentPaper = props!?.currentPaper;
  const type = currentPaper!?.type;
  return (
    <div
      style={{ width: props.width, height: props.height }}
      className={styles.testPaperWrap}
    >
      {type === TypeEnum.PDF && (
        <PdfPaper
          readonly={!!props?.readonly}
          onBack={props?.onBack}
          data={currentPaper?.data}
          onChange={props?.onChange}
        />
      )}
      {type === TypeEnum.HTML && (
        <HtmlPaper
          initValue={props.initValue}
          readonly={!!props?.readonly}
          onBack={props?.onBack}
          data={currentPaper?.data}
          onChange={props?.onChange}
          showTip={props.showTip}
          onGetMediaPlayNum={props?.onGetMediaPlayNum}
          onMediaPlay={props?.onMediaPlay}
          timingConfig={props?.timingConfig}
        />
      )}
      {type === TypeEnum.WPS && (
        <WPSPaper
          readonly={!!props?.readonly}
          onBack={props?.onBack}
          data={currentPaper?.data}
          onChange={props?.onChange}
        />
      )}
      {type === TypeEnum.URL && (
        <URLPaper
          readonly={!!props?.readonly}
          onBack={props?.onBack}
          data={currentPaper?.data}
          onChange={props?.onChange}
        />
      )}
    </div>
  );
}

export default TestPaper;
