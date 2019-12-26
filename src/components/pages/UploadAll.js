import React from 'react';
import Modal from '../Modal';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { updateCatUploadStatus } from '../../actions';

import uploadImage from '../../apis/uploadImage';
import db from '../../database/db';

import { withToastManager } from 'react-toast-notifications';

class UploadAll extends React.Component {

  state = {
    cancel: false,
    images: []
  }

  /*
  Upload all photos whose uploadStatus is "False"
  1.  Get all photos from db whose uploadStatus is "False"
  2.  For loop upload all of them

  Notes:
  Show single notification for all uploads.  Show single notification for error, show all failed filenames (eh)
  */
  componentDidMount = async () => {
    //If the database isn't open, open it to get access to photos
    if(!db.isOpen()){
      try{
        await db.open();

      }
      catch(e){
        this.toastSettings(`FAIL: DB couldn't open. ${e}`,'error');
      }
    }
    //Get photo files in background while modal menu is shown to user.
    this.getLocalPhotos();
  }

  //Get photos w/ uploadStatus: notUploaded
  getLocalPhotos = async () => {
    let localPhotosIDs = [];
    let localPhotos = [];
    try{
      //Get array of primary keys for notUploaded pictures in current job from db
      const localPhotosPointers = await db.table(this.props.currentJob).where('uploadStatus').equals('notUploaded').toArray();
      //console.log('localPhotosIDs: ',localPhotosIDs);
      for(let y = 0; y<localPhotosPointers.length; y++){
        localPhotosIDs.push(localPhotosPointers[y].photoId);
      }
      //Get array of photo files from db using primary key arrays
      localPhotos = await db.table(this.props.currentJob).where('photoId').anyOf(localPhotosIDs).toArray();
      //console.log('localPhotos: ',localPhotos);
    }
    catch(e){
      console.log(e);
      //Tell user images could not be retrieved from DB.  Re-direct back to category list
      this.toastSettings(`FAIL: Could not get images. ${e}`,'error');
      this.setState({ cancel: true });
    }
      //console.log('This is localPhotos: ', localPhotos, localPhotos.length);

      //If the photo array has photos in it, verify photos aren't 0kb (empty photo)
      if(localPhotos.length !== 0){
        let verifiedPhotos = [];
        //Push verified photos into verifiedPhotos array for upload.
        for(let x = 0; x<localPhotos.length; x++){
          const image = localPhotos[x].photo;
          if(image.size !== 0){
            verifiedPhotos.push(localPhotos[x]);
          }
          else{
            this.toastSettings(`${image.name} not verified, size: ${image.size}`, 'error');
          }
        }
        //console.log('localPhotos: ',localPhotos);
        //console.log('verifiedPhotos: ',verifiedPhotos);
        //this.uploadFiles(verifiedPhotos);
        //this.setState({ images: verifiedPhotos });
      }
      else{
        //If the photo array has no photos in it, notify user and re-direct to job list
        this.toastSettings(`No photos to Upload!`, 'warning');
        this.setState({ cancel: true });
      }

    //this.setState({ toPath: true });
  }

  //Verify imageFile exists, not a blank file w/ no size (Overkill, used to troubleshoot my poor implementation of db)
  /*
  verifyImage = async (image) => {
    console.log('entered verifyImage');
    if(image.size === 0){
      console.log(image);
      return false;
    }
    const imageURL = URL.createObjectURL(image);
    try{
      //see if you can fetch the image.  If you can, should be good
      await fetch(imageURL);
      return true;
    }
    catch(e){
      console.log(`GET Failed, ${imageURL}`,e);
      //notify user of issue, delete corrupt image from indexeddb
      console.log('exit');
      return false;

    }
  }
  */

