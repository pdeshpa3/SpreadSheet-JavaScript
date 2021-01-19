//-*- mode: rjsx-mode;

import React from 'react';
import ReactDom from 'react-dom';

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
    this.state= {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleChange(event){
  this.setState({value: event.target.value});
  }
  
  //@TODO
  handleSubmit(event){
  alert(' this was submitted' + this.state.value);
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
    );
    
  }
}
ReactDOM.render(SingleInput, document.getElementById('app'));

