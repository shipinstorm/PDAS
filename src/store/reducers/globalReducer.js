import {
  GLOBAL_GRAPH_DATA,
  GLOBAL_ARRAY_DATA,
  GLOBAL_TASK_DATA
} from '../actionTypes';

const initialState = {
  graphData: [],
  arrayData: [],
  taskData: []
};

export default function foo(state = initialState, action) {
  switch(action.type) {
    case GLOBAL_GRAPH_DATA:
      return {
        ...state,
        graphData: action.payload
      }
    case GLOBAL_ARRAY_DATA:
      return {
        ...state,
        arrayData: action.payload
      }
    case GLOBAL_TASK_DATA:
      return {
        ...state,
        taskData: action.payload
      }
    default: 
      return state;
  }
}