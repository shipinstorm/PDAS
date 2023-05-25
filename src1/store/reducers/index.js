import { combineReducers } from 'redux';

import globalReducer from './globalReducer';
import jobReducer from './jobReducer';
import modalReducer from './modalReducer';

export default combineReducers ({
  global: globalReducer,
  job: jobReducer,
  modal: modalReducer
});