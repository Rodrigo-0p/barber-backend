const express     = require('express');
const router      = express.Router();
const url_base    = '/admin/acercade' 

const lCabecera   = require('../../../../../controllers/modulos/bs/definicion/ACERCADE/listar/listarCab')
const main        = require('../../../../../controllers/modulos/bs/definicion/ACERCADE/main')
const mainUpload  = require('../../../../../controllers/upload/main')

module.exports = ()=>{
  // LISTAR CAB
  router.post( url_base + '/cabecera'                      , lCabecera.getListCab );
  router.get ( url_base + '/idserial/:empresa_id'          , main.getAcercaDe     );
  router.post( url_base + '/upload/img/:nameFile/:nameImg' , mainUpload.main      );
  // ABM
  router.post( url_base                                    , main.mainAcercaDe    );
  // Activar
  router.post( url_base + '/activarForm'                   , main.mainActivar     );
  
  return router;
}