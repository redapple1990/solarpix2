import React from 'react';
import { Link } from 'react-router-dom';

class Footer extends React.Component{


  //Renders list of links to be displayed in footer
  renderList(props) {
    //determine width of each button based on number of buttons
    const width = `${100/this.props.links.length}%`;

    return this.props.links.map( link => {
      return(
        <Link to={link.path} className="item" key={link.id} style={{ width: width }}>
          {link.label}
        </Link>
      );
    });
  }

  render(){
    const classname = `ui bottom fixed ${this.props.links.length} item huge menu`
    return(
      <div className={classname}>
        {this.renderList()}
      </div>
    )
  }
}

export default Footer;
