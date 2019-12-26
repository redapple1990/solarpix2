import files from '../apis/files';
import categoryListFile_install from '../categoryListFile_install';
import categoryListFile_pcsv from '../categoryListFile_pcsv';
import categoryListFile_salessv from '../categoryListFile_salessv';
import { normalize } from 'normalizr';
import { job } from '../schemas/schemas';
import db from '../database/db';
import uploadImage from '../apis/uploadImage';

//types.js just has action name/types for easier bug catching
import {
  ADD_JOB,
  READ_TXT_FILE,
  GEN_DUMMY,
  GET_CATEGORY,
  ADD_PHOTO,
  TO_UPLOAD,
  UPDATE_PHOTOQTY,
  DELETE_JOB,
  UPDATE_CATUPLOADSTATUS,
  SAVE_PAGELOCATION,
  SET_USERNAME,
  CREATE_JOBLIST,
  SET_CURRENTJOB,
  SET_JOBCOUNTER,
  UPLOAD_ALLIMAGES,
  UPLOAD_ALLIMAGES_STATUS,
  UPDATE_JOBCOLOR
} from './types';


export const updateJobColor = (job, color) => {

  return {
    type: UPDATE_JOBCOLOR,
    payload: {
      color: color,
      jobId: job
    }
  }
}

export const updateUploadStatus = (status) => {

  return {
    type: UPLOAD_ALLIMAGES_STATUS,
    payload: status
  }
}

/*
Get all photos that are not uploaded,
for loop upload them all.  On success, update the db entry and the category uploadStatus for the photo

*/
export const uploadAllPhotos = () => async (dispatch, getState) => {

  console.log('entered uploadAllPhotos');
  if(!db.isOpen()){
    db.open();
  }
  let photoArray = [];
  let successArray = [];
  let failArray = [];
  let uniqueSuccess = [];
  let uniqueObjs = [];
  //See if there are photos w/ "notUploaded" status
  //const photosToUpload = await db.table().where('uploadStatus').equals('notUploaded').toArray();
  const tables = db.tables;
  for(let i=0; i<tables.length; i++){
    const tempArray = await db.table(tables[i].name).where('uploadStatus').equals('notUploaded').toArray();
    photoArray = photoArray.concat(tempArray);
  }
  //console.log('This is photoArray: ', photoArray, photoArray.length);
  //photoArray now has all photos
  if(photoArray.length !== 0){
    //begin automatic upload
    for(let j=0; j<photoArray.length; j++){
      const photoData = photoArray[j];
      try{
        //Upload photo, update db status
        dispatch(updateCatUploadStatus(photoData.photoId[0], 'waiting', photoData.pictureReq));
        await uploadImage(photoData.photo);
        await db.table(photoData.job).update(photoData.photoId, { uploadStatus: 'uploaded' });
        successArray.push({ job: photoData.job, pictureReq: photoData.pictureReq, categoryId: photoData.photoId[0] });
        //updateCatUploadStatus(categoryId, 'success', photoData.pictureReq);

      }
      catch (e){
        failArray.push({ job: photoData.job, pictureReq: photoData.pictureReq, categoryId: photoData.photoId[0] });
        console.log(e);
      }
    }
    console.log('successArray', successArray, 'failArray', failArray);
    //After for loop finishes, Get all unique uploads and update all category upload icons (code from CategoryEdit)
    try{
      uniqueSuccess = [...new Set(successArray.map(x => JSON.stringify(x)))];
      uniqueObjs = [...new Set(uniqueSuccess.map(x => JSON.parse(x)))];
    }
    catch (e){
      console.log(e);
    }

    console.log('uniqueObjs', uniqueObjs);
    for(let k=0; k<uniqueObjs.length; k++){
      const successUpload = uniqueObjs[k];
      let status = 'neutral';

      try{
        //This query grabs all photos in this category whose uploadStatus is 'notUploaded'
        const localCatPhotosCount = await db.table(successUpload.job)
          .where('uploadStatus').equals('notUploaded')
          .and((result) => {
            //console.log('result ',result);
            const tempArray = result.photoId.split('_');
            return tempArray[0] === `${successUpload.categoryId}`;
          })
          .count();
        //console.log('This is localCatPhotosCount: ', localCatPhotosCount);

        //If there are no photos, all photos are uploaded, otherwise, there are still local photos
        if(localCatPhotosCount === 0){
          //console.log('Query found no photos: Success');
          status = 'success';
        }
        else{
          //console.log('Query found photos: Fail');
          status = 'fail';
        }
        //update status
        dispatch(updateCatUploadStatus(successUpload.categoryId, status, successUpload.pictureReq));
      }
      catch (e) {
        console.log('Query failed: ',e);
      }
    }
    //dispatch(updateUploadStatus(''));
  }

  else{
    //dispatch(updateUploadStatus(''));
  }




  dispatch({ type: UPLOAD_ALLIMAGES, payload:  0 });

}

