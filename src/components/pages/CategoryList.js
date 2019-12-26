/*
CategoryList - Main working menu that shows categories

Purpose:
User clicks category in order to open their mobile camera.
User can choose to upload(?) photos

*/

import React from 'react';

//import categoryListFile_install from '../../categoryListFile_install';
//import categoryListFile_pcsv from '../../categoryListFile_pcsv';


import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { readTextFile, saveLocation } from '../../actions';

//import db from '../../database/db';
import Footer from '../Footer';
//import offline from 'offline-js';

//Used for filling in footer
const links = [
  { path: '/joblist', id: 'jobList', label: 'Back' },
  { path: '/upload', id: 'uploadAll', label: 'Upload All' }
]

//Used for deciding which icon to show for category Upload status
//const catUploadStatuses =


class CategoryList extends React.Component{

  state = {
    toSignin: false
  }
  //If there is no localStorage, read text file and create categories.  Categories dependent on profileName
  //Then save to localStorage
  //Otherwise, load categories from localStorage
  componentDidMount(){
    //If userData is empty, redirect to Signin page
    if(localStorage.getItem("state").includes(`"userData":{}`)){
      this.setState({toSignin: true});
    }
    //console.log(this.props.sessions);
    //If there is a saved page location, send user back to that position
    if(this.props.pageLocation){
      window.scrollTo(0, this.props.pageLocation);
    }
  }

  componentWillUnmount(){
    //save page position
    //console.log('Y offset ', window.pageYOffset);
    this.props.saveLocation(window.pageYOffset);
  }


  //Renders list of categories and sets each to be a link to individual category page
  //change icons based on catUploadStatus
  renderList() {
    return this.props.categories.map( category => {
      return(
        <Link to={`categories/${category.id}`} className="item" key={category.id} style={{ backgroundColor:
          `rgba(${category.cellColor[0]},${category.cellColor[1]},${category.cellColor[2]},${category.cellColor[3]})` }}>
            <div className="right floated middle aligned content">
              <div className="description">
                Pics
                <div style={{ textAlign: 'center' }}>
                  {category.photoQty}
                </div>
              </div>
            </div>
          {{
            success: <i className='large middle aligned inverted green check icon'></i>,
            fail: <i className='large middle aligned inverted red x icon'></i>,
            neutral: <i className='large middle aligned inverted gray minus icon'></i>,
            waiting: <i className='large middle aligned cog loading icon'></i>
          }[category.catUploadStatus]}
          <div className="content" >
            <div className="header">{category.title}</div>
              <div className="description">
                {category.description}
              </div>
          </div>
        </Link>
      );
    });
  }

  //Render component calling renderList
  render(){
    if(this.state.toSignin){
      return(
        <Redirect to='/' />
      );
    }

    return(
        <div>
          <h2>Category List: {this.props.job.projectName}</h2>
          <div className="ui celled list" >{this.renderList()}</div>
          <div className="padding" style={{ display: 'block', height: '48px' }}></div>
          <Footer links={links}/>
        </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {

  const currentJobId = state.jobMeta.currentJob;
  const currentPictureReqs = state.sessions.entities.jobs[currentJobId].pictureReqs;

  return{
    //categories: Object.values(state.categories),
    userName: state.userData,
    job: state.sessions.entities.jobs[currentJobId],
    categories: Object.values(state.sessions.entities.pictureReqs[currentPictureReqs].categories),
    pageLocation: state.pageLocation.yValue,

  };
}

export default connect(mapStateToProps, { readTextFile, saveLocation })(CategoryList);
