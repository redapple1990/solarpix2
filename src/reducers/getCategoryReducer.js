import { GET_CATEGORY } from '../actions/types';

export default (state = {}, action) => {
  switch (action.type){
    case GET_CATEGORY:
    console.log()
      return { ...state, [action.payload.id]: action.payload };
    default:
      return state;
  }
}
