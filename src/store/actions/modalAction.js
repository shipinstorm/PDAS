import {
  MODAL_CONFIRM_OBJ,
  MODAL_TYPE,
  MODAL_FLAG,
  MODAL_CALLBACK,
  MODAL_HOSTS_OBJ,
  MODAL_VALUE,
  MODAL_LOCAL_EXCLUSIVE,
  MODAL_SELECTED_HOSTS
} from '../actionTypes';

export const modalConfirmObj = (data) => (dispatch) => {
  dispatch({
    type: MODAL_CONFIRM_OBJ,
    payload: data
  })
}

export const modalUpdateType = (data) => (dispatch) => {
  dispatch({
    type: MODAL_TYPE,
    payload: data
  })
}

export const modalUpdateFlag = (data) => (dispatch) => {
  dispatch({
    type: MODAL_FLAG,
    payload: data
  })
}

export const modalCallBack = (data) => (dispatch) => {
  dispatch({
    type: MODAL_CALLBACK,
    payload: data
  })
}

export const modalHostsObj = (data) => (dispatch) => {
  dispatch({
    type: MODAL_HOSTS_OBJ,
    payload: data
  })
}

export const modalUpdateValue = (data) => (dispatch) => {
  dispatch({
    type: MODAL_VALUE,
    payload: data
  })
}

export const modalLocalExclusive = (data) => (dispatch) => {
  dispatch({
    type: MODAL_LOCAL_EXCLUSIVE,
    payload: data
  })
}

export const modalSelectedHosts = (data) => (dispatch) => {
  dispatch({
    type: MODAL_SELECTED_HOSTS,
    payload: data
  })
}
