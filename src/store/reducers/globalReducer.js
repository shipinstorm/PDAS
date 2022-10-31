import {
  GLOBAL_GRAPH_DATA,
  GLOBAL_ARRAY_DATA,
  GLOBAL_TASK_DATA,
  GLOBAL_EXTERNAL_IP,
  GLOBAL_CODA_HEALTH,
  GLOBAL_IMAGE_PATHS
} from '../actionTypes';

const initialState = {
  graphData: [],
  arrayData: [],
  taskData: [],
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
  imagePaths: {}
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
    case GLOBAL_IMAGE_PATHS:
      return {
        ...state,
        imagePaths: action.payload
      }
    default: 
      return state;
  }
}