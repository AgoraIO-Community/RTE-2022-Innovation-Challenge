import { ImmerReducer } from 'umi';
import { UserAuthTokenManager } from '@/utils';

export interface IGlobalState {
  token: string | null;
}

export interface GlobalModelType {
  namespace: 'global';
  state: IGlobalState;
  effects: {};
  reducers: {
    saveToken: ImmerReducer<IGlobalState>;
  };
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',

  state: {
    token: UserAuthTokenManager.getToken(),
  },
  effects: {},

  reducers: {
    saveToken(state, action) {
      const token = action?.token;
      UserAuthTokenManager.setToken(token);
      state.token = token;
    },
  },
};

export default GlobalModel;
