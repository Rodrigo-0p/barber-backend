
const {log_error} = require("../utils/logger");
const db          = require("../conection/conn");

exports.getPermisosMenu = async (p_usuario) =>{  
  try {
     var sql = ` select m.codigo id_modulo
                      , m.descripcion desc_modulo
                      , s.codigo||'_'||s.id id_submodulo
                      , s.descripcion desc_submodulo
                      , f.nombre 	cod_form
                      , f.descripcion desc_form
                      , f.ruta
                      , coalesce(m.codigo,'')||'_'||coalesce(s.codigo,'')||'_'||coalesce(f.nombre,'') id_menu
                    from permiso_form p
                    JOIN 
                        usuarios u ON p.id_usuario = u.id
                    JOIN 
                        formularios f ON p.id_formulario = f.id
                    LEFT JOIN 
                        modulos m ON f.id_modulo = m.id
                    LEFT JOIN 
                        subModulos s ON f.id_submodulo = s.id
                    WHERE u.usuario = ($1)
                      and coalesce(f.habilitado,'N') = 'S'`;
                        
    // var sql = ` select m.codigo id_modulo,
    //                    s.codigo	id_submodulo,
    //                    m.descripcion desc_modulo,
    //                    s.descripcion desc_submodulo,
    //                    f.nombre 	cod_form,
    //                    f.descripcion desc_form,
    //                    f.ruta,
    //                    m.codigo||'-'||s.codigo ||'-'||f.nombre id_menu
    //               from usuarios u
    //                   , formularios f
    //                   , modulos m
    //                   , subModulos s
    //               where u.id = f.id_usuario
    //                 and f.id_modulo 	  = m.id 
    //                 and f.id_submodulo = s.id
    //                 and upper(u.usuario) = upper($1)`;
      var valor   = [p_usuario];
      const resul = await db.Open(sql,valor);
      return resul.rows;
  } catch (error) {
    log_error.error(error);
    console.log(error)
  }
}