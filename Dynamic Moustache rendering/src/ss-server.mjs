import Path from 'path';

import express from 'express';
import bodyParser from 'body-parser';
//import Spreadsheet from 'cs544-ss';
import querystring from 'querystring';

import {AppError, Spreadsheet} from 'cs544-ss';

import Mustache from './mustache.mjs';

const STATIC_DIR = 'statics';
const TEMPLATES_DIR = 'templates';

//some common HTTP status codes; not all codes may be necessary
const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;
const spreadsheet = new Spreadsheet();
const __dirname = Path.dirname(new URL(import.meta.url).pathname);
let sname = '';

export default function serve(port, store) {
  process.chdir(__dirname);
  const app = express();
  app.locals.port = port;
  app.locals.store = store;
  app.locals.base = '/';
  app.locals.mustache = new Mustache();
  app.use('/', express.static(STATIC_DIR));
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}


/*********************** Routes and Handlers ***************************/

function setupRoutes(app) {
  app.use(bodyParser.urlencoded({extended: true}));
  
  //@TODO add routes
  //must be last
  const base = app.locals.base;
  //app.use('/', express.static(STATIC_DIR));
  app.get(`/`, displaySpreadsheetForm(app)); //get the open page
  //app.post(`/updatePage.html`, bodyParser.urlencoded({extended: true}), updateSpreadsheet(app)); //post the update
  app.post('/ss/test', actionOnSpreadsheet(app));
  app.get(`/update`, getSpreadsheet(app)); //goto update page for ss 
  
  app.use(do404(app));
  app.use(doErrors(app));

}

let arr = [{'id':1,'a':'','b':'','c':'','d':'','e':'','f':'','g':'','h':'','i':'','j':''},{id:2,a:'',b:'',c:'',d:'',e:'',f:'',g:'',h:'',i:'',j:''},{id:3,a:'',b:'',c:'',d:'',e:'',f:'',g:'',h:'',i:'',j:''},{id:4,a:'',b:'',c:'',d:'',e:'',f:'',g:'',h:'',i:'',j:''},{id:5,a:'',b:'',c:'',d:'',e:'',f:'',g:'',h:'',i:'',j:''},{id:6,a:'',b:'',c:'',d:'',e:'',f:'',g:'',h:'',i:'',j:''},{id:7,a:'',b:'',c:'',d:'',e:'',f:'',g:'',h:'',i:'',j:''},{id:8,a:'',b:'',c:'',d:'',e:'',f:'',g:'',h:'',i:'',j:''},{id:9,a:'',b:'',c:'',d:'',e:'',f:'',g:'',h:'',i:'',j:''},{id:10,a:'',b:'',c:'',d:'',e:'',f:'',g:'',h:'',i:'',j:''}]

//@TODO add handlers

/** Default handler for when there is no route for a particular method
 *  and path.
 */
function displaySpreadsheetForm(app){
 return async function(req, res){
  //const model = {base: app.locals.base, fields:FIELD_INFOS }; //not sure about base
  res.sendFile(__dirname +"/" +STATIC_DIR +"/home.html"); //open - template name 
 };
}
let final_res = [];
function successCallback(result) {
  console.log(result);
  final_res.push(result);
  
}

function failureCallback(error) {
  console.error(error);
  return '';
}


async function reduce(ss){
	final_res =[];
	ss.map(function(x){
		//console.log(x[0]);
		let promise =  spreadsheet.eval(x[0],x[1]);
		promise.then(successCallback, failureCallback);
		
		
	});
	
	return final_res;

}



