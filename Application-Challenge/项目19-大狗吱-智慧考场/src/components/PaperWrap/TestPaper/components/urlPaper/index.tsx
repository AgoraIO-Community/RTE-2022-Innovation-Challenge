import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.less';
import { useMeasure, usePermission } from 'react-use';
import { Button } from 'antd';
import { URL_PAPER_DATA } from '../../../types';
import lodash from 'lodash';
import { Observer } from 'mobx-react';

export interface Props {
  onBack?: () => void;
  data: URL_PAPER_DATA;
  readonly?: boolean;
}

function URLPaper(props: Props) {
  const [ref, { width, height }] = useMeasure();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [data, setData] = useState<URL_PAPER_DATA>();
  useEffect(() => {
    const _data = lodash.cloneDeep(props?.data);
    setData(_data);
    return () => {};
  }, [props?.data, iframeRef]);
  return (
    <Observer>
      {() => {
        return (
          <div ref={ref} className={styles.testWrap}>
            <iframe
              ref={iframeRef}
              src={data?.url || 'https://ant.design/index-cn'}
              className={styles.iframeWrap}
            />
            {props?.onBack && (
              <Button
                className={styles.btn}
                onClick={() => {
                  props?.onBack && props?.onBack();
                }}
                type="default"
              >
                返回试卷列表(去交卷)
              </Button>
            )}
          </div>
        );
      }}
    </Observer>
  );
}

export default URLPaper;
