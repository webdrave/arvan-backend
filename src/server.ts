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
import cookieParser from 'cookie-parser'


/******************************************************************************
                                Setup
******************************************************************************/

const app = express();


// **** Middleware **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Show routes called in console during development
if (ENV.NODE_ENV === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security


//CORS
const whitelist = [ENV.FRONTENDURL];
const corsOptions = {
  origin: ENV.FRONTENDURL,// Only allow your frontend URL
  credentials: true,     
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Add APIs, must be after middleware

import UserRouter from './routes/products.routes.js'
import uploadRouter from './routes/upload.routes.js'
import categoryRouter from './routes/category.routes.js'
import customersRoutes from './routes/customers.routes.js'
import orderRoutes from './routes/order.routes.js'

app.use(globalErrorHandler);
app.use("/api/products", UserRouter);
// app.use(Paths.Base, BaseRouter);

app.use("/api/upload", uploadRouter);

app.use("/api/category", categoryRouter);

app.use("/api/customers",customersRoutes);

app.use("/api/orders",orderRoutes);

// Add error handler

// app.use(authenticateJWT)



// **** FrontEnd Content **** //

// Set views directory (html)

// Redirect to login if not logged in.


/******************************************************************************
                                Export default
******************************************************************************/

export default app;


