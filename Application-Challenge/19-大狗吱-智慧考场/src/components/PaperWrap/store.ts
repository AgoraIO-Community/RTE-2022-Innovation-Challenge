import { action, observable, computed, makeObservable } from 'mobx';
import lodash from 'lodash';
import { HTML_MIN_QUESTIONS, HTML_PAPER_DATA, PAPER_DATA } from './types';

class Store {
  constructor() {
    makeObservable(this);
  }

  @observable
  readOnly: boolean = false;

  @observable
  paperData: PAPER_DATA | undefined = undefined;

  @observable
  currentPaper: PAPER_DATA['data'] | undefined = undefined;

  @action
  setReadOnly = (data: boolean) => {
    this.readOnly = !!data;
  };

  @action
  setPaperData = (data: PAPER_DATA) => {
    this.paperData = data;
  };

  @action
  setCurrentPaper = (data: PAPER_DATA['data'] | undefined) => {
    this.currentPaper = JSON.parse(JSON.stringify(data));
  };

  @action
  changeHtmlQuestion = (question: HTML_MIN_QUESTIONS | undefined) => {
    if (question) {
      const _currentPaper: HTML_PAPER_DATA = lodash.cloneDeep(
        this.currentPaper,
      ) as any;
      _currentPaper?.bigQuestions &&
        _currentPaper?.bigQuestions?.forEach((item, bigIndex) => {
          const { questions = [], type } = item;
          questions?.forEach((item, quIndex) => {
            if (item.id === question.id) {
              lodash.set(
                _currentPaper,
                `bigQuestions[${bigIndex}]questions[${quIndex}]`,
                question,
                // lodash.merge(item, question),
              );
            }
          });
        });
      this.setCurrentPaper(_currentPaper);

      const _paperData: PAPER_DATA = lodash.cloneDeep(this.paperData) as any;
      const index = this.paperData?.data?.findIndex(
        (i) => i.id === _currentPaper.id,
      );
      lodash.set(_paperData, `data[${index}]`, _currentPaper);
      this.setPaperData(_paperData);
    }
  };
}

export const store = new Store();