function getSpreadsheet(app){
  return async function(req, res){
    let model;
    const id = req.query;
   
    sname = id;
    let Id='';
    let Val = '';
    try {
      const ss = await app.locals.store.readFormulas(id);
     // console.log(ss);
      let ar = await reduce(ss);
     // console.log(ar);
      arr.map(function(x){
      for (const [key, value] of Object.entries(x)) {
      if(key!='id'){
      x[key] ='';
      }
      }
      })
      ar.map(function(x){
      for (const [key, value] of Object.entries(x)) {
      Id= key.substring(1);
      Val = key.substring(0,1);
     // console.log(Val);
      arr[Id-1][Val]=value;
      }
      //console.log(arr);
      })
      let model={
      User:arr
      }
      let template = '';
      const html = app.locals.mustache.render('updatedPage',model);
      res.send(html);
      
    }
    catch (err) {
      console.error(err);
      console.log("Entered catch");
    }
    //const html = app.locals.mustache.render('updatePage', model); // updatePage template
    //res.send();
  };
}

async function common(app){


    
    let Id='';
    let Val = '';
    try {
      const ss = await app.locals.store.readFormulas(sname);
      console.log(ss);
      let ar = await reduce(ss);
     // console.log(ar);
      let set = '';
      for(let c of arr){
     // console.log(c);
      for (const [key, value] of Object.entries(c)) {
     // console.log(key+" "+value);
      if(key!== 'id'){
     // console.log(c[key]);
      c[key] = set;
      }
      }
      }
      ar.map(function(x){
      for (const [key, value] of Object.entries(x)) {
      Id= key.substring(1);
      Val = key.substring(0,1);
      console.log(Val);
      arr[Id-1][Val]=value;
      }
     // console.log(arr);
      })
      let model={
      User:arr
      }
      let template = '';
      const html = app.locals.mustache.render('updatedPage',model);
      return html;
      
    }
    catch (err) {
      console.error(err);
      console.log("Entered catch");
    }

}

function actionOnSpreadsheet(app){
 return async function(req, res) { //{ ssAct: 'updateCell', cellId: 'z11', formula: '9' }copyCell, deleteCell, clear
   
   const action = req.body.ssAct;
   //const id = req.query;
  // console.log(req.params.body);
   const id = sname;
   try{
   switch(action){
     case 'updateCell':{
    // console.log("in update cell");
     
     let cellID = req.body.cellId;
     let formula = req.body.formula;
     const ss = await app.locals.store.updateCell(id, cellID, {formula});
   	let html= await common(app);
   	res.send(html);
    // console.log(ss);
    
     break;
     }
     
     case 'copyCell':{
   //  console.log("in copy cell");
     let destCellID = req.body.cellId;
     let srcCellId = req.body.formula;
     let f = spreadsheet.query(srcCellId); //{ value: 0, formula: '' }
     //console.log(f);
      const ss = await app.locals.store.updateCell(id, destCellID, f);
     // console.log(ss);
      let html= await common(app);
   	res.send(html);
     break;
     }
     
     case 'deleteCell':{
     //console.log("in del cell");
     let cell = req.body.cellId;
    // console.log(cell);
      const ss = await app.locals.store.delete(id, cell);
     // console.log(ss);
      let html= await common(app);
   	res.send(html);
     break;
     }
     
     case 'clear':{
    // console.log("in clear");
      const ss = await app.locals.store.clear(id);
     // console.log(ss);
      let html= await common(app);
   	res.send(html);
     break;
     }
     
   }//end of switch
   }catch(err){ console.log(err); console.log("error occured");}
   
 };
}

function updateSpreadsheet(app){
 return async function(req, res) {
  const cell = req.body;
  let errors = {};
  const isUpdate = req.body.submit == 'Update';
  if(!errors){
   try{
     if(isUpdate){
       await app.locals.store.patch(cell);
       //redirect to the update page 
     }
   }catch(err){console.log(err);}
  }
  if(errors){}
  
 };
}

function do404(app) {
  return async function(req, res) {
    const message = `${req.method} not supported for ${req.originalUrl}`;
    res.status(NOT_FOUND).
      send(app.locals.mustache.render('errors',
				      { errors: [{ msg: message, }] }));
  };
}

/** Ensures a server error results in an error page sent back to
 *  client with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    res.status(SERVER_ERROR);
    res.send(app.locals.mustache.render('errors',
					{ errors: [ {msg: err.message, }] }));
    console.error(err);
  };
}

/************************* SS View Generation **************************/

