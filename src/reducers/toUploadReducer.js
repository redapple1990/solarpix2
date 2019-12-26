import { TO_UPLOAD } from '../actions/types';

export default (state = {}, action) => {
  switch (action.type){
    case TO_UPLOAD:
      return { ...state, uploadQueue: action.payload };
    default:
      return state;
  }
}
