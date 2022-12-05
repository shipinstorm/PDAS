import {
  JOB_ROWS_SELECTED,
  JOB_JOB_SELECTED,
  JOB_GRAPH_SELECTED,
  JOB_ARRAY_SELECTED,
  JOB_TASK_SELECTED,
} from '../actionTypes';

const initialState = {
  rowsSelected: [],
  jobSelected: '',
  graphSelected: {},
  arraySelected: {},
  taskSelected: {}
};

export default function foo(state = initialState, action) {
  switch(action.type) {
    case JOB_ROWS_SELECTED:
      return {
        ...state,
        rowsSelected: action.payload
      }
    case JOB_JOB_SELECTED:
      return {
        ...state,
        jobSelected: action.payload
      }
    case JOB_GRAPH_SELECTED:
      return {
        ...state,
        graphSelected: {...action.payload}
      }
    case JOB_ARRAY_SELECTED:
      return {
        ...state,
        arraySelected: {...action.payload}
      }
    case JOB_TASK_SELECTED:
      return {
        ...state,
        taskSelected: {...action.payload}
      }
    default: 
      return state;
  }
}