//import { CREATE_JOBLIST, ADD_JOB } from '../actions/types'
//import _ from 'lodash'
import {
  CREATE_JOBLIST,
  ADD_JOB,
  DELETE_JOB,
  UPDATE_PHOTOQTY,
  UPDATE_CATUPLOADSTATUS,
  UPDATE_JOBCOLOR
 } from '../actions/types'
//import { normalize } from 'normalizr';

export default (state = {}, action) => {
  switch (action.type){
    case CREATE_JOBLIST:
      let newState = { ...state };
      newState = action.payload;
      return newState;
      //return { ...state };
      //return { ...state, ..._.mapKeys(action.payload, 'id') }
    case UPDATE_PHOTOQTY:
      newState = { ...state };
      //Normalizr was supposed to make these easier?!?!
      newState.entities.pictureReqs[action.payload.photoReq].categories[action.payload.categoryId].photoQty = action.payload.photoQty;
      return newState;

    case DELETE_JOB:
      //Do I even need to do this w/ lodash?
      newState = { ...state };
      /*
      Doesn't work for some reason.  Supposed to completely remove from object
      _.omit(newState.entities.jobs, action.payload.jobId);
      _.omit(newState.entities.pictureReqs, action.payload.pictureReq);
      */
      newState.entities.jobs[action.payload.jobId] = undefined;
      newState.entities.pictureReqs[action.payload.pictureReq] = undefined;
      return newState;

    case ADD_JOB:
      newState = { ...state };
      newState.entities.jobs[action.payload.jobId] = action.payload.jobData;
      newState.entities.pictureReqs[action.payload.pictureReqId] = action.payload.pictureReqData;
      return newState;

    case UPDATE_CATUPLOADSTATUS:
      newState = { ...state };
      //Normalizr was supposed to make these easier?!?!
      newState.entities.pictureReqs[action.payload.photoReq].categories[action.payload.categoryId].catUploadStatus = action.payload.status;
      return newState;

    case UPDATE_JOBCOLOR:
      newState = { ...state };
      newState.entities.jobs[action.payload.jobId].color = action.payload.color;
      return newState;

    default:
      return state;
  }
}
