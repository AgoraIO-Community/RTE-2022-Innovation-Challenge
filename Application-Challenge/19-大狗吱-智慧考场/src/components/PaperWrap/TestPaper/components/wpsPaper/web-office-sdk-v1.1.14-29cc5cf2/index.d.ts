/**
 * 定义用户头部其它按钮菜单
 */
interface IUserHeaderSubItemsConf {
  /**
   * 类型
   */
  type: 'export_img' | 'split_line' | 'custom';
  /**
   * 文本
   */
  text?: string;
  /**
   * 事件订阅
   */
  subscribe?: ((arg0?: any) => any) | string;
}

/**
 * 定义用户头部按钮配置
 */
interface IUserHeaderButtonConf {
  /**
   * 提示
   */
  tooltip?: string;
  /**
   * 事件订阅
   */
  subscribe?: ((arg0?: any) => any) | string;

  /**
   * 菜单项
   */
  items?: Array<IUserHeaderSubItemsConf>;
}

/**
 * 用于保存iframe原始尺寸
 */
interface IIframeWH {
  width: string;
  height: string;
}

/**
 * 定义用户头部配置
 */
interface IUserHeadersConf {
  /**
   * 返回按钮
   */
  backBtn?: IUserHeaderButtonConf;
  /**
   * 分享按钮
   */
  shareBtn?: IUserHeaderButtonConf;
  /**
   * 其他按钮
   */
  otherMenuBtn?: IUserHeaderButtonConf;
}
interface ICommonOptions {
  /**
   * 是否显示顶部区域，头部和工具栏
   */
  isShowTopArea: boolean;
  /**
   * 是否显示头部
   */
  isShowHeader: boolean;
  /**
   * 是否需要父级全屏
   */
  isParentFullscreen: boolean;
  /**
   * 是否在iframe区域内全屏
   */
  isIframeViewFullscreen: boolean;
  /**
   * 是否在浏览器区域内全屏
   */
  isBrowserViewFullscreen: boolean;
}
/**
 * 文字自定义配置
 */
interface IWpsOptions {
  /**
   * 是否显示目录
   */
  isShowDocMap?: boolean;
  /**
   * 默认以最佳显示比例打开
   */
  isBestScale?: boolean;
  /**
   * pc-是否展示底部状态栏
   */
  isShowBottomStatusBar?: boolean;
}

/**
 * 表格自定义配置
 */
interface IEtOptions {}

/**
 * pdf自定义配置
 */
interface IPDFOptions {
  isShowComment?: boolean;
  isInSafeMode?: boolean;
  /**
   * pc-是否展示底部状态栏
   */
  isShowBottomStatusBar?: boolean;
}

/**
 * 演示自定义配置
 */
interface IWppOptions {
  /**
   * pc-是否展示底部状态栏
   */
  isShowBottomStatusBar?: boolean;
}

/**
 * 定义用户通用事件订阅
 */
interface ISubscriptionsConf {
  [key: string]: any;
  /**
   * 导航事件
   */
  navigate: (arg0?: any) => any;
  /**
   * WPSWEB ready 事件
   */
  ready: (arg0?: any) => any;
  /**
   * 打印事件
   */
  print: {
    custom?: boolean;
    subscribe: (arg0?: any) => any;
  };
  /**
   * 导出 PDF 事件
   */
  exportPdf: (arg0?: any) => any;
}

interface tokenData {
  token: string;
  timeout: number;
}

interface clipboardData {
  text: string;
  html: string;
}

/**
 * 用户配置
 */
interface IConfig {
  /**
   * WPSWEB iframe 挂载点
   */
  mount?: HTMLElement;
  /**
   * url参数
   */
  url?: string;
  wpsUrl?: string; // 即将废弃
  /**
   * 头部
   */
  headers?: IUserHeadersConf;
  /**
   * 通用配置
   */
  commonOptions?: ICommonOptions;
  /**
   * 文字自定义配置
   */
  wpsOptions?: IWpsOptions;
  wordOptions?: IWppOptions;
  /**
   * 表格自定义配置
   */
  etOptions?: IEtOptions;
  excelOptions?: IEtOptions;
  /**
   * 演示自定义配置
   */
  wppOptions?: IWppOptions;
  pptOptions?: IWppOptions;
  /**
   * pdf自定义配置
   */
  pdfOptions?: IPDFOptions;
  /**
   * 事件订阅
   */
  subscriptions?: ISubscriptionsConf;
  // 调试模式
  debug?: boolean;
  commandBars?: Array<IWpsCommandBars>;
  print?: {
    custom?: boolean;
    callback?: string;
  };

