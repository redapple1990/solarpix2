import { CREATE_JOB } from '../actions/types'

const INITIAL_STATE = {
  userName: null,
  projectName: null,
  profileName: null
}

export default (state = INITIAL_STATE, action) => {
  switch (action.type){
    case CREATE_JOB:
      return { ...state,
        userName: action.payload.userName,
        projectName: action.payload.projectName,
        profileName: action.payload.profileName
      };
    default:
      return state;
  }
}
