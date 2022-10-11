import {
  JOB_ROWS_SELECTED,
} from '../actionTypes';

export const jobRowsSelected = (selected) => (dispatch) => {
  dispatch({
    type: JOB_ROWS_SELECTED,
    payload: selected
  })
}