  exportPdf?: {
    callback?: string;
  };

  // 获取token
  refreshToken?: () => tokenData | Promise<tokenData>;
  // 获取外部粘贴数据
  getClipboardData?: () => clipboardData | Promise<clipboardData>;
  onToast?: (toastData: { msg: string; action: string }) => void;
  onHyperLinkOpen?: (linkData: { linkUrl: string }) => void;
  cooperUserAttribute?: {
    isCooperUsersAvatarVisible?: boolean;
    cooperUsersColor?: [
      {
        userId: string | number;
        color: string;
      },
    ];
  };
}

/** ============================= */
interface IMessage {
  eventName: string;
  msgId?: number;
  callbackId?: number;
  data?: any;
  url?: any;
  result?: any;
  error?: any;
}

/**
 *  WPSWEBAPI
 */
interface IWpsWebApi {
  WpsApplication?: () => any;
}

/**
 *  工具栏
 */
interface IWpsCommandBars {
  cmbId: string;
  attributes: Array<IWpsCommandBarAttr> | IWpsCommandBarObjectAttr;
}

/**
 *  工具栏属性
 */
interface IWpsCommandBarAttr {
  name: string;
  value: any;
}
/**
 *  工具栏属性
 */
interface IWpsCommandBarObjectAttr {
  [propName: string]: any;
}

/**
 * D.IWPS 定义
 */

interface IWps {
  version: string;
  url: string;
  iframe: any;
  Enum?: any; // 即将废弃
  Events?: any; // 即将废弃
  Props?: string;
  mainVersion?: string;
  ready: () => Promise<any>;
  destroy: () => Promise<any>;
  WpsApplication?: () => any;
  WordApplication?: () => any;
  EtApplication?: () => any;
  ExcelApplication?: () => any;
  WppApplication?: () => any;
  PPTApplication?: () => any;
  PDFApplication?: () => any;
  Application?: any;
  setToken: (tokenData: {
    token: string;
    timeout?: number;
    hasRefreshTokenConfig: boolean;
  }) => Promise<any>;
  setCommandBars: (args: Array<IWpsCommandBars>) => Promise<void>;
  tabs: {
    getTabs: () => Promise<Array<{ tabKey: number; text: string }>>;
    switchTab: (tabKey: number) => Promise<any>;
  };
  setCooperUserColor: (
    usersInfo: Array<{ userId: string; color: string }>,
  ) => Promise<any>;
  tokenData?: { token: string } | null;
  commandBars?: Array<IWpsCommandBars> | null;
  iframeReady?: boolean;
  save: () => Promise<any>;
  on: (eventName: string, handle: (event?: any) => void) => void;
  off: (eventName: string, handle: (event?: any) => void) => void;
  Stack?: any;
  Free?: (objId: any) => Promise<any>;
  updateConfig(configData: {
    commandBars?: Array<IWpsCommandBars>;
  }): Promise<void>;
  executeCommandBar: (id: string) => void;
}

interface IFlag {
  apiReadySended: boolean;
  refreshToken?: () => tokenData | Promise<tokenData>;
  getClipboardData?: () => clipboardData | Promise<clipboardData>;
  onToast?: (toastData: { msg: string; action: string }) => void;
  onHyperLinkOpen?: (linkData: { linkUrl: string }) => void;
}

type TGetClipboardData = () => clipboardData | Promise<clipboardData>;

interface WebOfficeSDK {
  config: (conf: IConfig) => IWps;
}

export default WebOfficeSDK;
export {
  ICommonOptions,
  IConfig,
  IEtOptions,
  IFlag,
  IIframeWH,
  IMessage,
  IPDFOptions,
  ISubscriptionsConf,
  IUserHeaderButtonConf,
  IUserHeaderSubItemsConf,
  IUserHeadersConf,
  IWppOptions,
  IWps,
  IWpsCommandBarAttr,
  IWpsCommandBarObjectAttr,
  IWpsCommandBars,
  IWpsOptions,
  IWpsWebApi,
  TGetClipboardData,
  clipboardData,
  tokenData,
};
