export enum TypeEnum {
  /**
   * 考卷为PDF 类型
   */
  'PDF' = 'PDF',
  /**
   * 考卷为 自定义在线
   */
  'HTML' = 'HTML',
  /**
   * 考卷为金山 WPS 类型
   */
  'WPS' = 'WPS',
  /**
   * 考卷为 一个url地址 类型
   */
  'URL' = 'URL',
}

export enum ChangePapersEvent {
  '更新标记' = 'FLAGE',
  '更新答案' = 'SAVE_ANSWER',
  '交卷' = 'SAVE_PAPERS',
}

export type OnGetTestPaper = () => Promise<PAPER_DATA>;

export type OnChangePapers = (type: ChangePapersEvent, data: PAPER_DATA, changePaperId?: string) => any;

export interface CURRENT_PAPER_DATA {
  type: TypeEnum;
  data: PDF_PAPER_DATA | HTML_PAPER_DATA | URL_PAPER_DATA | WPS_PAPER_DATA;
}

export interface PAPER_DATA {
  type: TypeEnum;
  data: Array<
    PDF_PAPER_DATA | HTML_PAPER_DATA | URL_PAPER_DATA | WPS_PAPER_DATA
  >;
}

export interface PDF_PAPER_DATA {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  url: string;
  answerSheetUrl: string;
}

export interface HTML_PAPER_DATA {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  bigQuestions: Array<HTML_BIG_QUESTIONS>;
  totalQuestion: number;
  totalMustQuestion: number;
  totalScore: number;
}

export interface URL_PAPER_DATA {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  url: string;
}

export interface WPS_PAPER_DATA {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  url: string;
}

export enum BigQuestionsType {
  '单选' = 1,
  '多选' = 2,
  '判断' = 3,
  '问答' = 4,
}

export interface HTML_BIG_QUESTIONS {
  id: string;
  /**
   *
   */
  type: BigQuestionsType;
  questions: Array<HTML_MIN_QUESTIONS>;
}

export interface HTML_MIN_QUESTIONS {
  id: string;
  score: number;
  answerType: number;
  description: string;
  type: BigQuestionsType;
  difficulty: number;
  options: Array<{
    desc: string;
    is_right: boolean;
  }>;
  respond: string[];
  flag: boolean;
}

export enum A_Z {
  'A' = 0,
  'B' = 1,
  'C' = 2,
  'D' = 3,
  'E' = 4,
  'F' = 5,
  'G' = 6,
  'H' = 7,
  'I' = 8,
  'J' = 9,
  'K' = 10,
  'L' = 11,
  'M' = 12,
  'N' = 13,
  'O' = 14,
  'P' = 15,
  'Q' = 16,
  'R' = 17,
  'S' = 18,
  'T' = 19,
  'U' = 20,
  'V' = 21,
  'W' = 22,
  'X' = 23,
  'Y' = 24,
  'Z' = 25,
}
