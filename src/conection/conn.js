const { Pool }    = require('pg');
const {log_error} = require('../utils/logger');
require('dotenv').config();


// Configuración de la conexión a la base de datos
const pool = new Pool({
  user    : process.env.DB_USER    ,
  host    : process.env.DB_HOST    ,
  database: process.env.DB_NAME    ,
  password: process.env.DB_PASSWORD,
  port    : process.env.DB_PORT    ,
  // tiempo de espera para la conexion
  connectionTimeoutMillis:0,
  // tiempo de espera para la conexion
  connectionTimeoutMillis:0,
  // número de milisegundos que un cliente debe permanecer inactivo en el grupo y no ser retirado
  // antes de que se desconecte del backend y se descarte
  // el valor predeterminado es 10000 (10 segundos): se establece en 0 para deshabilitar la desconexión automática de los clientes inactivos
  idleTimeoutMillis:100000,    
  // número máximo de clientes que debe contener el grupo
  // de forma predeterminada, se establece en 10.
  // max:10
});

const Open = async (sql,values,res,next = false)=>{
  let client;
  try {
    // Intentar abrir la conexión
    client = await pool.connect();
    // Ejecuta query
    let result = await client.query(sql, values);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    res?.status(200).json({res:0, mensaje:error.message});
    if(next)next();
    client.query('ROLLBACK')    
    console.error('Error al abrir la conexión:', error.message);
    log_error.error(`Open: ${error}`)
  } finally {    
    // Liberar la conexión al pool, independientemente de si hubo un error o no
    if (client) {
      client.release();
    }
  }
}

module.exports = {Open}