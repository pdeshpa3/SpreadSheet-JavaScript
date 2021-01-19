//-*- mode: rjsx-mode;

import React from 'react';
import ReactDom from 'react-dom';
import SSClient from '../lib/ss-client.mjs';

/** Component which displays a single input widget having the following
 *  props:
 *
 *    `id`:     The id associated with the <input> element.
 *    `value`:  An initial value for the widget (defaults to '').
 *    `label`:  The label displayed for the widget.
 *    `update`: A handler called with the `value` of the <input>
 *              widget whenever it is blurred or its containing
 *              form submitted.
 */
export default class SingleInput extends React.Component {

  constructor(props) {
    super(props);
    //@TODO
    this.state= {value: '', formula:{}};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleChange(event){
  this.setState({value: event.target.value});
  }
  
  //@TODO
  handleSubmit(event){
  const BASE = '/api/store/';
  const ssClient = new SSClient(BASE);
  const url = BASE+this.state.value; //url to spreadhseet
  let res;
  //gettign client data
  const data = ssClient.readFormulas(url)
  data.then(res => res.json()).then(function(data){
   this.state.formula = data;
  });
  
  alert(' this was submitted ' + this.state.value);
  event.preventDefault();
  }

  render() {
    //@TODO
    return(
    	<form onSubmit={this.handleSubmit}>
    	<label>
    	Name:
    	<input type="text" value={this.state.value} onChange={this.handleChange} />
    	</label>
    	<input type="submit" value="Submit"/>
    	</form>
    	<Spreadsheet formula = {this.state.formula} />
        
  	
    );
    
  }
}
ReactDOM.render(SingleInput, document.getElementById('app'));

