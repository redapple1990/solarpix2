/*
CreateJob - First menu that shows to user.

Purpose:
User inputs User Name, Project Name, and Profile.
When user clicks 'submit', all three variables are saved onto the store.  User is presented with CategoryList

*/

//import necessary packages
import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { addNewJob, createJobList, setCurrentJob, setJobCounter } from '../../actions';

//Import local components
import InputForm from '../InputForm';
//import database from '../../database/db';

const userValidation = value => (!value ? 'You must enter a Project Name' : undefined)

class CreateJob extends React.Component{

  state = {
    toCategories: false,
    toDelete: false,
    toSignin: false,
    jobId: ''
  }

  //TODO:  If there is localStorage, ask user if they want to start a new job or return to their previous one
  //If new job, clear localStorage
  //If old job, re-direct to /categories page
  componentDidMount(){
    //If userData is empty, redirect to Signin page
    if(localStorage.getItem("state").includes(`"userData":{}`)){
      console.log('entered redirect');
      this.setState({ toSignin: true });
    }
    //console.log(this.props.jobs);
    /*
    try{
      if(!localStorage.getItem("state").includes(`"categories":{}`) || db.isOpen()){
        this.setState({ toDelete: true });
      }
    } catch (err) {
      //catch error.  If state is null, create new categories list
      console.log(err);
    }
    */
  }

  /*
  createNewDb = async (jobId) => {
    try{
      if(!db.isOpen()){
        await db.open();
      }
      db.close();
      console.log('dbVerNo: ',db.verno, ' dbVerNo+1: ',db.verno+1);
      await db.version(db.verno+1).stores({
          [jobId]: `photoId, uploadStatus`
      });
      db.open();

    }
    catch(e){
      console.log('db creation failed', e);
    }
  }
  */

  /*
  createDb = (jobId) => {
    const dataBase = new Dexie('empowerDb');

    this.props.createDatabase(dataBase);

    const db = this.props.db;
    db.version(db.verno+1).stores({
      [jobId]: `photoId, uploadStatus`
    })
    db.open();
  }

  createDbTable = (jobId) => {
    const db = this.props.db;
    if(db.isOpen()){
      db.close();
    }
    db.version(db.verno+1).stores({
      [jobId]: `photoId, uploadStatus`
    })
    db.open();
  }
  */
  getOpenJobId = () => {
    const currentJobs = this.props.jobs;
    if(Object.keys(this.props.jobs).length >= 10){
      return null;
    }
    else{
      //Find an available jobId slot (starting from 0, asc);
      for(var i=0; i<10; i++){
        if(!_.findKey(currentJobs, { id: `job${i}` })){
            //console.log(`should be the first non-existing jobId`);
            return i;
        }
      }
    }

  }

  //Callback function to InputForm
  //On form Submit, save formValues to store and navigate user to categories list (Set userName to capitals)
  onSubmit = async (formValues) => {
    const projName = formValues.projectName.toUpperCase();
    //If there are no current jobs, create jobList w/ normalized data
    if(localStorage.getItem("state").includes(`"sessions":{}`)){
      await this.props.createJobList(projName, formValues.profileName, 0);
      await this.props.setCurrentJob(`job0`);
    }
    //Otherwise, create a new job and merge data w/ store
    else{
      const jobIdNum = this.getOpenJobId();
      //console.log(jobIdNum);
      if(Number.isInteger(jobIdNum)){
        await this.props.addNewJob(projName, formValues.profileName, jobIdNum);
        await this.props.setCurrentJob(`job${jobIdNum}`);
      }
      else{
        //prevent user from creating another job
        console.log('There are already 10 jobs');
      }
    }
    //this.props.setJobCounter(1);
    //this.createNewDb(this.props.currentJob);


    //set state to true for navigation
    this.setState({ toCategories: true, jobId: this.props.currentJob });
  }

  //Render page layout
  //IF YOU WANT TO CHANGE THE DEFAULT VALUE FOR DROPDOWN, CHANGE initialValues Prop!!!
  render(){
    if(this.state.toCategories){
      return <Redirect to={`/${this.state.jobId}/categories`} />
    }
    else if(this.state.toDelete){
      return <Redirect to='/delete' />
    }
    else if(this.state.toSignin){
      return <Redirect to='/' />
    }

    return(
      <div>
        <h1>New Job</h1>
        <InputForm onSubmit={this.onSubmit} initialValues={{profileName: 'install' }}
        fields={
          [
            {
            name: 'projectName',
            label: 'Project Name (try to use one word, all use same)',
            component: 'input',
            key: 'field1',
            validate: userValidation
            },
            {
            name: 'profileName',
            label: 'Profile',
            component: 'dropdown',
            key: 'field2'
            }
          ]
        }
        //TODO: pass down field information
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {

  try{
    return{
      currentJob: state.jobMeta.currentJob,
      counter: state.jobMeta.jobCounter,
      jobs: _.pickBy(state.sessions.entities.jobs, undefined),
    }
  }
  catch (e){
    console.log('jobs dont exist yet');
    return{
      currentJob: state.jobMeta.currentJob,
      counter: state.jobMeta.jobCounter,
    }
  }

}

export default connect(mapStateToProps, { addNewJob, createJobList, setCurrentJob, setJobCounter })(CreateJob);
