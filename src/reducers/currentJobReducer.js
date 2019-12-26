import { SET_CURRENTJOB, SET_JOBCOUNTER } from '../actions/types'

const initialState = {
  currentJob: '',
  jobCounter: 0
}

export default (state = initialState, action) => {
  switch (action.type){
    case SET_CURRENTJOB:
      return { ...state, currentJob: action.payload };

    case SET_JOBCOUNTER:
      const newCount = state.jobCounter + action.payload;
      return { ...state, jobCounter: newCount };
    default:
      return state;
  }
}
