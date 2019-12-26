import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import userReducer from './userReducer';
import jobReducer from './jobReducer';
import categoriesReducer from './categoriesReducer';
import pageLocationReducer from './pageLocationReducer';
import currentJobReducer from './currentJobReducer';
import uploadStatusReducer from './uploadStatusReducer';

const appReducer = combineReducers({
  uploadStatus: uploadStatusReducer,
  userData: userReducer,
  jobMeta: currentJobReducer,
  categoryData: categoriesReducer,
  sessions: jobReducer,
  form: formReducer,
  pageLocation: pageLocationReducer
})

/*
const rootReducer = (state, action ) => {
  if (action.type === 'DELETE_JOB'){
    state = undefined
  }
  return appReducer(state, action)
}
*/

//export default rootReducer;
export default appReducer;
