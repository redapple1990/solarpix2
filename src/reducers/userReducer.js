import { SET_USERNAME } from '../actions/types'

export default (state = {}, action) => {
  switch (action.type){
    case SET_USERNAME:

      //return { ...state, action.payload };

      let newState = { ...state };
      newState = action.payload;
      return newState;


    default:
      return state;
  }
}
