/** src/server.ts */
import http from 'http';
import express, {Express} from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import morgan from 'morgan';

import {Client as ESClient} from '@elastic/elasticsearch';
import {Pool, PoolClient} from 'pg';

import userRoutes from './users/routes';
import accountLinkingRoutes from './account_linking/routes';
import emailMagicLinkLoginRoutes from './auth/routes';

import docsRoutes from './docs/routes';
import importRoutes from './import/routes';
import {Emailer, NodeEmailer} from './lib/emailer';

const {config} = require('dotenv');
config();

const app: Express = express();
/** Cookie Parsing **/
app.use(cookieParser());
/** Logging */
app.use(morgan('dev'));
/** Parse the request */
app.use(express.urlencoded({extended: false}));
/** Takes care of JSON data */
app.use(express.json());
/** CORS Stuff **/
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'https://www.indexter.tech',
    'https://indexter.tech' /* other prod domains */,
  ];
  const origin = req.headers.origin || '';

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, POST');
    return res.status(200).json({});
  }
  console.log(
    'allow-origin-header',
    res.getHeader('Access-Control-Allow-Origin')
  );
  next();
});

/** Routes */
const Routes = (pc: PoolClient, es: ESClient, emailer: Emailer) => {
  const router = express.Router();
  router.use('/users', userRoutes(pc, emailer));
  router.use('/login', emailMagicLinkLoginRoutes(pc, emailer));
  router.use('/connections', accountLinkingRoutes(pc));
  router.use('/docs', docsRoutes(pc, es));
  router.use('/index', importRoutes(pc, es));
  return router;
};

/** Server */
http.createServer(app);

/** External Dependency Config **/
const pg = new Pool();
const emailer = new NodeEmailer();
const esClient = new ESClient({
  node: {url: new URL(process.env.ELASTICSEARCH_URL || 'http://es:9200')},
});

app.listen(process.env.PORT ?? 3000, async () => {
  console.log('connecting to external dependencies...');

  try {
    let [pc] = await Promise.all([
      pg.connect(),
      // other async external dep connections here
    ]);
    app.use((req, res, next) => {
      res.locals.loggedIn = false;
      if (req.cookies && req.cookies.lit) {
        try {
          jwt.verify(
            req.cookies.lit,
            process.env.JWT_SIGNING_SECRET || 'local_signing_only'
          );
          res.locals.loggedIn = true;
        } catch (e) {
          console.log(e);
          next();
        }
      }
      next();
    });
    app.use(Routes(pc, esClient, emailer));
    app.get('/status', (req, res, next) => {
      res.status(200).json({
        loggedIn: res.locals.loggedIn,
      });
    });
  } catch (err) {
    console.log(err);
  }

  /** Error handling */
  app.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
      message: error.message,
    });
  });

  console.log('connected to external dependencies!');
  console.log(`The server is running on port ${process.env.PORT ?? 3000}`);
});
