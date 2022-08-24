import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Form,
  Button,
  Modal,
  Card,
  Select,
  Space,
  Divider,
  Spin,
  Collapse,
  Image,
  Tooltip,
  Drawer,
} from 'antd';
import {
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  CaretRightOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import lodash from 'lodash';
import { useNetworkState } from 'react-use';
import { Scrollbars } from 'react-custom-scrollbars';
import 'react-custom-scroll/dist/customScroll.css';
import styles from './index.less';
import delay from 'delay';
import classNames from 'classnames';

export default () => {
  return (
    <div>
      <div className={styles.detectionWrap}>
        <Collapse
          defaultActiveKey={[3]}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )}
        >
          <Collapse.Panel header="Windows电脑本地设备自检方法" key="1">
            <Image.PreviewGroup>
              <div className={styles.itemWrap}>
                {[
                  {
                    label: '1、请打开“设置”，选择“系统”',
                    img: require('./assets/windows/1@2x.png'),
                  },
                  {
                    label: '2、选择“声音”，检查扬声器和麦克风是否能正常使用',
                    img: require('./assets/windows/2@2x.png'),
                  },
                  {
                    label: '3、打开“设置”，选择“隐私”',
                    img: require('./assets/windows/3@2x.png'),
                  },
                  {
                    label:
                      ' 4、进入“相机”和“麦克风”，检查相机和麦克风权限是否开启',
                    img: require('./assets/windows/4@2x.png'),
                  },
                ].map((item) => {
                  return (
                    <div key={item.label} className={styles.itemInfo}>
                      <div className={styles.itemInfo}>{item.label}</div>
                      <div className={styles.itemInfo}>
                        <Image src={item.img} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Image.PreviewGroup>
          </Collapse.Panel>
          <Collapse.Panel header="MAC电脑本地设备自检方法" key="2">
            <Image.PreviewGroup>
              <div className={styles.itemWrap}>
                {[
                  {
                    label: '1、进入“系统偏好设置”，选择“声音”',
                    img: require('./assets/mac/5@2x.png'),
                  },
                  {
                    label: '2、检查并调试输入、输出音频设备',
                    img: require('./assets/mac/6@2x.png'),
                  },
                  {
                    label:
                      '3、进入“系统偏好设置”，选择”安全与隐私”,查看是否给本软件开启摄像头权限',
                    img: require('./assets/mac/7@2x.png'),
                  },
                ].map((item) => {
                  return (
                    <div key={item.label} className={styles.itemInfo}>
                      <div className={styles.itemInfo}>{item.label}</div>
                      <div className={styles.itemInfo}>
                        <Image src={item.img} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Image.PreviewGroup>
          </Collapse.Panel>
          <Collapse.Panel header="浏览器自检方法" key="3">
            <Image.PreviewGroup>
              <div className={styles.itemWrap}>
                {[
                  {
                    label: '1、点击浏览器右上角“更多”按钮，点击“设置”',
                    img: require('./assets/browser/8@2x.png'),
                  },
                  {
                    label: '2、找到“隐私设置和安全性”，点击“网站设置”按钮',
                    img: require('./assets/browser/9@2x.png'),
                  },
                  {
                    label: '3、找到“摄像头”、“麦克风”、“声音”进行调试',
                    img: require('./assets/browser/10@2x.png'),
                  },
                ].map((item) => {
                  return (
                    <div key={item.label} className={styles.itemInfo}>
                      <div className={styles.itemInfo}>{item.label}</div>
                      <div className={styles.itemInfo}>
                        <Image src={item.img} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Image.PreviewGroup>
          </Collapse.Panel>
        </Collapse>
      </div>
    </div>
  );
};
