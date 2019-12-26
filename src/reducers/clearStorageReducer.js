import {
  CLEAR_LOCALSTORAGE
} from '../actions/types';


export default (state = {}, action) => {
  switch (action.type){
    case CLEAR_LOCALSTORAGE:
      return { ...state, categories: undefined, newJob: undefined };
    default:
      return state;
  }
}
