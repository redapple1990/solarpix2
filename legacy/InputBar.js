import React from 'react';

class InputBar extends React.Component{

  //Prevents app from 'refreshing' when user submits form
  onFormSubmit(event){
    event.preventDefault();
  }

  //On user input, sends input to parent component
  //Returns user input value and InputBar label for conditional logic
  onFormChange = (event) => {
    this.props.onChange(event.target.value, this.props.labelName);
  }

  render(){
    return(
      <div>
        <form className="ui form" onSubmit={this.onFormSubmit}>
          <div className="field">
            <label>{this.props.labelName}</label>
            <input type="text" onChange={this.onFormChange}/>
          </div>
        </form>
      </div>
    );
  }
}

export default InputBar;
