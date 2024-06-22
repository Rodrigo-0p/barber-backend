
const express     = require('express');
const router      = express.Router();
const mainPublic  = require('./modulos/mainPublic');

module.exports = ()=>{
  // PUBLIC
  router.use( mainPublic() );

  return router;
}