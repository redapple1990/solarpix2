import { UPLOAD_ALLIMAGES_STATUS } from '../actions/types'

export default (state = {}, action) => {
  switch (action.type){
    case UPLOAD_ALLIMAGES_STATUS:
      let newState = { ...state };
      newState = action.payload;
      return newState;

    default:
      return state;
  }
}
