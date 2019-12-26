/*
SignIn - First menu.  User inputs their username

Purpose:
User can see and edit their current job sessions
Select a job in order to see categories
Select jobs to delete
User can see which jobs still have unsent photos

*/


import React from 'react';

import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { setUsername } from '../../actions';

import InputForm from '../InputForm';

const userValidation = value => (value && value.length > 3 ? `You must enter a User Name (Max 3 characters)` : undefined)

class SignIn extends React.Component{

  state = { toJobList: false, toSignIn: false };

  componentDidMount(){
    //if localStorage exists, redirect to /joblist
    try{
      if(!localStorage.getItem("state").includes(`"sessions":{}`) & !localStorage.getItem("state").includes(`"userData":{}`)){
        console.log('going to joblist');
        this.setState({ toJobList: true });
      }
    }
    catch(e){
      //If there's no local storage, best to start back from SignIn.  I think.
      console.log('localStorage check failed: ',e);

    }

    /*
    else if (!localStorage.getItem("state").includes(`signIn`)){
      //localStorage has old architecture, delete localStorage
      localStorage.clear();
    }
    */
  }

  onSubmit = (formValues) => {
    formValues.userName = formValues.userName.toUpperCase();
    //console.log('Clicked: ',formValues);
    this.props.setUsername(formValues.userName);
    this.setState({ toJobList: true });
  }

  render(){

    if(this.state.toJobList){
      return <Redirect to='/joblist' />
    }


    return(
      <div>
        <h1 style={{ textAlign: 'center' }}>SolarPix 2.0</h1>
        <h4 style={{ textAlign: 'center' }}>Please Sign In with your Initials</h4>
        <InputForm  initialValues={{ key: 'signIn' }} onSubmit={this.onSubmit} fields={
          [
            {
            name: 'userName',
            label: 'User Initials',
            component: 'input',
            key: 'field1',
            validate: userValidation
            }
          ]
        }
        />
      </div>
    );
  }

}

export default connect(null, { setUsername })(SignIn);
