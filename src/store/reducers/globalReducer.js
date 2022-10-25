import {
  GLOBAL_GRAPH_DATA,
  GLOBAL_ARRAY_DATA,
  GLOBAL_TASK_DATA,
  GLOBAL_SELECTED_DATA,
  GLOBAL_SELECTED_FLAG,
  GLOBAL_EXTERNAL_IP,
  GLOBAL_CODA_HEALTH
} from '../actionTypes';

const initialState = {
  graphData: [],
  arrayData: [],
  taskData: [],
  selectedData: {},
  selectedFlag: 0, // 1 for dGraph, 2 for Array, 3 for Task
  externalIP: false,
  codaHealth: {
    "ES-coda_6": {
      "status": "green"
    }, 
    "mongo-connector": {
      "status": "green"
    }, 
    "rdispatcher": {
      "status": "green"
    }, 
    "rgoferd": {
      "status": "green"
    }, 
    "rqinfod": {
      "status": "green"
    }
  },
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
    case GLOBAL_SELECTED_DATA:
      return {
        ...state,
        selectedData: action.payload
      }
    case GLOBAL_SELECTED_FLAG:
      return {
        ...state,
        selectedFlag: action.payload
      }
    case GLOBAL_EXTERNAL_IP:
      return {
        ...state,
        externalIP: action.payload
      }
    case GLOBAL_CODA_HEALTH:
      return {
        ...state,
        codaHealth: action.payload
      }
    default: 
      return state;
  }
}