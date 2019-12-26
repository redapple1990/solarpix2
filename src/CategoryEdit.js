/*
CategoryEdit - Individual Category look

Purpose:
User able to take photos and edit existing photos for this category.

*/

/*
// TODO:
DONE: Get category information from store
Create a "photo" object array that contains all the photos for each category based on id and get it into component from store
render all existing photos as thumbnails (as they exist)
render a 'New Photo' button that calls the mobile camera
Separate rows of photos for User-Friendliness
*/

import React from 'react';
import { connect } from 'react-redux';
import { getCategory, addPhoto, toUploadQueue, uploadImage, updatePhotoQty } from '../../actions';

import { saveImage } from '../saveImage';
import db from '../../database/db';
import Camera from '../Camera';
import Footer from '../Footer';

//Used for footer
const links = [
  { path: '/categories', id:'categoryList', label: 'Back' }
];
//import categoryListFile from '../../categoryListFile';

class CategoryEdit extends React.Component {

  state = { imageTitle: "", imageId:"", imageQty: '', thumbnails: [] };

  //Fetch the category data from store
  //Get the photoQty and existing thumbnails
  componentDidMount(){
    this.props.getCategory(this.props.match.params.id);
    this.getThumbnails();
  }

  //When user clicks on existing photo, open modal
  //modal options (re-take or delete)
  onClick = (id) => {
    console.log(`user clicked existing image: ${id}`);
  }

  //callback to Camera to get Added photo file
  onAddPhoto = (img) => {
    //increment photoQty in local state
    const imageQty = this.state.imageQty + 1;
    //title syntax: "title_imgQty"
    const imageTitle = `${this.props.category.title}_${imageQty}`;
    //console.log('this is imageQty',imageQty);
    //Set current imageId to lastmodified date
    this.setState({ imageTitle: imageTitle, imageQty: imageQty, imageId: img.lastModified });
    //convert image file to dataURL for storage
    saveImage(URL.createObjectURL(img), this.getPhotoUrl);

  }

  //callback to saveImage that gets photo url
  //Adds data to photoQueue.  Save image data to uploadQueue.  Re-render
  getPhotoUrl = (photoUrl) => {
    //Update photoqueue with id, title, upload status
    var photoQueue = this.props.category.photoQueue;
    photoQueue.push({ id: this.state.imageId, imageTitle: this.state.imageTitle, uploadStatus: 'notUploaded' });
    //Update store w/ id, imageQty, photoQueue
    this.props.addPhoto(this.props.match.params.id, this.state.imageQty, photoQueue);

    //TODO: Save actual image data into db, uploadStatus: false

    //this.props.toUploadQueue(this.state.imageId, photoUrl);
    //Get the thumbnails to display
    //this.getThumbnails();

    //Testing:  Upload image to server
    //this.props.uploadImage(photoUrl);

    //re-render
    this.setState({ imageId: "", imageTitle: "" });
  }

  //Database helper methods
  //Is there a way to create an async function that can use props?

  //Saves image to db
  saveToDb = async (photoURL) => {
    //const response = await db.table(this.props.currentJob).add()
  }

  //Access db and return count: number of photos in category
  //put thumbnails in state thumbnails and display
  getThumbnails = async () => {
    const categoryId = this.props.match.params.id;
    const photoQty = await db.table(this.props.currentJob).where('photoId').startsWith(categoryId).count();
    //TODO: figure out how to catch await errors
    if (photoQty > 0){
      //getThumbnails
      console.log('There are pictures in db, getting thumbnails');
      const collection = await db.table(this.props.currentJob).where('photoId').startsWith(categoryId);
      console.log('this is a collection: ',collection);
      const response = await collection.toArray();
      console.log('This is the response');

    }
    this.setState({ imageQty: photoQty });
  }


  /*
  //Gets thumbnail from store using imageId
  getThumbnails = () => {
    const finalArray = [];
    const photoQueue = this.props.category.photoQueue;
    const uploadQueue = this.props.uploadQueue;

    //For each element id in photoQueue, compare with element id's in uploadQueue
    //If the id's match, push an object w/ id and dataURL to thumbnail array
    photoQueue.forEach((e1) => uploadQueue.forEach((e2) => {
        if(e1.id === e2.id){
          finalArray.push({ id: e2.id, dataURL: e2.dataURL })
        }
      }
    ));
    //console.log(finalArray);
    this.setState({ thumbnails: finalArray });
  }
  */

  //render list of photos
  //Id doesn't update for repeat file upload.
  renderList() {
    return this.state.thumbnails.map( image => {
      if(image){
        return(
          <div className="item" key={image.id}>
            <img onClick={this.onClick} className="ui small rounded centered image" src={image.dataURL} alt=""/>
            <div className="content">
              <div className="description"></div>
            </div>
          </div>
        );
      };
      return <div></div>;
    });
  }

  render(){
    return(
      <div>
        <h2>{this.props.category.title}</h2>
        <h3>{this.props.category.description}</h3>
        <Camera onSubmit={this.onAddPhoto}/>
        <h3>Photos: {this.state.imageQty}</h3>
        <div className="ui huge horizontal selection celled list">
          {this.renderList()}
        </div>
        <Footer links={links} />
      </div>
    );
  }
}

//Put category data into category props
const mapStateToProps = (state, ownProps) => {
  return{
    category: (Object.values(state.categories))[ownProps.match.params.id],
    uploadQueue: (Object.values(state.uploadQueue))
    //dummyValues: Object.values(state.dummyValues)
  };
}



export default connect(mapStateToProps, { getCategory, addPhoto, toUploadQueue, uploadImage, updatePhotoQty })(CategoryEdit);


  /*
  //If a user uploads an image, displays preview of image
  renderAddPhotoImage() {
    if(this.state.image){
      return(
        <img className="ui large rounded centered image" src={this.state.image} />
      );
    }
  }
  */

  //TODO: Get individual clicks for these elements to open up existing image
  //renders the list of existing images
  /*
  renderListTemp() {
    return this.props.dummyValues.map( photo => {
      return(
        <div onClick={this.onClick(photo.id)} className="item" key={photo.id}>
          <i className="large right aligned icon file image" />
          <div className="content">
            {photo.title}
            <div className="description">{photo.description}</div>
          </div>
        </div>
      );
    });
  }
  */
