import React from 'react';
import Modal from '../Modal';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { deleteJob, setJobCounter, setCurrentJob } from '../../actions';
import db from '../../database/db';

class DeleteJob extends React.Component {

  state = { cancel: false, toPath: false }

  //Remove localStorage and indexDB data, redirect to createJob page
  resetData = async () => {
    const jobId = this.props.currentJobId;
    const pictureReq = this.props.currentPictureReq;
    //console.log(jobId, pictureReq);
    try{
      db.table(jobId).clear();
      this.props.setCurrentJob('');
      await this.props.deleteJob(jobId, pictureReq);
    }
    catch (e){
      console.log('Table did not clear',e);
    }

    this.setState({ toPath: true });
  }

  renderActions(){
    return(
      <React.Fragment>
        <button onClick={async () => await this.resetData()} className="ui button negative">Delete Job</button>
        <Link to="/joblist" className="ui button">
          Cancel
        </Link>
      </React.Fragment>
    );
    /*
    return(
      <React.Fragment>
        <button onClick={() => this.resetData()} className="ui button negative">Delete Job</button>
        <Link to="/joblist" className="ui button">
          Cancel
        </Link>
      </React.Fragment>
    );
    */
  }

  render(){
    //console.log(this.state);
    if (this.state.cancel){
      return <Redirect to="/joblist"/>
    }
    else if (this.state.toPath){
      return <Redirect to="/joblist"/>
    }

    return (
      <div>
        <Modal
          title={`Delete Job: ${this.props.currentJob.projectName}`}
          content='Please ensure all photos are uploaded for this job.  You will lose all the photos for this job.'
          path='/joblist'
          actions={this.renderActions()}
          onDismiss={() => this.setState({ toPath: true })}
        />
      </div>
    );
  }

};

const mapStateToProps = (state) => {

  try{
    if(state.jobMeta.currentJob){
      const currentJobId = state.jobMeta.currentJob;
      const currentJobCounter = state.jobMeta.jobCounter;
      const currentJob = state.sessions.entities.jobs[currentJobId];
      const currentPictureReq = state.sessions.entities.jobs[currentJobId].pictureReqs;

      return{
        currentJobId: currentJobId,
        currentJobCounter: currentJobCounter,
        currentJob: currentJob,
        currentPictureReq: currentPictureReq
      }
    }
    else{
      return{
        currentJobId: '',
        currentJobCounter: '',
        currentJob: '',
        currentPictureReq: ''
      }
    }
  }
  catch (e){
    console.log(e);
    //Should only be re-direct requests after a delete
  }

}

export default connect(mapStateToProps, { deleteJob, setJobCounter, setCurrentJob })(DeleteJob);