export const setJobCounter = (increment) => {

  return{
    type: SET_JOBCOUNTER,
    payload: increment
  }
}

export const setCurrentJob = (jobId) => {

  return{
    type: SET_CURRENTJOB,
    payload: jobId
  }
}

export const setUsername = (userName) => {
  return{
    type: SET_USERNAME,
    payload: userName
  }
}

//Saves window page y so that users return to the same location on categoryList page
export const saveLocation = (location) => {

  return{
    type: SAVE_PAGELOCATION,
    payload: location
  }
}

//Sets category property 'uploadStatus'.  Used to show unique icon
export const updateCatUploadStatus = (categoryId, status, photoReq) => {

  return{
    type: UPDATE_CATUPLOADSTATUS,
    payload: {
      status: status,
      categoryId: categoryId,
      photoReq: photoReq
    }
  }
}

//Delete job, pictureReqs for jobId (db table deleted in DeleteJob component)
export const deleteJob = (jobId, pictureReq) => {
  //window.localStorage.clear();
  //

  return{
    type: DELETE_JOB,
    payload: {
      jobId: jobId,
      pictureReq: pictureReq
    }
  }
}

/*
//UNUSED: save in case we need upload image response in store
export const uploadImage = (image) => async (dispatch, getState) => {

  //Set up necessary parameters for POST to EmPower server
  const authParam = { username: 'upload', password: 'nD2Qm9t4' };
  //const params = { name: 'upload', filname: 'test_Filename' }
  const url = 'http://upload.empower-solar.com/index2.php';

  //Set up necessary parameters for CORS proxy
  const config = {
    auth: authParam
  }

  const formData = new FormData();
  formData.append('upload',image);

  try{
    const response = await files.post(url, formData, config);
    dispatch({ type: UPLOAD_IMAGE, payload: response.data });
  }
  catch(err){
    console.log('POST failed: ', err);
  }

};
*/

export const updatePhotoQty = (categoryId, photoQty, photoReq) => {
  return{
    type: UPDATE_PHOTOQTY,
    payload: {
      categoryId: categoryId,
      photoQty: photoQty,
      photoReq: photoReq
    }
  }
}

//UNUSED
//Add image to uploadQueue
export const toUploadQueue = (id, dataURL) => {

  return {
    type: TO_UPLOAD,
    payload: {
      id: id,
      dataURL: dataURL,
      uploadStatus: false
    }
  }
}

//UNUSED
//Adds photo to photoQueue for specific category
export const addPhoto = (id, photoQty, photoQueue) => {

  return{
    type: ADD_PHOTO,
    payload: {
      id: id,
      photoQty: photoQty,
      photoQueue: photoQueue
    }
  }

}

/*
1.  Create object array using text file based on profileName
2.  For every superCategory, add a unique color to all categories
3.  Create normalized object to put into store (job -> photoReqs)
*/

