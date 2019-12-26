import {
  SAVE_PAGELOCATION
} from '../actions/types';


export default (state = {}, action) => {
  switch (action.type){
    case SAVE_PAGELOCATION:
      return { ...state, yValue: action.payload };
    default:
      return state;
  }
}
