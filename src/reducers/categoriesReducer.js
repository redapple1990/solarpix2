import _ from 'lodash';
import {
  READ_TXT_FILE,
  ENCODE_IMAGE,
  GET_CATEGORY,
  GET_LOCALSTORAGE
} from '../actions/types';


export default (state = {}, action) => {
  switch (action.type){
    case READ_TXT_FILE:
      return { ...state, ..._.mapKeys(action.payload, 'id')};
    case ENCODE_IMAGE:
      return { ...state, [action.payload.id]: action.payload };
    case GET_CATEGORY:
      return { ...state, [action.payload.id]: action.payload };
    case GET_LOCALSTORAGE:
      return { ...state, categories: action.payload };
    /*
    case UPDATE_PHOTOQTY:
      return { ...state, [action.payload.id]: {
          ...state[action.payload.id],
          photoQty: action.payload.photoQty
          //photoQueue: action.payload.photoQueue
        }
      };
    case UPDATE_CATUPLOADSTATUS:
      return { ...state, [action.payload.id]: {
        ...state[action.payload.id],
        catUploadStatus: action.payload.status
        }
      };
    */
    default:
      return state;
  }
}