const MIN_ROWS = 10;
const MIN_COLS = 10;

//@TODO add functions to build a spreadsheet view suitable for mustache

/**************************** Validation ********************************/


const ACTS = new Set(['clear', 'deleteCell', 'updateCell', 'copyCell']);
const ACTS_ERROR = `Action must be one of ${Array.from(ACTS).join(', ')}.`;

//mapping from widget names to info.
const FIELD_INFOS = {
  ssAct: {
    friendlyName: 'Action',
    err: val => !ACTS.has(val) && ACTS_ERROR,
  },
  ssName: {
    friendlyName: 'Spreadsheet Name',
    err: val => !/^[\w\- ]+$/.test(val) && `
      Bad spreadsheet name "${val}": must contain only alphanumeric
      characters, underscore, hyphen or space.
    `,
  },
  cellId: {
    friendlyName: 'Cell ID',
    err: val => !/^[a-z]\d\d?$/i.test(val) && `
      Bad cell id "${val}": must consist of a letter followed by one
      or two digits.
    `,
  },
  formula: {
    friendlyName: 'cell formula',
  },
};

/** return true iff params[name] is valid; if not, add suitable error
 *  message as errors[name].
 */
function validateField(name, params, errors) {
  const info = FIELD_INFOS[name];
  const value = params[name];
  if (isEmpty(value)) {
    errors[name] = `The ${info.friendlyName} field must be specified`;
    return false;
  }
  if (info.err) {
    const err = info.err(value);
    if (err) {
      errors[name] = err;
      return false;
    }
  }
  return true;
}

  
/** validate widgets in update object, returning true iff all valid.
 *  Add suitable error messages to errors object.
 */
function validateUpdate(update, errors) {
  const act = update.ssAct ?? '';
  switch (act) {
    case '':
      errors.ssAct = 'Action must be specified.';
      return false;
    case 'clear':
      return validateFields('Clear', [], ['cellId', 'formula'], update, errors);
    case 'deleteCell':
      return validateFields('Delete Cell', ['cellId'], ['formula'],
			    update, errors);
    case 'copyCell': {
      const isOk = validateFields('Copy Cell', ['cellId','formula'], [],
				  update, errors);
      if (!isOk) {
	return false;
      }
      else if (!FIELD_INFOS.cellId.err(update.formula)) {
	  return true;
      }
      else {
	errors.formula = `Copy requires formula to specify a cell ID`;
	return false;
      }
    }
    case 'updateCell':
      return validateFields('Update Cell', ['cellId','formula'], [],
			    update, errors);
    default:
      errors.ssAct = `Invalid action "${act}`;
      return false;
  }
}

function validateFields(act, required, forbidden, params, errors) {
  for (const name of forbidden) {
    if (params[name]) {
      errors[name] = `
	${FIELD_INFOS[name].friendlyName} must not be specified
        for ${act} action
      `;
    }
  }
  for (const name of required) validateField(name, params, errors);
  return Object.keys(errors).length === 0;
}


/************************ General Utilities ****************************/

/** return new object just like paramsObj except that all values are
 *  trim()'d.
 */
function trimValues(paramsObj) {
  const trimmedPairs = Object.entries(paramsObj).
    map(([k, v]) => [k, v.toString().trim()]);
  return Object.fromEntries(trimmedPairs);
}

function isEmpty(v) {
  return (v === undefined) || v === null ||
    (typeof v === 'string' && v.trim().length === 0);
}

/** Return original URL for req.  If index specified, then set it as
 *  _index query param 
 */
function requestUrl(req, index) {
  const port = req.app.locals.port;
  let url = `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
  if (index !== undefined) {
    if (url.match(/_index=\d+/)) {
      url = url.replace(/_index=\d+/, `_index=${index}`);
    }
    else {
      url += url.indexOf('?') < 0 ? '?' : '&';
      url += `_index=${index}`;
    }
  }
  return url;
}