//TODO:  Perform steps 1 & 2 once for all unique profileNames, then store the data in the store(?) for future use
export const createJobList = (projectName, profileName, jobCounter) => async (dispatch) => {

  //const initialJobId = 'job1';
  let colormap = require('colormap');

  var categoryArray = [];
  var superCatArray = [];
  var counter = 0;

  //Choose which categorylistFile to choose based on profileName
  let response;
  switch(profileName){
    case 'install':
      response = await files.get(categoryListFile_install);
      break;

    case 'pcsv':
      response = await files.get(categoryListFile_pcsv);
      break;

    case 'salessv':
      response = await files.get(categoryListFile_salessv);
      break;

    default:
      response = await files.get(categoryListFile_install);
      break;

  }

  //create array of strings
  var textArray = response.data.split(/\n/);
  //For each String, split string into id/title/description properties
  //id generated by counter (dynamic for categorylist future proofing)
  textArray.forEach( category => {
    //For some reason there's a blank category/newline in the textFile, filter w/ category
    if(category){
      var tempArray = category.split("|");
      var obj = { id:counter, title:tempArray[0], description: tempArray[1], photoQty: 0, catUploadStatus: 'neutral' };
      categoryArray.push(obj);
      superCatArray.push(obj.title[0]);
      counter += 1;
    }
  });

  //Assigning unique colors for each supercategory
  //Color spectrum minimum is 11 colors (Package)
  const uniqueSuperCats = [...new Set(superCatArray)];
  let colorCount = 11
  if(uniqueSuperCats.length > 11){
    colorCount = uniqueSuperCats.length;
  }
  let colors = colormap({
    colormap: 'hsv',
    nshades: colorCount,
    format: 'rgba',
    alpha: 0.2
  })
  //console.log(colors)

  categoryArray.forEach( category => {
    category.cellColor = colors[parseInt(category.title[0])];
  });

  const jobId = `job${jobCounter}`
  const pictureReqId = `pictureReq${jobCounter}`

  const jobData = {
    id: jobId,
    projectName: projectName,
    profileName: profileName,
    pictureReqs: {
        id: pictureReqId, jobId: jobId, categories: categoryArray
      },
    color: ''
  }

  const normalJobData = normalize(jobData, job);
  //console.log(normalJobData);

  dispatch({ type: CREATE_JOBLIST,
    payload: normalJobData
  })
/*

  return{
    type: CREATE_JOBLIST,
    payload:
      { [initialJobId]:
        {
          id: initialJobId,
          projectName: projectName,
          profileName: profileName
        }
      }
  }
*/
}

//Submit button saves NewJob data
export const addNewJob = (projectName, profileName, jobCounter) => async (dispatch) => {

  //const initialJobId = 'job1';
  let colormap = require('colormap');

  var categoryArray = [];
  var superCatArray = [];
  var counter = 0;

  //Choose which categorylistFile to choose based on profileName
  let response;
  switch(profileName){
    case 'install':
      response = await files.get(categoryListFile_install);
      break;

    case 'pcsv':
      response = await files.get(categoryListFile_pcsv);
      break;

    case 'salessv':
      response = await files.get(categoryListFile_salessv);
      break;

    default:
      response = await files.get(categoryListFile_install);
      break;

  }

  //create array of strings
  var textArray = response.data.split(/\n/);
  //For each String, split string into id/title/description properties
  //id generated by counter (dynamic for categorylist future proofing)
  textArray.forEach( category => {
    //For some reason there's a blank category/newline in the textFile, filter w/ category
    if(category){
      var tempArray = category.split("|");
      var obj = { id:counter, title:tempArray[0], description: tempArray[1], photoQty: 0, catUploadStatus: 'neutral' };
      categoryArray.push(obj);
      superCatArray.push(obj.title[0]);
      counter += 1;
    }
  });

  //Assigning unique colors for each supercategory
  const uniqueSuperCats = [...new Set(superCatArray)];
  let colorCount = 11
  if(uniqueSuperCats.length > 11){
    colorCount = uniqueSuperCats.length;
  }
  let colors = colormap({
    colormap: 'hsv',
    nshades: colorCount,
    format: 'rgba',
    alpha: 0.2
  })
  //console.log(colors)

  categoryArray.forEach( category => {
    category.cellColor = colors[parseInt(category.title[0])];
  });


  const jobId = `job${jobCounter}`
  const pictureReqId = `pictureReq${jobCounter}`

  const jobData = {
    id: jobId,
    projectName: projectName,
    profileName: profileName,
    pictureReqs: pictureReqId,
    color: ''
  }

  const pictureReqData = {
    id: pictureReqId,
    jobId: jobId,
    categories: categoryArray
  }

  //const normalJobData = normalize(jobData, job);
  //console.log(normalJobData);

  dispatch({ type: ADD_JOB,
    payload: {
      jobId: jobId,
      pictureReqId: pictureReqId,
      jobData: jobData,
      pictureReqData: pictureReqData
    }
  })
}

