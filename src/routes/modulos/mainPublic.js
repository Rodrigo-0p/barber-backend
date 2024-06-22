const express    = require('express');
const router     = express.Router();
const mainInsert = require('../../public/insertUser'   );
const mainLogin  = require('../../public/login'        );
const mainReset  = require('../../public/resetPassword');

module.exports = ()=>{
  router.post('/public/insert/usuario/:key', mainInsert.insertUser   );
  router.post('/public/login/usuario'      , mainLogin.Autenticacion );
  router.post('/public/reset/usuario'      , mainReset.resetPassword );
  return router;
}