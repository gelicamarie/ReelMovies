import express from 'express';
import mongoose from 'mongoose';

import middleware from './lib/middlewares';
import apiRoutes from './routes';

const MONGO_URI = 'mongodb://localhost:27017/geldb';

const app = express();

const startServer = async () => {
  // Connect to DB
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log(err);
    console.error('Unable to connect to MongoDB');
    process.exit(-1);
  }

  app.use(middleware);
  app.use(apiRoutes);

  // 404 errors
  app.use((_res, _req, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
  });

  // Error handler (all errors are passed to this)
  app.use(({ message, status }, { method, path }, res, next) => {
    const errorCode = status || 500;
    res.status(errorCode).json({
      error: errorCode,
      request: { method, path },
      message,
    });
    next();
  });

  app.listen(5000, () => {
    console.log('Server ready at http://localhost:5000');
  });
};

startServer();
