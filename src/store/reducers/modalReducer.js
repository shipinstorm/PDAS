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
import { ModalType } from '../../types/ModalType';

const initialState = {
  confirmObj: {},
  modalType: ModalType.Loading,
  /**
   * 0 for none
   * 1 for show
   * 2 for showDialog
   * 3 for hideLoad
   * 4 for showLoad
   */
  modalFlag: 0,
  /**
   * 0 for none
   * 1 for confirmCallBack
   * 2 for killCallBack
   * 3 for killToDoneCallBack
   * 4 for cancelCallBack
   */
  modalCallBack: 0,
  hostsObj: [],
  modalValue: {},
  localExclusive: false,
  selectedHosts: []
};

export default function foo(state = initialState, action) {
  switch (action.type) {
    case MODAL_CONFIRM_OBJ:
      return {
        ...state,
        confirmObj: action.payload
      }
    case MODAL_TYPE:
      return {
        ...state,
        modalType: action.payload
      }
    case MODAL_FLAG:
      return {
        ...state,
        modalFlag: action.payload
      }
    case MODAL_CALLBACK:
      return {
        ...state,
        modalCallBack: action.payload
      }
    case MODAL_HOSTS_OBJ:
      return {
        ...state,
        hostsObj: action.payload
      }
    case MODAL_VALUE:
      return {
        ...state,
        modalValue: action.payload
      }
    case MODAL_LOCAL_EXCLUSIVE:
      return {
        ...state,
        localExclusive: action.payload
      }
    case MODAL_SELECTED_HOSTS:
      return {
        ...state,
        selectedHosts: action.payload
      }
    default:
      return state;
  }
}