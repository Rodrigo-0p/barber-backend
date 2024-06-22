const express       = require('express');
const useragent     = require('express-useragent');
const app           = express();
const cors          = require('cors');
const moment        = require('moment');

const validateToken = require('./routes/middlaware/mainMiddlaware');
const {log_info}    = require('./utils/logger')

// const {Open}    = require('./conection/conn');
// |------ * ------ * ------ * ------|
const routes_public = require('./routes/public');
const routes_admin  = require('./routes/index');
const helmet        = require('helmet');
require('dotenv').config();
// |------ * ------ * ------ * ------|
// Configuración
var corsOpciones = {
  origin:"*",
  optionsSuccessStatus:200
}
app.use(helmet({crossOriginResourcePolicy: false,}));
app.use(cors(corsOpciones));
app.use(useragent.express());
app.use(express.json({limit: '5120mb'}));
app.use(express.urlencoded({limit: '5120mb', extended: true}));
// |------ * ------ * ------ * ------|

app.use((req, res, next)=> {
  // Allow Origins
  res.header("Access-Control-Allow-Origin", "*");
  // Allow Methods
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  // Allow Headers
  res.header("Access-Control-Allow-Headers", "Origin, Accept, Content-Type, Authorization");
  // Allow Headers
  res.header('Cross-Origin-Resource-Policy', 'same-site');

  if (req.path.slice(0, 7) === '/public' || 
      req.path.slice(0, 8) === '/private') return next();

  const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var direccion_ip = ip.replace("::ffff:", "");
  log_info.info(`ruta: ${req.path} - ${direccion_ip} - [${moment().format('DD-MM-YYYY HH:mm')}]`);
  
  const token = req.headers.auth_token;
  console.log("Authorization:", token);
  console.log(req.path);

  // return app.use('/admin', validateToken(req, res, next),routes_admin(req, res, next));
  return validateToken(req, res, next);
})
app.use('/' ,routes_public(),routes_admin());
app.use('/public' , express.static(`${process.env.FILESTORE_PUBLIC}`));
app.use('/private', express.static(`${process.env.FILESTORE_PRIVATE}`));

module.exports = app;