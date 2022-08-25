import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.less';
import { useMeasure, usePermission } from 'react-use';
import WebOfficeSDK, { IWps } from './web-office-sdk-v1.1.14-29cc5cf2';
import { Button } from 'antd';
import { WPS_PAPER_DATA } from '../../../types';
import lodash from 'lodash';
import { Observer } from 'mobx-react';

export interface Props {
  onBack?: () => void;
  data: WPS_PAPER_DATA;
  readonly?: boolean;
}

function WPSPaper(props: Props) {
  const [ref, { width, height }] = useMeasure();
  const sdkRef = useRef<WebOfficeSDK>();
  const wpsRef = useRef<HTMLDivElement>();
  const [data, setData] = useState<WPS_PAPER_DATA>();
  const loadSDK = async () => {
    try {
      console.log('WPSSDK loading start');
      const WPSSDK: WebOfficeSDK =
        require('./web-office-sdk-v1.1.14-29cc5cf2/web-office-sdk-v1.1.14.es.js')?.default;
      console.log(WPSSDK);
      sdkRef.current = WPSSDK;
      console.log('WPSSDK', WPSSDK);

      const jssdk: IWps = WPSSDK.config({
        url: data?.url,
        // 开发的时候可以先前往 kdocs.cn 获取预览地址
        // 例如：https://www.kdocs.cn/p/xxxx?from=docs
        // url: 'https://wwo.wps.cn/office/f/132aa30a87064?_w_appid=1a3cc59ef1384b8baebd39dd7af708bc&_w_signature=XT%2BL%2BJbFoWlhGMYfQPjL8FQ7gjQ%3D',
        // url: 'https://dagouzhi.oss-cn-qingdao.aliyuncs.com/assets/wpsTest/%E6%96%87%E5%AD%97%E6%B5%8B%E8%AF%95%E6%96%87%E4%BB%B6.docx',
        // url: 'https://dagouzhi.oss-cn-qingdao.aliyuncs.com/assets/wpsTest/%E6%BC%94%E7%A4%BA%E6%B5%8B%E8%AF%95%E6%96%87%E4%BB%B6.pptx',
        // url: 'https://dagouzhi.oss-cn-qingdao.aliyuncs.com/assets/wpsTest/%E8%A1%A8%E6%A0%BC%E6%B5%8B%E8%AF%95%E6%96%87%E4%BB%B6.xlsx',
        mount: wpsRef.current,
      });

      jssdk.setToken({
        token: '',
        timeout: 10 * 60 * 1000,
        hasRefreshTokenConfig: false,
      });
    } catch (err) {
      console.error('WPSSDK error:', err);
    } finally {
      console.log('WPSSDK loading end');
    }
  };
  useEffect(() => {
    loadSDK();
    return () => {};
  }, [wpsRef, data]);

  useEffect(() => {
    const _data = lodash.cloneDeep(props?.data);
    setData(_data);
    return () => {};
  }, [props?.data]);
  return (
    <Observer>
      {() => {
        return (
          <div ref={ref} className={styles.testWrap}>
            <div ref={wpsRef} className={styles.wpsWrap} />
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

export default WPSPaper;
