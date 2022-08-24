import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Upload } from 'antd';
import React, { useEffect } from 'react';
import {
  RcFile as OriRcFile,
  UploadRequestOption as RcCustomRequestOptions,
} from 'rc-upload/lib/interface';
import { PAPER_DATA } from '../..';
import { cosHandleUpload, ossHandleUpload } from '../../utils';
import { UP_CONFIG } from './libs/upFiles';
import lodash from 'lodash';

export interface Props {
  upConfig?: UP_CONFIG;
  initData?: PAPER_DATA;
  onChagne?: (data: any) => void;
}
export default function PDFEditor(props: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      name: props?.initData?.name,
      url: props?.initData?.url
        ? [
            {
              uid: '1',
              name: 'xxx.png',
              status: 'done',
              response: props?.initData?.url, // custom error message to show
              url: props?.initData?.url,
            },
          ]
        : undefined,
    });
    return () => {};
  }, [props.initData]);

  const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
  let customRequest:
    | ((options: RcCustomRequestOptions<any>, upConfig: UP_CONFIG) => void)
    | undefined;
  if (props?.upConfig?.type === 'COS') {
    customRequest = cosHandleUpload;
  }
  if (props?.upConfig?.type === 'OSS') {
    customRequest = ossHandleUpload;
  }

  return (
    <div>
      <Card>
        <Form
          name="control-ref"
          form={form}
          onFinish={() => {
            const data = form.getFieldsValue();
          }}
          onFieldsChange={() => {
            const data = form.getFieldsValue();
            if (props.onChagne && typeof props.onChagne === 'function') {
              props.onChagne({
                name: data.name,
                url: lodash.get(data.url, '[0]response'),
              });
            }
            console.log('data', data);
          }}
        >
          <Form.Item name="name" label="试卷名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {props.upConfig && (
            <Form.Item
              name="url"
              label="试卷文档"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              extra="支持不超过100M的pdf文件"
              rules={[{ required: true }]}
            >
              <Upload
                listType="picture"
                maxCount={1}
                customRequest={(options) => {
                  customRequest && customRequest(options, props.upConfig);
                }}
              >
                <Button icon={<UploadOutlined />}>上传试卷文档</Button>
              </Upload>
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
}