  //Upload all files
  uploadFiles = async (localPhotos) => {

    //re-direct back to category list
    this.setState({ cancel: true });

    let successArray = [];
    let failArray = [];
    this.toastSettings(`Uploading Files...`, 'info');

    //for all local photos, try to upload each individually.  Add successes to successArray, failures to failArray
    for(let i = 0; i<localPhotos.length; i++){
      try{
        //Set spinner for category to show user that upload is in progress
        //Get category ID (ex. 12_102985943, get "12")
        const tempArray = localPhotos[i].photoId.split('_');
        const photoCategory = tempArray[0];
        this.props.updateCatUploadStatus(photoCategory, 'waiting', this.props.pictureReq );

        //Upload photo.  If 200 code, add to success array, otherwise, add to fail array
        const response = await uploadImage(localPhotos[i].photo);
        if(response.status === 200){
          //Get categoryID from photo, add it to successArray
          this.updateStatusTrue(localPhotos[i].photoId);
          successArray.push(photoCategory);
        }
        else{
          failArray.push(tempArray[0]);
        }

      }
      catch (e){
        console.log(e);
        const tempArray = localPhotos[i].photoId.split('_');
        failArray.push(tempArray[0]);
        //console.log('this is failArray: ',failArray);
      }
    }

    //console.log(`SuccessArray: ${successArray} \nFailArray: ${failArray}`);
    //if there were successful uploads, check if there are any notUploaded photos in category and adjust uploadStatus accordingly
    if(successArray.length !== 0){
      this.toastSettings(`Uploaded images!`, 'success');
      //Only unique Categories
      const uniqueSuccessCategories = [...new Set(successArray)];
      this.checkCategoryUploadStatus(uniqueSuccessCategories);
      //console.log(uniqueCategories);
    }
    if (failArray.length !== 0){
      this.toastSettings(`Some images failed`, 'error');
      const uniqueFailCategories = [...new Set(failArray)];
      this.checkCategoryUploadStatus(uniqueFailCategories);
    }
  }

  //For all unique categories, checks if there are any photos w/ uploadStatus: notUploaded
  //If all photos are uploaded for a category, change category upload status.  Else do nothing
  checkCategoryUploadStatus = async (categoriesArray) => {
    for(let i = 0; i<categoriesArray.length; i++){
      try{
        const localCatPhotosCount = await db.table(this.props.currentJob)
          .where('uploadStatus').equals('notUploaded')
          .and((result) => {
            const tempArray = result.photoId.split('_');
            return tempArray[0] === `${categoriesArray[i]}`;
          })
          .count();
          //console.log('This should be the not uploaded photos: ',localCatPhotosCount);
        if(localCatPhotosCount === 0){
          //Update status
          //console.log('success');
          this.props.updateCatUploadStatus(categoriesArray[i], 'success', this.props.pictureReq);
        }
        else{
          //console.log('fail');
          this.props.updateCatUploadStatus(categoriesArray[i], 'fail', this.props.pictureReq);
        }
      }
      catch (e){
        console.log(e);
      }
    }
  }

  //Set photo uploadStatus to 'uploaded'
  updateStatusTrue = async (imageId) => {
    //console.log('UpdateStatusTrue, state w/ imageId', this.state);
    await db.table(this.props.currentJob).update(imageId, { uploadStatus: 'uploaded' });
  }

  //Get category uploadStatus
  /*
  getStatus = (imageId) => {
    return this.props.categories[imageId].catUploadStatus;
  }
  */



  //Helper method:  simplify toast messages
  toastSettings = (message, status) => {
    this.props.toastManager.add(message, {
      appearance: status,
      autoDismiss: true,
    });
  }

  renderActions(){
    return(
      <React.Fragment>
        <button onClick={() => this.uploadFiles(this.state.images)} className="ui button positive">Upload</button>
        <Link to={`${this.props.currentJob}/categories`} className="ui button">
          Cancel
        </Link>
      </React.Fragment>
    );
  }

  render(){

    if (this.state.cancel){
      return <Redirect to={`${this.props.currentJob}/categories`}/>
    }

    return (
      <div>
        <Modal
          title='Upload local photos'
          content='Upload all photos that have not been uploaded yet?'
          path={`${this.props.currentJob}/categories`}
          actions={this.renderActions()}
          onDismiss={() => this.setState({ toPath: true })}
        />
      </div>
    );
  }

};

const mapStateToProps = (state) => {

  const currentJob = state.jobMeta.currentJob;
  const currentPictureReqs = state.sessions.entities.jobs[currentJob].pictureReqs;

  return{
    //categories: Object.values(state.categories),
    currentJob: currentJob,
    pictureReq: currentPictureReqs
  };
}

//Enable toast for this component
const toastManager = withToastManager(UploadAll);

export default connect(mapStateToProps, { updateCatUploadStatus })(toastManager);
