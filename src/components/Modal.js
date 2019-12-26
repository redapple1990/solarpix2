import React from 'react';
import ReactDOM from 'react-dom';

class Modal extends React.Component{

  render(){
    return ReactDOM.createPortal(
      <div className="ui dimmer modals visible active" style={{display: this.props.show}}>
        <div onClick={(e) => e.stopPropagation()} className="ui standard modal visible active">
          <div className="header">{this.props.title}</div>
          <div className="content">{this.props.content}</div>
          <img className="ui medium rounded centered image" alt="" src={this.props.image} style={{ marginBottom: '10px'}}/>
          <div className="actions">{this.props.actions}</div>
        </div>
      </div>,
      document.querySelector('#modal')
    )
  }
}

export default Modal;
