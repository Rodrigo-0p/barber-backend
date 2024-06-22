const bcrypt      = require('bcrypt');
const Joi         = require('@hapi/joi');
const lenguaje    = require('../utils/mesajeJoi/messages');
const {log_error} = require('../utils/logger');
const db          = require("../conection/conn");
require('dotenv').config();

const validarRegistroUsuario = Joi.object({
  usuario: Joi.string().min(3).max(35).required().messages(lenguaje.messages),
  password: Joi.string().min(8).max(15).required().messages(lenguaje.messages)
});

exports.insertUser =  async (req, res, next) => {
  let key = req.params.key;
  
  const { error } = validarRegistroUsuario.validate({'usuario':req.body.usuario,'password':req.body.password})
  if(error){
    log_error.error(error.details[0].message)
    res.status(200).json({res:0,mensaje:error.details[0].message});
    return
  }else if(key !== process.env.KEYINSERT){
    let p_mensaje = 'key de creación invalido!!';
    log_error.error(p_mensaje)
    res.status(200).json({res:0,mensaje:p_mensaje});
    return
  }

  const {usuario, password, correo = '', nombre = '' , apellido = '', activo = 'N'} = req.body;

  let existeUser  = `select u.usuario from usuarios u where upper(u.usuario) = upper($1)`;
  const result = await db.Open(existeUser,[usuario]);
  if(result.rows.length > 0) return res.status(200).json({mensaje:"El usuario ya existe en la base de datos"})

  // hash contraseña
  const has      = await bcrypt.genSalt(10);
  const pass     = await bcrypt.hash(password, has);

  let sql =`insert into usuarios ( usuario
                                 , password
                                 , correo
                                 , nombre
                                 , apellido
                                 , activo)
                             values (
                                  '${usuario.toUpperCase()}'
                                , '${pass}'
                                , '${correo}'
                                , '${nombre}'
                                , '${apellido}'
                                , '${activo}')`;
  try {
    const result = await db.Open(sql,[]);       
    if(result.rowCount){
      res.status(200).json({res:1,mcensaje:'ok'});
    }else{
      res.status(200).json({res:0,mensaje:'Favor intente nuevamente mas tarde !'});
    }
  } catch (error) {
    const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var direccion_ip = ip.replace("::ffff:", "");
    log_error.error(`error al insertar usuario error:${error} ip:${direccion_ip}`)
    console.log('error al insertar usuario',error);
    next();
  }
};