import parse from './expr-parser.mjs';
import AppError from './app-error.mjs';
import { cellRefToCellId } from './util.mjs';

//use for development only
import { inspect } from 'util';

export default class Spreadsheet {

  //factory method
  static async make() { 
  
  return new Spreadsheet(); }

  constructor() {
    //@TODO
   
   let cellInfo= new Array(26);



   for(let i =0; i < cellInfo.length ;i++){
   cellInfo[i] = new Array(99);
   	for(let j=0;j<cellInfo[i].length;j++)
   	{
		let new1 = String.fromCharCode(97+i)+(j+1);
   		cellInfo[i][j] = new cellInfo1(new1);

   	}

 
   
   }
   this.cellInfo = cellInfo;
  

  }

  /** Set cell with id baseCellId to result of evaluating formula
   *  specified by the string expr.  Update all cells which are
   *  directly or indirectly dependent on the base cell.  Return an
   *  object mapping the id's of all dependent cells to their updated
   *  values.  User errors must be reported by throwing a suitable
   *  AppError object having code property set to `SYNTAX` for a
   *  syntax error and `CIRCULAR_REF` for a circular reference
   *  and message property set to a suitable error message.
   */
   
   
  async eval(baseCellId, expr) {
  
    const updates = {};
    
    //@TODO
    let ast = parse(expr);

    let val;
    console.log(ast);
    
    if(ast.type === 'num' && ast.kids.length == 0){
    	for(const [key,value] of Object.entries(this.cellInfo)){
   	  value.forEach( function(x){ 
    	  if(x.id === baseCellId){
            x.value=ast.value;
            updates[baseCellId] = ast.value;
          }
          })
        }
    
    }else if(ast.type === 'app' && ast.kids.length != 0 ){
    ast.kids.map(function (key, index){
    
    })
    }
    val = this.rec(parse(expr),baseCellId);
    
    updates[baseCellId] = val
   for(const [key,value] of Object.entries(this.cellInfo)){
   
   value.forEach( function(x){ 
    if(x.id === baseCellId){
        x.expr=expr;
    x.value=val;
    x.ast = ast;
   
    }})
    }
   
    return updates;
}
  //@TODO add methods
  
 
 
rec(ast,baseCellId){

if(ast === undefined){
return null;
}
if(ast.type === 'num'){
return ast.value;
}
else if(ast.type === 'app'){
return FNS[ast.fn](this.rec(ast.kids[0],baseCellId),this.rec(ast.kids[1],baseCellId));
}
else if(ast.type === 'ref'){
this.cellInfo[ast.value.col.index][parseInt(ast.value.row.index)].dependents.push(baseCellId)
return this.cellInfo[ast.value.col.index][parseInt(ast.value.row.index)].value;
}

}
 
}



//Map fn property of Ast type === 'app' to corresponding function.
const FNS = {
  '+': (a, b) => a + b,
  '-': (a, b=null) => b === null ? -a : a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  min: (...args) => Math.min(...args),
  max: (...args) => Math.max(...args),
}

//@TODO add other classes, functions, constants etc as needed
class cellInfo1{
constructor(id,expr,value,dependents,ast){
this.id = id;
this.expr= undefined;
this.value = undefined;
this.dependents=[];
this.ast = undefined;

}
}
