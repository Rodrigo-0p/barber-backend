const Joi         = require("@hapi/joi");
const lenguaje    = require("../utils/mesajeJoi/messages");
const jwt         = require("jsonwebtoken");
const {log_error} = require("../utils/logger");
const db          = require("../conection/conn");
const bcrypt      = require('bcrypt');
const { getPermisosMenu } = require("./getpermisos");
require('dotenv').config();

const validarlogin = Joi.object({
  usuario : Joi.string().min(3).max(35).required().messages(lenguaje.messages),
  password: Joi.string().min(8).max(15).required().messages(lenguaje.messages),
});

exports.resetPassword = async (req, res, next) =>{
    // validacion de maximo y minimo de caracter
    const {usuario,password,id} = req.body;
    const { error } = validarlogin.validate({usuario,password})
    if(error){
        return res.status(200).json({
            res:0, 
            mensaje:error.details[0].message,            
        });
    }
    
    try {

          var sql = ` select u.*
                           , e.nombre as empresa
                           , e.descripcion as desc_empresa
                        from usuarios u
                           , empresa  e
                       where u.empresa_id     = e.id
                         and upper(u.usuario) = upper($1)`;                       
            var valor   = [usuario];
            const resul = await db.Open(sql,valor);
            if(resul.rows.length > 0){
                // hash contraseña
                const has           = await bcrypt.genSalt(10);
                const password_rest = await bcrypt.hash(password,has);
                var sql_reset = `UPDATE usuarios
                                    SET password = '${password_rest}'
                                  where usuario  = upper($1)`;
                let valor_reset  = [usuario];
                const resul_reset = await db.Open(sql_reset,valor_reset);
                if(resul_reset?.rowCount){
                    const token = jwt.sign({id:resul.rows[0].usuario}, process.env.JW_CLAVE,{expiresIn:'5h',});
                    let permisos   = await getPermisosMenu(resul.rows[0].usuario); 
                    let rows = { 
                        'usuario'     :resul.rows[0].usuario      ,
                        'nombre'      :resul.rows[0].nombre       ,
                        'apellido'    :resul.rows[0].apellido     ,
                        'empresa_id'  :resul.rows[0].empresa_id   ,
                        'empresa'     :resul.rows[0].empresa      ,
                        'desc_empresa':resul.rows[0].desc_empresa ,                        
                        'img'         :resul.rows[0].url_img      ,
                        'menu'        :permisos                   ,
                        'token'       :token                      ,
                        'hash'        :password_rest              ,
                        }
                    res.status(200).json({res:1, mensaje:"la contraseña se a restablecido!!", rows});
                }else{
                    res.status(200).json({res:0,mensaje:'Favor intente nuevamente mas tarde!'});
                }
            }else{
                res.status(200).json({res:0, mensaje:'EL usuario no existe en la base de datos!!'});
            }
    } catch (error) {
        log_error.error(`se produjo un error en la funcion de la resetPassword ${error}`);
        console.log(`se produjo un error en la funcion de la resetPassword ${error}`);
        next();
    }
}