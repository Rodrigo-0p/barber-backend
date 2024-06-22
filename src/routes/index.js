

const express        = require('express');
const router         = express.Router();
// const upload      = require('./modulos/upload');

// BASE DEFINICION
const acercade    = require('./modulos/bs/definicion/ACERCADE/ACERCADE')

module.exports = ()=>{
  // ADMIN

  // BASE DEFINICION
  router.use( acercade() );
  return router;
}