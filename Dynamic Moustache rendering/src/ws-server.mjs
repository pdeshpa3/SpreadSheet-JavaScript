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
  app.use(cors(CORS_OPTIONS));

  //pseudo-handlers used to set up defaults for req
  app.use(bodyParser.json());      //always parse request bodies as JSON

  //application routes
  app.delete(`/${BASE}/${STORE}/:ssName`, doStoreDelete(app));
  app.get(`/${BASE}/${STORE}/:ssName`, doStoreRead(app));
  app.patch(`/${BASE}/${STORE}/:ssName/`, doStoreUpdate(app, false));
  app.put(`/${BASE}/${STORE}/:ssName/`, doStoreUpdate(app, true));

  app.delete(`/${BASE}/${STORE}/:ssName/:cellId`, doStoreCellDelete(app));
  app.patch(`/${BASE}/${STORE}/:ssName/:cellId`, doStoreCellUpdate(app));
  app.put(`/${BASE}/${STORE}/:ssName/:cellId`, doStoreCellUpdate(app));

  //must be last
  app.use(do404(app));
  app.use(doErrors(app));
}

/****************************** Handlers *******************************/

function doStoreRead(app) {
  return async function(req, res) { 
    try {
      const ssName = req.params.ssName;
      const result = await app.locals.ssStore.readFormulas(ssName);
      res.json(result);
    }
    catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  };
}

function doStoreDelete(app, doClear) {
  return async function(req, res) {
    try {
      const ssName = req.params.ssName;
      await app.locals.ssStore.clear(ssName);
      res.status(NO_CONTENT).end();
    }
    catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  };
}
function doStoreUpdate(app, doClear) {
  return async function(req, res) {
    try {
      const ssName = req.params.ssName;
      const cellFormulas = req.body;
      if (!isValidPairList(cellFormulas)) {
	const response = {
	  error: {
	    code: 'BAD_REQUEST',
	    message: 'request body must be a list of cellId, formula pairs',
	  },
	  status: BAD_REQUEST,	  
	};
	res.status(BAD_REQUEST).json(response);
      }
      else {
	if (doClear) await app.locals.ssStore.clear(ssName);
	for (const [cellId, formula] of cellFormulas) {
	  await app.locals.ssStore.updateCell(ssName, cellId, formula);
	}
	const status = (req.method === 'PUT') ? CREATED : NO_CONTENT;
	res.status(status).end();
      }
    }
    catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  };
}

function doStoreCellDelete(app) {
  return async function(req, res) {
    try {
      const { ssName, cellId } = req.params;
      await app.locals.ssStore.delete(ssName, cellId);
      res.status(NO_CONTENT).end();
    }
    catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  };
}

function doStoreCellUpdate(app) {
  return async function(req, res) {
    try {
      const { ssName, cellId } = req.params;
      const formulaObj = req.body;
      if (!isValidFormula(formulaObj)) {
	const response = {
	  error: {
	    code: 'BAD_REQUEST',
	    message: 'request body must be a { formula } object',
	  },
	  status: BAD_REQUEST,	  
	};
	res.status(BAD_REQUEST).json(response);
      }
      else {
	const { formula } = formulaObj;
	await app.locals.ssStore.updateCell(ssName, cellId, formula);
	const status = (req.method === 'PUT') ? CREATED : NO_CONTENT;
	res.status(status).end();
      }
    }
    catch (err) {
      const mapped = mapError(err);
      res.status(mapped.status).json(mapped);
    }
  };
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

/*************************** Validation Routines ***********************/

function isValidPairList(pairs) {
  return (pairs instanceof Array) && pairs.length > 1 &&
    pairs.every(p => p instanceof Array && p.length === 2);
}

function isValidFormula(obj) {
  return obj instanceof Object && obj.hasOwnProperty('formula');
}


/*************************** Mapping Errors ****************************/

const ERROR_MAP = {
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
