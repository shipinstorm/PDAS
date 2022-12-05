import {
  JOB_ROWS_SELECTED,
  JOB_JOB_SELECTED,
  JOB_GRAPH_SELECTED,
  JOB_ARRAY_SELECTED,
  JOB_TASK_SELECTED,
} from '../actionTypes';

export const jobRowsSelected = (selected) => (dispatch) => {
  dispatch({
    type: JOB_ROWS_SELECTED,
    payload: selected
  })
}

export const jobJobSelected = (selected) => (dispatch) => {
  dispatch({
    type: JOB_JOB_SELECTED,
    payload: selected
  })
}

export const jobGraphSelected = (selected) => (dispatch) => {
  dispatch({
    type: JOB_GRAPH_SELECTED,
    payload: selected
  })
}

export const jobArraySelected = (selected) => (dispatch) => {
  dispatch({
    type: JOB_ARRAY_SELECTED,
    payload: selected
  })
}

export const jobTaskSelected = (selected) => (dispatch) => {
  dispatch({
    type: JOB_TASK_SELECTED,
    payload: selected
  })
}