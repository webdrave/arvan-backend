import morgan from 'morgan';

import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';


import 'express-async-errors';

// import BaseRouter from '@src/routes';
import { authenticateJWT, globalErrorHandler } from './middleware/globalerrorhandler.js';

import ENV from './common/env.js';
import HttpStatusCodes from './common/httpstatuscode.js';
import { RouteError } from './common/routeerror.js';
import { NodeEnvs } from './common/constants.js';
import cors from 'cors';


/******************************************************************************
                                Setup
******************************************************************************/

const app = express();


// **** Middleware **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Show routes called in console during development
if (ENV.NODE_ENV === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security
if (ENV.NODE_ENV === NodeEnvs.Production) {
  app.use(helmet());
}

//CORS
const whitelist = [ENV.FRONTENDURL];
const corsOptions = {
  origin: function (origin: any, callback: Function) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));
// Add APIs, must be after middleware

import UserRouter from './routes/products.routes.js'
import uploadRouter from './routes/upload.routes.js'
import categoryRouter from './routes/category.routes.js'
import authRouter from './routes/auth.routes.js'

app.use("/api/products", UserRouter);
// app.use(Paths.Base, BaseRouter);

app.use("/api/upload", uploadRouter);

app.use("/api/category", categoryRouter);

app.use("/api/auth",authRouter);

// Add error handler
app.use(globalErrorHandler);
app.use(authenticateJWT)



// **** FrontEnd Content **** //

// Set views directory (html)

// Redirect to login if not logged in.


/******************************************************************************
                                Export default
******************************************************************************/

export default app;
