import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.less';
import { useMeasure } from 'react-use';
import lodash from 'lodash';
import { PAPER_DATA } from '../..';
import { Button } from 'antd';

export interface Props {
  onBack?: () => void;
  data: PAPER_DATA | undefined;
  readonly?: boolean;
  onChange?: any;
}

function URLPaper(props: Props) {
  const [ref, { width, height }] = useMeasure();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [data, setData] = useState<PAPER_DATA>();
  useEffect(() => {
    const _data = lodash.cloneDeep(props?.data);
    setData(_data);
    return () => {};
  }, [props?.data, iframeRef]);
  return (
    <div ref={ref} className={styles.testWrap}>
      <iframe ref={iframeRef} src={data?.url} className={styles.iframeWrap} />
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

export default URLPaper;
