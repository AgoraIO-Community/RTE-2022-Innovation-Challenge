import React from 'react';
import "./index.less";
// 使用手册：https://react-pdf-viewer.dev/plugins/toolbar/
import { Viewer } from '@react-pdf-viewer/core';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import type { ToolbarSlot, TransformToolbarSlot } from '@react-pdf-viewer/toolbar';
// import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// 解析PDF文档
import { pdfjs } from "react-pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function Play(props: any) {
  // 包含所有 toolbar default buttons
  // const defaultLayoutPluginInstance = defaultLayoutPlugin(); 

  const { url } = props;
  // 定制工具栏
  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;
  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    // CurrentPageInput, // 跳转页码
    // EnterFullScreen, // 全屏
    // GoToNextPage, // 下一页
    // GoToPreviousPage, // 上一页
    // NumberOfPages, // 页码
    // Zoom, // 放大比例
    // ZoomIn, // 放大
    // ZoomOut, // 缩小

    // These slots will be empty
    Open: () => <></>, // 打开文件
    Download: () => <></>, // 下载PDF
    SwitchTheme: () => <></>, // 切换主题
    Print: () => <></>, // 打印
    ShowSearchPopover: () => <></>, // 搜索
  });
 

  return (
    <div className='play'>
      <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
      <Viewer
          fileUrl={url}
          plugins={[
              // Register plugins
              // defaultLayoutPluginInstance,
              toolbarPluginInstance,
          ]}
      />
    </div>
  );
}