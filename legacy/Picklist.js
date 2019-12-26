import React from 'react';

const Picklist = (props) => {

  //Take in itemList from parent components
  //Map itemList to create dropdown list
  const items = props.items.map(item => {
    return <option>{item}</option>
  });

  //When different option is selected, send selection to parent component
  const onSelectChange = (event) => {
    props.onChange(event.target.value, props.label);
  }

    return(
      <select className="ui dropdown" onChange={onSelectChange}>
        {items}
      </select>
    );
}


export default Picklist;
