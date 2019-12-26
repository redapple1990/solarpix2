import { READ_TXT_FILE } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {
  switch (action.type){
    case READ_TXT_FILE:
    console.log()
      return { ...state, ..._.mapKeys(action.payload, 'id')};
    default:
      return state;
  }
}
