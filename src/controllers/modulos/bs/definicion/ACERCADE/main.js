const {log_error}       = require("../../../../../utils/logger");
const db                = require("../../../../../conection/conn");
const {generate_insert} = require("../../../../../utils/generate_inserte");
const {generate_update} = require("../../../../../utils/generate_update");
const {generate_delete} = require("../../../../../utils/generate_delete");
const tableData         = require('./tableDate');
const copyImg           = require('../../../../upload/main');

exports.getAcercaDe = async (req, res, next) => {
  let { empresa_id }  = req.params;
  try {
    var sql = ` select max(ad.id) + 1 as id 
                  from acerca_de ad 
                 where ad.empresa_id = ${empresa_id}`;
    let valor   = [];
    const resul = await db.Open(sql,valor);
    res.status(200).json(resul.rows);
  } catch (error) {
    log_error.error(`se produjo un error en la funcion getIdAcercaDe ${error}`);
    console.log(`se produjo un error en la funcion getIdAcercaDe ${error}`);
    next();
  }
}
exports.mainAcercaDe = async(req, res, next)=>{
  var content     = req.body;
  var empresa_id  = content.AditionalData[0].usuario;
  var empresa_id  = content.AditionalData[0].empresa_id;

  // CAB
  let NameTableCab   = 'acerca_de';
  let tableCab       = tableData.find( item => item.table === NameTableCab);
  let datosInserCab  = await generate_insert(NameTableCab, content.updateInsert,{empresa_id},tableCab.column);
  let datosUpdatCab  = await generate_update(NameTableCab, content.updateInsert, content.aux_updateInsert,{},{}, tableCab.column,  tableCab.pk); 
  let deleteCab      = await generate_delete(NameTableCab, content.delete_cab,{},tableCab.column,  tableCab.pk);// { cod_empresa, cod_usuario, direccion_ip, modulo:'ST', paquete:'eds_stenvio' }, tableDet.column,  tableDet.pk); 

  try {  
    // Procesar inserciones y actualizaciones
    const resulInsert = await db.Open(datosInserCab, [], res);
    const resulUpdate = await db.Open(datosUpdatCab, [], res);
    const resulDelete = await db.Open(deleteCab    , [], res);

    const totalFilas = (resulInsert[1] ? resulInsert[1].rowCount : 0) + 
                       (resulUpdate[1] ? resulUpdate[1].rowCount : 0) + 
                       (resulDelete[1] ? resulDelete[1].rowCount : 0);

    const mensaje =    (resulInsert[0]?.message ? resulInsert[0].message : "") +
                       (resulUpdate[0]?.message ? resulUpdate[0].message : "") +
                       (resulDelete[0]?.message ? resulDelete[0].message : "");
                                 
    res.status(200).json({res:totalFilas, mensaje});
  } catch (error) {
    log_error.error({error, mensaje:'abm acerca_de'});
    console.log(error)
  }
}
exports.mainActivar = async(req, res, next)=>{
  let content     = req.body;
  let NameTableCab   = 'acerca_de';
  let tableCab       = tableData.find( item => item.table === NameTableCab);
  let datosUpdatCab  = await generate_update(NameTableCab, [content], content.aux_update,{},{}, tableCab.column,  tableCab.pk); 
  
  try {
    const resulInsert  = await db.Open(datosUpdatCab, [], res);
    let data           = { res     : resulInsert[1]          ? resulInsert[1].rowCount : 0, 
                           mensaje : resulInsert[0]?.message ? resulInsert[0].message  : ""};    

    if(data.res > 0 || datosUpdatCab === ""){
      const origen  = process.env.FILESTORE_PRIVATE+`\\ACERCADE\\acercade-img${content.id}.jpg`;
      const destino = process.env.FILESTORE_PUBLIC+'\\img\\acercade-img.jpg';

      let dataRow   = { titulo      : content.titulo      ,
                        subtitulo   : content.subtitulo   ,
                        descripcion : content.descripcion ,
                        empresa_id  : content.empresa_id  ,
                      }
      try {
        await copyImg.saveData(dataRow,'ACERCADE',process.env.FILESTORE_PUBLIC+'\\data\\');
        await copyImg.copiarImagen(origen,destino);  
      } catch (error) {
        console.log(error)
        log_error.error(error);
        next()
      }      
    }
    res.status(200).json(data); 
  } catch (error) {
    
  }
}