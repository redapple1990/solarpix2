/*
JobList - Menu that shows current saved job sessions

Purpose:
User can see and edit their current job sessions
Select a job in order to see categories
Select jobs to delete
User can see which jobs still have unsent photos

*/


import React from 'react';
import _ from 'lodash';

import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
//import { osVersion } from 'react-device-detect';

import { setCurrentJob, updateJobColor } from '../../actions';
import db from '../../database/db';
import { withToastManager } from 'react-toast-notifications';



class JobList extends React.Component{

  state = {
    toCategories: false,
    toDelete: false,
    toSignin: false,
    jobId: ''

  };

  componentDidMount(){
    //If userData is empty, redirect to Signin page
    try{
      if(localStorage.getItem("state").includes(`"userData":{}`)){
        console.log('entered redirect');
        this.setState({ toSignin: true });
      }
    }
    catch (e){
      console.log("get State error: ",e)
      //re-direct to SignIn
      this.setState({ toSignin: true });
    }


    //console.log('this is osVersion: ',osVersion);
    if(!db.isOpen()){
      db.open();
    }
    try{
      for(let i=0; i<this.props.sessionData.length; i++){
        this.checkForPhotoCompletion(this.props.sessionData[i].id);
      }
    }
    catch (e){
      console.log(e);
    }
  }

  checkForPhotoCompletion = async (jobId) => {
    //loop through all existinh job tables and check for any 'norUploaded' photos
    try{
      const uploadedPhotosCount = await db.table(jobId)
        .where('uploadStatus').equals('notUploaded').count();
      const jobPhotosCount = await db.table(jobId).count();
        //console.log('This should be the not uploaded photos: ',localCatPhotosCount);
      if(uploadedPhotosCount === 0 & jobPhotosCount !== 0){
        //all uploaded, go green
        console.log('Green', jobId);
        this.props.updateJobColor(jobId,`rgba(75, 225, 75, 0.2)`);
      }
      else if(uploadedPhotosCount !== 0){
        //some remaining, go red
        this.props.updateJobColor(jobId,`rgba(225, 75, 75, 0.2)`);
      }
    }
    catch (e){
      console.log(e);
    }
  }

  onJobClick = async (jobId) => {
    //console.log('This is job Id: ',jobId);
    await this.props.setCurrentJob(jobId);
    await this.setState({ toCategories: true, jobId: jobId });
    //console.log('jobId: ',this.state.jobId);
  }

  onDeleteClick = async (jobId) => {
    await this.props.setCurrentJob(jobId);
    this.setState({ toDelete: true, jobId: jobId });
  }

  renderList(){
    if(this.props.sessionData){
      //console.log('joblist session data: ',this.props.sessionData);
      return this.props.sessionData.map( job => {
        return(
          <div className='item' key={job.id} style={{
            backgroundColor: `${job.color}` }}>
            <div className="right floated middle aligned content">
              <button className="ui negative button" onClick={() => {this.onDeleteClick(job.id)}}>Delete</button>
            </div>
            <div onClick={() => {this.onJobClick(job.id)}}>
              {job.projectName}
            </div>
          </div>
        );
      });
    }
  }

  render(){

    if(this.state.toCategories){
      return <Redirect to={`/${this.state.jobId}/categories`} />
    }
    else if(this.state.toDelete){
      return <Redirect to={'/delete'} />
    }
    else if(this.state.toSignin){
      return <Redirect to='/' />
    }

    try{
      return(
        <div>
          <h1>Job List</h1>
          <div className='ui massive celled list'>
            <div className="item" key='warning' style={{ visibility: this.props.sessionData.length === 10 ? 'visible' : 'hidden' }}>
              Limit 10 jobs.  Delete jobs to make space.
            </div>
            <Link to='/newjob' className="item" key='newJob' style={{ visibility: this.props.sessionData.length === 10 ? 'hidden' : 'visible' }}>
              <i className='large plus square outline icon'></i>
              <div className='content'>
                New Job
              </div>
            </Link>
            {this.renderList()}
          </div>
        </div>
      );
    }
    catch (e){
      return(
        <div>
          <h1>Job List</h1>
          <div className='ui massive celled list'>
            <Link to='/newjob' className="item" key='newJob'>
              <i className='large plus square outline icon'></i>
              <div className='content'>
                New Job
              </div>
            </Link>
            {this.renderList()}
          </div>
        </div>
      );
    }

  }

}

const mapStateToProps = (state) => {

  //Check if there are existing jobs.  If not, let joblist be blank
  //_.compact removed undefined values from jobs
  try{
    return{
      userName: state.userData,
      sessionData: _.compact(Object.values(state.sessions.entities.jobs))
    };
  }
  catch (e){
    //console.log(e);
    return{
      userName: state.userData,
    };
  }
}

//Enable toast for this component
const toastManager = withToastManager(JobList);

export default connect(mapStateToProps, { setCurrentJob, updateJobColor })(toastManager);
