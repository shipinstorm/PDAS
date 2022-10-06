import {
  GLOBAL_GRAPH_DATA,
  GLOBAL_ARRAY_DATA,
  GLOBAL_TASK_DATA
} from '../actionTypes';

export const globalGraphData = (data) => (dispatch) => {
  dispatch({
    type: GLOBAL_GRAPH_DATA,
    payload: data
  })
}

export const globalArrayData = (data) => (dispatch) => {
  dispatch({
    type: GLOBAL_ARRAY_DATA,
    payload: data
  })
}

export const globalTaskData = (data) => (dispatch) => {
  dispatch({
    type: GLOBAL_TASK_DATA,
    payload: data
  })
}