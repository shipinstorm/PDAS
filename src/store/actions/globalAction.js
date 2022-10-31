import {
  GLOBAL_GRAPH_DATA,
  GLOBAL_ARRAY_DATA,
  GLOBAL_TASK_DATA,
  GLOBAL_EXTERNAL_IP,
  GLOBAL_CODA_HEALTH,
  GLOBAL_IMAGE_PATHS
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

export const globalImagePaths = (data) => (dispatch) => {
  dispatch({
    type: GLOBAL_IMAGE_PATHS,
    payload: data
  })
}