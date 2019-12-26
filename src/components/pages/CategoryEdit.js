/*
CategoryEdit - Individual Category look

Purpose:
User able to take photos and edit existing photos for this category.

Photo file title syntax "projectName_title_imgQty_user"

*/

import React from 'react';
import { connect } from 'react-redux';
import { getCategory, addPhoto, updatePhotoQty, updateCatUploadStatus } from '../../actions';
import { withToastManager } from 'react-toast-notifications';
import { osVersion, osName } from 'react-device-detect';

import db from '../../database/db';
import CameraComp from '../CameraComp';
import Footer from '../Footer';
import Modal from '../Modal';

import Camera, { FACING_MODES, IMAGE_TYPES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';

import uploadImage from '../../apis/uploadImage';

//import detectConnection from '../detectConnection';

//USED to be used for footer lol
/*
const links = [
  { path: `/categories`, id:'categoryList', label: 'Back' }
];
*/
/*
Color Hex Codes:

Red: DB2828
Yellow: FBBD08
Blue: 2185D0
Orange: F2711C
Green: 21BA45
*/

class CategoryEdit extends React.Component {

  //Apparently this is bad practice, but I can't think of an alt right now.  Variable checks for component life cycle state.  Used for preventing setState when unmounted
  _isMounted = false;
  testVar = false;

  state = {
    categoryId: this.props.match.params.id,
    image: {},
    showImage: '',
    imageTitle: '',
    imageId:'',
    imageQty: '',
    thumbnails: [],
    showModal: 'none',
    showPermissionsMsg: false,
    content: '',
    os: osVersion
  };

  //Fetch the category data from store
  //Get the photoQty and existing thumbnails
  //TODO:  If you delete the db, getThumbnails throws an error.  Check for that.
  componentDidMount = async () =>{
    //Set _isMounted var to true for potential unmount
    this._isMounted = true;

    //If the database isn't open, open it and get thumbnails
    if(!db.isOpen()){
      await db.open();
    }
    this.getThumbnails();
  }

  //if the component unmounts, cancel any setState calls
  //Update state w/ uploadStatus: unsent:fail, sentAll:success, default:neutral
  componentWillUnmount() {
    this._isMounted = false;
    this.countLocalPhotos();
  }

/*
Camera Methods
*/
  onCameraError(error) {
    console.log('This is the camera Error: ',error);
    this.setState({ showPermissionsMsg: true });
  }

//https://stackoverflow.com/questions/6850276/how-to-convert-dataurl-to-file-object-in-javascript
  //load src and convert to a File instance object
  //work for any type of src, not only image src.
  //return a promise that resolves with a File instance

  srcToFile = async (src) => {
    console.log('entered srcToFile');
    try{
      const res = await fetch(src);
      //console.log('this is res: ', res);
      return res.arrayBuffer();
    }
    catch (e){
      console.log(e);
    }
  }

/*
Edit Methods
*/

  /*
  Category status guide
  neutral: gray minus symbol
  success: green checkmark
  fail: red X
  waiting: spinning gray gear
  */
  //Counts the amount of not-Uploaded photos in this category.  Sets store value
  countLocalPhotos = async () => {
    //console.log('Entered countLocalPhotos');
    const photoQty = this.props.category.photoQty;

    //If there are no photos, do nothing
    if (photoQty !== 0){
      let status = 'neutral';
      try{
        //This query grabs all photos in this category whose uploadStatus is 'notUploaded' and returns the count
        const localCatPhotosCount = await db.table(this.props.currentJob)
          .where('uploadStatus').equals('notUploaded')
          .and((result) => {
            //console.log('result ',result);
            const tempArray = result.photoId.split('_');
            return tempArray[0] === `${this.state.categoryId}`;
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
        this.props.updateCatUploadStatus(this.state.categoryId, status, this.props.job.pictureReqs);
      }
      catch (e) {
        console.log('Query failed: ',e);

      }
    }
    //console.log('localCatPhotosCount', localCatPhotosCount);
  }

  //When user clicks on existing photo, open modal and display Filename, file details, and photo
  //TODO: modal options (re-take or delete)
  onClickThumbnail = async (image) => {
    //if(!image.uploadStatus){
    //console.log(image);
      const showImage = URL.createObjectURL(image.photo);
      await this.setState({
        showModal: '',
        image: image.photo,
        showImage: showImage,
        imageId: image.photoId,
        content: `photoId: ${image.photoId}
        lastModified: ${image.photo.lastModifiedDate}
        imageSize: ${image.photo.size}`
      });
  }

  //Upload individual file from thumbnails.  Relies on state.image/state.imageId
  uploadFile = async () => {
    const imageId = this.state.imageId;
    const image = this.state.image;
    await this.setState({
              showModal: 'none',
              image: {},
              showImage: '',
              imageId: ''
            })
    this.toastSettings(`Uploading File...`, 'info');
    //If image uploads w/ 200, notify user, change db status, refresh thumbnails.
    try{
      const response = await uploadImage(image);
      console.log('response[0]: ',response.status.toString()[0]);
      if(response.status.toString()[0] === '2'){
        this.toastSettings('SUCCESS: Uploaded Image!','success');
        this.updateStatusTrue(imageId);

        //Update uploadStatus on thumbnail.  Find the current thumbnail in array and change catUploadStatus
        let thumbnails = this.state.thumbnails;
        for(let x = 0; x<thumbnails.length; x++){
          if(thumbnails[x].photoId === imageId){
            thumbnails[x].uploadStatus = 'uploaded';
            console.log('Updated uploadStatus');
            break;
          }
        }

        this.setState({ thumbnails: thumbnails });
        /*
        this.setState({ thumbnails: thumbnails });
        if(this._isMounted){
          this.getThumbnails();
        }
        */
      }
      else{
        this.toastSettings('FAIL: Image upload fail.  You can click on the thumbnail to re-attempt upload','error');
      }

    }
    catch (e){
      console.log(e);
      this.toastSettings('FAIL: Image upload fail.  You can click on the thumbnail to re-attempt upload','error');
      //Upload failed, keep uploadStatus as 'False' and add image to offline image queue
    }
  }

  //Verify imageFile exists, not a blank file w/ no size.  Uses 'fetch' which is bad practice (superfluous network requests)
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

  //callback to Camera to get Added photo file.  Create photo file name, save to db, attempt upload
  //Embedded Camera: E, Native Camera: N
  onAddPhoto = async (imgData) => {
    //Check if imgData is string or object
    //console.log('this is typeof: ',typeof imgData);
    let fileData = imgData;
    let cameraChoice = 'N';

    //If using embedded Camera
    if(typeof imgData == "string"){
      fileData = await this.srcToFile(imgData);
      cameraChoice = 'E';
    }

    /*
    TODO: iOS Issue.  When image fails upload, some thumbnails become "blank".  If user goes out and comes back in, thumbnails show normally
    Race condition?
    1.  User takes pic
    2.  Sets state, awaits db save
    3.  Gets thumbnails
    4.  Attempt pic upload
    SUCCESS: Update upload status, get thumbnails
    FAIL: Do nothing
    */

    //Create Filename for upload. Timestamp of now used to create unique photoID. PROJNAME-profile_Category-qty_UserInitials
    //ex. SMITH-pcsv_7StructRaftA-Rafters-1_TC
    const job = this.props.job;
    const userName = this.props.userName;
    const timeStamp = Math.floor(Date.now() / 1000);
    const imageQty = this.state.imageQty + 1;

    //aV: App Version, os: iOS version, cA: Camera used (E: Embedded, N: Native)
    const imageTitle = `${job.projectName}-${job.profileName}_${this.props.category.title}-${imageQty}_${userName}{av${process.env.REACT_APP_VERSION}-${osName}_${this.state.os}-ca${cameraChoice}}`;
    const imageId = `${this.state.categoryId}_${timeStamp}`;
    //create file w/ imageTitle and .jpeg setting
    const renamedFile = new File([fileData], imageTitle+'.jpeg', {type: 'image/jpeg'} );

    //console.log('This is imageTitle: ',imageTitle,'This is renamedFile: ',renamedFile);

    //Set State.  These values are used when saving file to db.  Cause Race Condition?
    //await this.setState({ imageTitle: imageTitle, imageId: imageId });


    //Save file to db
    try{
      await this.saveToDb(renamedFile, imageTitle, imageId);
    }catch(error){
      //If saveToDb fails, notify user w/ error code.
      this.toastSettings(`FAIL: Image NOT Saved.  You may need to clear some storage space: ${error}`, 'error');
      return null;
    }

    this.getThumbnails();
    this.toastSettings(`Uploading File...`, 'info');
    //console.log(renamedFile);
    //If image is verified (image not corrupt) set for upload
    if(renamedFile.size !== 0){
      try{
        //Upload succeeded, set uploadStatus to 'True' in indexdb and queue file for deletion
        /*TODO: If uploads are being corrupted, wouldn't that mean that uploadImage here
          is the root cause?  Uploading renamedFile coming in as 0kb file.
        */
        const response = await uploadImage(renamedFile);
        console.log('This is response', response);
        if(response.status.toString()[0] === '2'){
          this.toastSettings('SUCCESS: Uploaded Image!','success');
          this.updateStatusTrue(imageId);

          //Update uploadStatus on thumbnail.  Find the current thumbnail in array and change catUploadStatus
          //Bad solution, subject to race conditions.  Shit.
          let thumbnails = this.state.thumbnails;
          for(let x = 0; x<thumbnails.length; x++){
            if(thumbnails[x].photoId === imageId){
              thumbnails[x].uploadStatus = 'uploaded';
              console.log('Updated uploadStatus');
              break;
            }
          }

          this.setState({ thumbnails: thumbnails });
          //This causes issues if component unmounts.  Illegal setState
          /*
          if(this._isMounted){
            this.getThumbnails();
          }
          */
        }
        else{
          this.toastSettings(`FAIL: Image NOT uploaded. Send to Dev: ${response.status}`,'error');
        }

      }
      catch (e){
        console.log(e);
        this.toastSettings(`FAIL: Image NOT uploaded.  Please check your internet connection and try again. ${e}`,'error');
        //Upload failed, keep uploadStatus as 'False' and add image to offline image queue
      }
    }
    else{
      this.toastSettings(`FAIL: Image corrupted, Please re-take the photo`,'error');
    }


  }

  //Saves image to db
  //job and picture req should always have the same suffix # ex. job0, pictureReq0.  job1, pictureReq1
  saveToDb = (img, imageTitle, imageId) => {
      //return db.table(this.props.currentJob).add({ photoId: `${this.state.imageId}`, fileName: this.state.imageTitle, uploadStatus: 'notUploaded', photo: img, job:this.props.currentJob, pictureReq: this.props.job.pictureReqs });
      return db.table(this.props.currentJob).add({ photoId: `${imageId}`, fileName: imageTitle, uploadStatus: 'notUploaded', photo: img, job:this.props.currentJob, pictureReq: this.props.job.pictureReqs });
    //TODO: do we need to refresh db?  Or is this just a chrome not updating thing 'data may be stale'
  }

  updateStatusTrue = (imageId) => {
      return db.table(this.props.currentJob).update(imageId, { uploadStatus: 'uploaded' });
  }

  //Access db and return count: number of photos in category
  //put thumbnails in state thumbnails and display
  getThumbnails = async () => {
    console.log('Enter getThumbnails');
    let thumbnails = [];
    let photoQty = 0;
    const categoryId = this.state.categoryId;
    try{
      thumbnails = await db.table(this.props.currentJob).where('photoId').startsWith(`${categoryId}_`).toArray();
      //console.log(thumbnails);
      photoQty = thumbnails.length;
      //console.log('no error');
    }
    catch (e){
      console.log('No Photos', e);
    }
    //Update store w/ photoQty value and rerender
    console.log('This is thumbnails: ',thumbnails);
    this.props.updatePhotoQty(categoryId, photoQty, this.props.job.pictureReqs);
    this.setState({ imageQty: photoQty, thumbnails: thumbnails });
    //console.log('end of getThumbnails');
  }

  //Helper method:  simplify toast messages
  toastSettings = (message, status) => {
    this.props.toastManager.add(message, {
      appearance: status,
      autoDismiss: true,
    });
  }



  //render options for Modal
  renderActions(){
    return(
      <React.Fragment>
        <button onClick={() => this.uploadFile()} className="ui button primary">Upload</button>
        <button onClick={() => this.setState({
          showModal: 'none',
          image: {},
          showImage: '',
          imageId: ''
        })} className="ui button">Cancel</button>
      </React.Fragment>
    );
  }


  //render list of photos
  renderList() {
    return this.state.thumbnails.map( image => {
      if(image){

        const imageURL = URL.createObjectURL(image.photo);
        //console.log(imageURL);
        //this.verifyImage(image.photo);
        //console.log('This is image:',imageURL);
        return(
          <div onClick={(e) => this.onClickThumbnail(image)} className="item" key={image.photoId}>
            <img className="ui small rounded centered image" src={imageURL} alt="" style={{ marginBottom: '5px' }}/>
              <div className="description" >{image.uploadStatus === 'uploaded' ? 'Uploaded!' : 'Not Uploaded'}</div>
          </div>
        );
      };
      return <div></div>;
    });
  }

  render(){
    return(
      <div>
        <Modal
          show={this.state.showModal}
          title={this.state.image.name}
          image={this.state.showImage}
          content={this.state.content}
          actions={this.renderActions()}
          onDismiss={() => this.setState({ showModal: 'none' })}
        />
        <h2>{this.props.category.title}</h2>
        <h3>{this.props.category.description}</h3>
        <h4 style={this.state.showPermissionsMsg ? {} : {display: 'none'}}>You must allow access to the Camera.  If you denied the permission, please go to your chrome settings and enable the Camera permission for this site</h4>
        <div>
          <CameraComp onSubmit = {this.onAddPhoto} />
          <Camera
            onTakePhoto = { (imgData) => { this.onAddPhoto(imgData); } }
            idealFacingMode = {FACING_MODES.ENVIRONMENT}
            imageType = {IMAGE_TYPES.JPG}
            isImageMirror = {false}
            isMaxResolution = {true}
            onCameraError = { (error) => { this.onCameraError(error); } }
          />
          <h3>Photos: {this.state.imageQty}</h3>
          <div className="ui huge horizontal selection celled list" style={{ marginBottom: '60px'}}>
            {this.renderList()}
          </div>
        </div>
        <Footer links={[
          { path: `/${this.props.currentJob}/categories`, id:'categoryList', label: 'Back' }
        ]} />
      </div>
    );
  }
}

//Put category data into category props
const mapStateToProps = (state, ownProps) => {

  const currentJobId = state.jobMeta.currentJob;
  const currentPictureReqs = state.sessions.entities.jobs[currentJobId].pictureReqs;
  //console.log(state.sessions.entities.pictureReqs[currentPictureReqs].categories);
  //console.log(ownProps.match.params.id);

  return{
    category: state.sessions.entities.pictureReqs[currentPictureReqs].categories[ownProps.match.params.id],
    job: state.sessions.entities.jobs[currentJobId],
    userName: state.userData,
    currentJob: currentJobId
  };
}

//Enable toast for this component
const toastManager = withToastManager(CategoryEdit);

export default connect(mapStateToProps, { getCategory, addPhoto, updatePhotoQty, updateCatUploadStatus })(toastManager);