//Reads text file using axios.
//Waits for response before dispatching action
//Splits response into objects with proper properties


export const readTextFile = (textFile) => async dispatch => {
    let colormap = require('colormap');

    var categoryArray = [];
    var superCatArray = [];
    var counter = 0;
    //get categories file from component
    const response = await files.get(textFile);
    //create array of strings
    var textArray = response.data.split(/\n/);
    //For each String, split string into id/title/description properties
    //id generated by counter (dynamic for categorylist future proofing)
    textArray.forEach( category => {
      //For some reason there's a blank category/newline in the textFile, filter w/ category
      if(category){
        var tempArray = category.split("|");
        var obj = { id:counter, title:tempArray[0], description: tempArray[1], photoQty: 0, catUploadStatus: 'neutral' };
        categoryArray.push(obj);
        superCatArray.push(obj.title[0]);
        counter += 1;
      }
    });

    //Assigning unique colors for each supercategory
    const uniqueSuperCats = [...new Set(superCatArray)];
    let colorCount = 11
    if(uniqueSuperCats.length > 11){
      colorCount = uniqueSuperCats.length;
    }
    let colors = colormap({
      colormap: 'hsv',
      nshades: colorCount,
      format: 'rgba',
      alpha: 0.2
    })
    //console.log(colors)

    categoryArray.forEach( category => {
      category.cellColor = colors[parseInt(category.title[0])];
    });

    dispatch({ type: READ_TXT_FILE, payload: categoryArray })
}

//Gets individual category data from store
export const getCategory = (id) => (dispatch, getState) => {
  //console.log(getState());
  const currentJobId = getState().currentJob;
  const currentPictureReqs = getState().sessions.entities.jobs[currentJobId].pictureReqs;

  const category = getState().sessions.entities.pictureReqs[currentPictureReqs].categories[id];
  //const category = getState().categories[id];
  //console.log(category);

  dispatch({ type: GET_CATEGORY, payload: category });
}

//Dev action creator, unnecessary
//Provides dummy values (set up before getting readTextFile wired)
export const genDummyValues = () => {
  return{
    type: GEN_DUMMY,
    payload:
      [
        {id:0, title:'Category 1', description: 'a1'},
        {id:1, title:'Category 2', description: 'a2'},
        {id:2, title:'Category 3', description: 'a3'},
        {id:3, title:'Category 1', description: 'a1'},
        {id:4, title:'Category 2', description: 'a2'},
        {id:5, title:'Category 3', description: 'a3'},
        {id:6, title:'Category 1', description: 'a1'},
        {id:7, title:'Category 2', description: 'a2'},
        {id:8, title:'Category 3', description: 'a3'},
        {id:9, title:'Category 1', description: 'a1'},
        {id:10, title:'Category 2', description: 'a2'},
        {id:11, title:'Category 3', description: 'a3'}
      ]
  }
}
