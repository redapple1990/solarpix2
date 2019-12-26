import { GEN_DUMMY } from '../actions/types';
import _ from 'lodash';

export default (state = {}, action) => {
  switch (action.type){
    case GEN_DUMMY:
    console.log()
      return { ...state, ..._.mapKeys(action.payload, 'id')};
    default:
      return state;
  }
}
