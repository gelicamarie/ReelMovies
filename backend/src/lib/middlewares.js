import { Router, json } from 'express';
import morgan from 'morgan';

const reel = Router();

reel.use(morgan('dev'));
reel.use(json());

export default reel;
