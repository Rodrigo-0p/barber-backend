const Joi             = require("@hapi/joi");
const lenguaje        = require("../utils/mesajeJoi/messages");
const jwt             = require("jsonwebtoken");
const {log_error}     = require("../utils/logger");
const db              = require("../conection/conn");
const bcrypt          = require('bcrypt');
const { getPermisosMenu } = require('./getpermisos');

require('dotenv').config();

const validarlogin = Joi.object({
  usuario : Joi.string().min(3).max(35).required().messages(lenguaje.messages),
  password: Joi.string().min(8).max(15).required().messages(lenguaje.messages)
});

exports.Autenticacion = async (req, res, next) =>{
  // validacion de maximo y minimo de caracter
  const { error } = validarlogin.validate(req.body)
  if(error){
      return res.status(200).json({
        res:0, 
        mensaje:error.details[0].message,            
      });
  }
  const {usuario,password} = req.body;
  
  try {   
      var sql = `  select u.*
                        , e.nombre as empresa
                        , e.descripcion as desc_empresa
                     from usuarios u
                        , empresa  e
                    where u.empresa_id     = e.id
                      and upper(u.usuario) = upper($1)`;
      var valor   = [usuario];
      const resul = await db.Open(sql,valor);

      if(resul.rows.length > 0){
        if(resul.rows[0].activo !== 'S'){
          return res.status(200).json({res:0, mensaje:'Usuario Inactivo!!'});
        }else 

        if(resul.rows[0].password !== ""){
          const validPassword = await bcrypt.compare(password, resul.rows[0].password);
          if (!validPassword){
            log_error.error({res:0, mensaje:'Contraseña no válida!!'})
            return res.status(200).json({res:0, mensaje:'Contraseña no válida!!'});
          }
        }else{
          return res.status(200).json({res:-1, mensaje:'restablezca la contaseña!!'});
        }
        
        const token    = jwt.sign({id:resul.rows[0].usuario}, process.env.JW_CLAVE,{expiresIn:'5h',});
        const permisos = await getPermisosMenu(resul.rows[0].usuario)
        let rows = { 
                      'usuario'     :resul.rows[0].usuario      ,
                      'nombre'      :resul.rows[0].nombre       ,
                      'apellido'    :resul.rows[0].apellido     ,
                      'img'         :resul.rows[0].url_img      ,
                      'id'          :resul.rows[0].id           ,
                      'empresa_id'  :resul.rows[0].empresa_id   ,
                      'empresa'     :resul.rows[0].empresa      ,
                      'desc_empresa':resul.rows[0].desc_empresa ,
                      'menu'        :permisos                   ,
                      'token'       :token                      ,
                      'hash'        :resul.rows[0].password     ,
                    }
        res.status(200).json({res:1, mensaje:"Usuario logueado con exito!!", rows});          
      }else{
        log_error.error({res:0, mensaje:'EL usuario no existe en la base de datos'})
        res.status(200).json({res:0, mensaje:'EL usuario no existe en la base de datos'});
      }
  } catch (error) {
      log_error.error(`se produjo un error en la funcion de la autenticacion ${error}`);
      console.log(`se produjo un error en la funcion de la autenticacion ${error}`);
      next();
  }   
}