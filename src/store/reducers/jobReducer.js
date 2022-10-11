import {
  JOB_ROWS_SELECTED,
} from '../actionTypes';

const initialState = {
  rowsSelected: [],
};

export default function foo(state = initialState, action) {
  switch(action.type) {
    case JOB_ROWS_SELECTED:
      return {
        ...state,
        rowsSelected: action.payload
      }
    default: 
      return state;
  }
}