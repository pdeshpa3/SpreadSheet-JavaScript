import assert from 'assert';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';

import {AppError} from 'cs544-ss';

/** Storage web service for spreadsheets.  Will report DB errors but
 *  will not make any attempt to report spreadsheet errors like bad
 *  formula syntax or circular references (it is assumed that a higher
 *  layer takes care of checking for this and the inputs to this
 *  service have already been validated).
 */

//some common HTTP status codes; not all codes may be necessary
const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

export default function serve(port, ssStore) {
  const app = express();
  app.locals.port = port;
  app.locals.ssStore = ssStore;
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}

const CORS_OPTIONS = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: 'Location',
};

const BASE = 'api';
const STORE = 'store';


function setupRoutes(app) {
  app.use(cors(CORS_OPTIONS));  //needed for future projects
  //@TODO add routes to handlers
 
  
  //app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
 
    app.get(`/${BASE}/${STORE}/:SS_NAME`, getSpreadsheetData(app));
    
  app.put(`/${BASE}/${STORE}/:SS_NAME`, replaceSpreadsheetData(app));
  app.patch(`/${BASE}/${STORE}/:SS_NAME`, updateSpreadsheetData(app));
  app.delete(`/${BASE}/${STORE}/:SS_NAME`,clearSpreadsheetData(app));

  app.put(`/${BASE}/${STORE}/:SS_NAME/:CELL_ID`, replaceSpreadsheetCell(app));
  app.patch(`/${BASE}/${STORE}/:SS_NAME/:CELL_ID`, updateSpreadsheetCell(app));
  app.delete(`/${BASE}/${STORE}/:SS_NAME/:CELL_ID`, clearSpreadsheetCell(app));

  
  app.use(do404(app));
  app.use(doErrors(app));
  
}

/****************************** Handlers *******************************/

//@TODO

async function updateCell(app, name, cellId, formula){
     await app.locals.ssStore.updateCell(name, cellId, formula);
}


// GET SS_NAME
function getSpreadsheetData(app) {
  return (async function(req, res) {
   
    
    try {
        const name = req.params.SS_NAME;
	const results = await app.locals.ssStore.readFormulas(name);
	
	res.status(OK).json(results);
	
	
    } catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }

  });

}


// PUT SS_NAME
function replaceSpreadsheetData(app) {

  return (async function(req, res) {
   
    try {
        const name = req.params.SS_NAME;
	
	const data = req.body;
	let isErr = false;
	console.log(data);
	
	for(const cell of data){
	   // await app.locals.ssStore.updateCell(name, cell[0], cell[1]);
	   if(Array.isArray(cell) && cell.length === 2){
	     await updateCell(app, name, cell[0], cell[1]);
	   }else{
	     isErr = true;
	     
	   }  
	}
	if(isErr){
	  const err = new AppError(
               "BAD_REQUEST",
               "request body must be a list of cellId, formula pairs"
             );
	  const mapped = mapError(err);
          res.status(mapped.status).json(mapped);
	}else{
	  res.status(CREATED).send("");
	}
	
	
	
    } catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }

  });

}




// PATCH SS_NAME
function updateSpreadsheetData(app) {
  return (async function(req, res) {
    
    try {
	const name = req.params.SS_NAME;
	
	const data = req.body;
	let isErr = false;
	
	for(const cell of data){
	   // await app.locals.ssStore.updateCell(name, cell[0], cell[1]);
	    if(Array.isArray(cell) && cell.length === 2){
	     await updateCell(app, name, cell[0], cell[1]);
	   }else{
	     isErr = true;   
	     
	   }  
	}
	if(isErr){
	  const err = new AppError(
               "BAD_REQUEST",
               "request body must be a list of cellId, formula pairs"
             );
	  const mapped = mapError(err);
          res.status(mapped.status).json(mapped);
	}else{
	  res.status(NO_CONTENT).send("");
	}
	
	
	
	
    } catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }

  });
}


// DELETE SS_NAME
function clearSpreadsheetData(app) {
  return (async function(req, res) {
   
    try {
        const name = req.params.SS_NAME;
	const results = await app.locals.ssStore.clear(name);
	res.status(NO_CONTENT).send(results);
    } catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }

  });
}



// PUT CELL_ID
function replaceSpreadsheetCell(app) {
  return (async function(req, res) {
    
    try {
    
        const name = req.params.SS_NAME;
	const cell = req.params.CELL_ID;
	
	const data = req.body;
	console.log(data);
	
	if(data.formula){
	  await updateCell(app, name, cell, data.formula);
	  res.status(CREATED).send("");
	}else{
	  const err = new AppError(
               "BAD_REQUEST",
               "request body must be a { formula } object"
           );
	  const mapped = mapError(err);
          res.status(mapped.status).json(mapped);
	}
	
	

    } catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }

  });
}


// PATCH CELL_ID
function updateSpreadsheetCell(app) {
  return (async function(req, res) {
   
    try {
    
        const name = req.params.SS_NAME;
	const cell = req.params.CELL_ID;
	
	const data = req.body;
	console.log(data);
	
	if(data.formula){
	  await updateCell(app, name, cell, data.formula);
	  res.status(NO_CONTENT).send("");
	}else{
	  
	  const err = new AppError("BAD_REQUEST",
              "request body must be a { formula } object"
           );
	  const mapped = mapError(err);
          res.status(mapped.status).json(mapped);
	}
	
    } catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }

  });
}


// DELETE CELL_ID
function clearSpreadsheetCell(app) {
  return (async function(req, res) {
    
    try {
    
      const name = req.params.SS_NAME;
      const cell = req.params.CELL_ID;
      
      await app.locals.ssStore.delete(name, cell);
      
      res.status(NO_CONTENT).send("");

    } catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }

  });
}







/** Default handler for when there is no route for a particular method
 *  and path.
 */
function do404(app) {
  return async function(req, res) {
    const message = `${req.method} not supported for ${req.originalUrl}`;
    const result = {
      status: NOT_FOUND,
      error: { code: 'NOT_FOUND', message, },
    };
    res.status(404).
	json(result);
  };
}


/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    const result = {
      status: SERVER_ERROR,
      error: { code: 'SERVER_ERROR', message: err.message },
    };
    res.status(SERVER_ERROR).json(result);
    console.error(err);
  };
}


/*************************** Mapping Errors ****************************/

const ERROR_MAP = {
NOT_FOUND, BAD_REQUEST, NO_CONTENT
}

/** Map domain/internal errors into suitable HTTP errors.  Return'd
 *  object will have a "status" property corresponding to HTTP status
 *  code and an error property containing an object with with code and
 *  message properties.
 */
function mapError(err) {
  const isDomainError = (err instanceof AppError);
  const status =
    isDomainError ? (ERROR_MAP[err.code] || BAD_REQUEST) : SERVER_ERROR;
  const error = 
	isDomainError
	? { code: err.code, message: err.message } 
        : { code: 'SERVER_ERROR', message: err.toString() };
  if (!isDomainError) console.error(err);
  return { status, error };
} 

/****************************** Utilities ******************************/



/** Return original URL for req */
function requestUrl(req) {
  const port = req.app.locals.port;
  return `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
}
