import {
  GLOBAL_GRAPH_DATA,
  GLOBAL_ARRAY_DATA,
  GLOBAL_TASK_DATA,
  GLOBAL_SELECTED_DATA,
  GLOBAL_SELECTED_FLAG,
  GLOBAL_EXTERNAL_IP,
  GLOBAL_CODA_HEALTH
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

export const globalSelectedData = (data) => (dispatch) => {
  dispatch({
    type: GLOBAL_SELECTED_DATA,
    payload: data
  })
}

export const globalSelectedFlag = (data) => (dispatch) => {
  dispatch({
    type: GLOBAL_SELECTED_FLAG,
    payload: data
  })
}

export const globalExternalIP = (data) => (dispatch) => {
  dispatch({
    type: GLOBAL_EXTERNAL_IP,
    payload: data
  })
}

export const globalCodaHealth = (data) => (dispatch) => {
  dispatch({
    type: GLOBAL_CODA_HEALTH,
    payload: data
  })
}