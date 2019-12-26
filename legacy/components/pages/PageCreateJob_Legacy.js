/*
PageNewJob - First menu that shows to user.

Purpose:
User inputs User Name, Project Name, and Profile.
When user clicks 'submit', all three variables are saved onto the store.  User is presented with PagePhotoList

*/

import React from 'react';
//Import action Creators
import { connect } from 'react-redux';
import { createNewJob } from '../actions';
//Import local components
/*
import InputBar from './InputBar';
import Button from './Button';
import Picklist from './Picklist';
*/

class PageCreateJob extends React.Component{

  //State contains three variables.  Simple enough to not warrant Connect
  state = {
    userName: null,
    projectName: null,
    profile: 'Solar'
  }

  items=['Solar', 'Site-Audit'];

  //Callback function.  passed into InputBar to receive user input
  //Sets state based on inputBar label
  onInputChange = (term, label) => {
    //console.log(`This is in Parent Component: ${term}, ${label}`);
    switch(label){
      case 'User Name':
        this.setState({userName: term});
        break;
      case 'Project Name':
        this.setState({projectName: term});
        break;
      case 'profileList':
        this.setState({profile: term});
        console.log(this.state.profile);
        break;
      default:
        break;
    }
  }

  //Render page layout
  render(){
    return(
      <div className="ui segment" style={{ marginTop: '10px'}}>
        <h1>Solar Pix v2.0</h1>
        <InputBar labelName="User Name" onChange={this.onInputChange}/>
        <InputBar labelName="Project Name" onChange={this.onInputChange}/>
        <br/>
        <div>
          <Picklist label="profileList" items={this.items} onChange={this.onInputChange}/>
          <Button labelName="Submit" onClick={this.props.createNewJob(this.state.userName, this.state.projectName, this.state.profile)}/>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userName: state.userName,
    projectName: state.projectName,
    profile: state.profile
  }
}

//export default connect(mapStateToProps, { createNewJob })(PageNewJob);
