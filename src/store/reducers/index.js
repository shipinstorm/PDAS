import { combineReducers } from 'redux';

import globalReducer from './globalReducer';
import jobReducer from './jobReducer';

export default combineReducers ({
  global: globalReducer,
  job: jobReducer
});