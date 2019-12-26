/*
InputForm - Re-usable menu/form

Purpose:
Provides a form template to be used in the app.
2 input bars
1 dropdown
1 Button

*/

//import necessary packages
import React from 'react';
import {Field, reduxForm } from 'redux-form';

class InputForm extends React.Component{

  componentDidMount(){

  }

  //Helper method: renderError
  //Handles when to display an error message
  renderError({ error, touched }){
    if (touched && error){
      return(
        <div className="ui error message">
          <div className="header">{error}</div>
        </div>
      );
    }
  }

  //Helper method: renderInput
  //renders an input InputBar.  Depending on error message criteria, show error style
  renderInput = ({label, input, meta}) => {
    const className = `field ${meta.error && meta.touched ? 'error' : ''}`;
    return (
      <div className={className}>
        <label>{label}</label>
        <input {...input} autoComplete="off"/>
        {this.renderError(meta)}
      </div>
    );
  }

  //TODO: This is a poor implementation for re-usability, make dropdown dynamic/props from parent
  //IF YOU WANT TO CHANGE THE DEFAULT VALUE FOR DROPDOWN, CHANGE IN CreateJob.js!!!
  //renders a dropdown menu
  renderDropdown = ({label, input, meta}, props) => {
    const className = `field ${meta.error && meta.touched ? 'error' : ''}`;
    return(
      <div className={className} >
        <label>{label}</label>
        <select {...input}>
          <option value="install">Install</option>
          <option value="pcsv">PCSV</option>
          <option value="salessv">Sales SV</option>
        </select>
        {this.renderError(meta)}
      </div>
    );
  }

  //Run onClick when user clicks on button
  onSubmit = (formValues) => {
    //console.log('Input form onSubmit: ',formValues);
    this.props.onSubmit(formValues);

  }



  //render dynamic field list
  renderList(){
    return this.props.fields.map( field => {
      return(
        <Field name={field.name} label={field.label} key={field.key} component=
        {{
          input: this.renderInput,
          dropdown: this.renderDropdown
        }[field.component]}
        validate={field.validate}
        />
      );
    });
  }

  //Render page layout
  render(){
    //console.log('this is props: ',this.props);
    return(
      <form className="ui form error" onSubmit={this.props.handleSubmit(this.onSubmit)}>
        {this.renderList()}
        <br/>
        <button className="fluid ui button primary">Submit</button>
      </form>
    );
  }
  /*
  render(){
    console.log('this is props: ',this.props);
    return(
      <form className="ui form error" onSubmit={this.props.handleSubmit(this.onSubmit)}>
        {this.renderList()}
        <Field name="userName" label="User Initials" component={this.renderInput}/>
        <Field name="projectName" label="Project Name (try to use one word, all use same)" component={this.renderInput}/>
        <Field name="profileName" label="Profile" component={this.renderDropdown}/>
        <br/>
        <button className="ui button primary">Submit</button>
      </form>
    );
  }
  */
}


//Helper method: validate
//Used for validation
/*
User Name or Project Name cannot be blank

*/

/*
const validate = (formValues) => {
  const errors = {};

  //console.log(formValues.profileName);

  if (!formValues.userName || formValues.userName.length > 3){
    errors.userName = 'You must enter a User Name (Max 3 characters)';
  }
  if (!formValues.projectName){
    errors.projectName = 'You must enter a Project Name';
  }
  if (!formValues.profileName){
    errors.profileName = 'You must select a Profile';
  }

  return errors;

}
*/
//Wire up ReduxForm
export default reduxForm({
  form: 'inputForm'
})(InputForm);
