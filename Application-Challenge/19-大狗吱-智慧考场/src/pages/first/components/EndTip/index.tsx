import React, { useEffect } from 'react';
import { Howl, Howler } from 'howler';
import styles from './index.less';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import classNames from 'classnames';
import willEndTipUrl from './assets/willEndTip.mp3';
import endTipUrl from './assets/endTip.mp3';

function EndTip() {
  useEffect(() => {
    var sound = new Howl({
      src: [willEndTipUrl],
    });
    sound.play();
    return () => {};
  }, []);
  return (
    <div className={styles.alertInfo}>
      <ExclamationCircleOutlined className={styles.alertIcon} />
      <span className={styles.alertText}>考试即将结束，请尽快做答并提交</span>
    </div>
  );
}

export default EndTip;

export class EndTipTools {
  static isOpen: boolean = false;
  static showEndModal(callback?: () => void) {
    var sound = new Howl({
      src: [endTipUrl],
    });
    sound.play();
    if (!this.isOpen) {
      this.isOpen = true;
    } else {
      return;
    }
    return Modal.info({
      className: styles.globalModal,
      icon: <div className={classNames(styles.modalIcon, styles.infoIcon)} />,
      centered: true,
      closable: true,
      title: '提示',
      content: '本场考试已结束',
      okText: '确定',
      onOk: () => {
        this.isOpen = false;
        if (callback && typeof callback === 'function') {
          callback();
        }
      },
      onCancel: () => {
        this.isOpen = false;
      },
    });
  }
}