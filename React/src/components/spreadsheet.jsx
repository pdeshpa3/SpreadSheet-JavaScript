//-*- mode: rjsx-mode;

import {indexToRowSpec, indexToColSpec} from 'cs544-ss';
import popupMenu from '../lib/menu.jsx';
import SingleInput from './single-input.jsx';

import React from 'react';
import ReactDom from 'react-dom';

import ReactDataGrid from 'react-data-grid';


/************************ Spreadsheet Component ************************/

const [ N_ROWS, N_COLS ] = [ 10, 10 ];
const ROW_HDRS = Array.from({length: N_ROWS}).map((_, i) => indexToRowSpec(i));
const COL_HDRS = Array.from({length: N_COLS}).
  map((_, i) => indexToColSpec(i).toUpperCase());


const rows = [ {key:"idtest", name:"test"}, {key:"idA", name:"A", editable:function(rowData){return rowData.allowEdit=true;} },  {key:"idB", name:"B", editable:function(rowData){return rowData.allowEdit=true;}},  {key:"idC", name:"C", editable:function(rowData){return rowData.allowEdit=true;}},  {key:"idD", name:"D", editable:function(rowData){return rowData.allowEdit=true;}},  {key:"idE", name:"E", editable:function(rowData){return rowData.allowEdit=true;}},  {key:"idF", name:"F", editable:function(rowData){return rowData.allowEdit=true;}},
 {key:"idG", name:"G", editable:function(rowData){return rowData.allowEdit=true;}},  {key:"idH", name:"H", editable:function(rowData){return rowData.allowEdit=true;}}, {key:"idI", name:"I", editable:function(rowData){return rowData.allowEdit=true;}}, {key:"idJ", name:"J", editable:function(rowData){return rowData.allowEdit=true;}} ] 
 
const columns = [ {id:0, name:{}}, {id:1, name:{}}, {id:2, name:{}}, {id:3, name:{}}, {id:4, name:{}}, {id:5, name:{}}, {id:6, name:{}}, {id:7, name:{}}, {id:8, name:{}}, {id:9, name:{}}, {id:10, name:{}}] 

export default class Spreadsheet extends React.Component {


  constructor(props) {
    super(props);
    //@TODO
    document.addEventListener("copy", this.handleCopy);
    document.addEventListener("paste", this.handlePaste);
    this.state={
    formula: props.formula
    };
  }
  
  setSelection=args=>{
  	this.setState
  };

  //@TODO called when an edit on cell takes place
  onGridRowsUpdated({fromRow, toRow, updated})=>{
   this.setState( state=>{
   	const rows = state.rows.slice();
   	for(leti=fromRow; i<=toRow; i++){
   	rows[i] = {rows[i], ...updated};
   	return {rows};
   });
  };

  render() {
    return(
    
    <ReactDataGrid
    columns = {columns}
    rowGetter={i=>rows[i]}
    rowsCount={10}
    minHeight={800}
    onGridRowsUpdated={this.onGridRowsUpdated}
    enableCellSelect={true}
    cellRangeSelection={{onComplete:this.setSelection}} />
    );
  }

}

const rootElement = document.getElementById("app");

function SSCell(props) {
  const { cellId, formula, value, onContextMenu, onFocus,
          className, tabIndex } = props;
  return (
    <td onContextMenu={onContextMenu}
        data-cellid={cellId}
        onFocus={onFocus}
        className={className}
        tabIndex={tabIndex}
        title={formula ?? ''}>
      {value ?? ''}
    </td>
  );
}
