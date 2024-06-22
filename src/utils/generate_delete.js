
const _ = require('underscore');

const valorNull = (value, type) => {
  if (value === null || typeof value === 'undefined' || value.toString().trim() === '') {
    if (['number'].includes(type)) {
      return 'null';
    } else {
      return "''";
    }
  } else {
    if (['character','character varying'].includes(type)) {
      return `'${value.toString().replace(/'/g, "''")}'`;
    }
    if (['date'].includes(type)) {
      return `'${value}'`; // Ajusta el formato de la fecha según lo requiera PostgreSQL
    }
    if (['number'].includes(type)) {
      return value.toString().replace(',', '.');
    }
    if (_.contains(['DATE'], type)) {
      if (data.length == 10) {
        data = `to_date('${data}', 'YYYY-MM-DD')`;
      } else {
        data = `to_timestamp('${data}', 'YYYY-MM-DD HH24:MI:SS')`;
      }
    }
  }
  return value;
};
exports.generate_delete = async(table_name, data, info, column, key) => {
  let sql = '';
  let content = data;
  if(content?.length > 0){
    let pks = key; 
    sql += `BEGIN;\n`;
    for (let i = 0; i < content.length; i++) {
      // let vcolumn, vdatos;
      // vcolumn = await auditoriaColumnas( column );
      // vdatos = await auditoriaValores( content[i], column );
      sql += `delete from ${table_name}`;
      sql += `\n where `;      
      for (let j = 0; j < pks.length; j++) {
        let col = column.find( item => item.column_name == pks[j].column_name);
        let key = pks[j];
        let keyValue = {...key}; 
        if(j == 0) sql += `${pks[j].column_name} = ${ valorNull(content[i][keyValue.column_name], col.data_type) }`;
        else sql += `\n and ${pks[j].column_name} = ${ valorNull(content[i][keyValue.column_name], col.data_type) }`;  
      }  
      sql += `;\n`;
      // sql += `${info.paquete}.borrar_registro( '${info.cod_empresa}' , '${info.cod_usuario}' , '${info.direccion_ip}' , '${vdatos}', '${table_name}', '${info.modulo}', '${vcolumn}' );\n`;
    }
    sql += `COMMIT;`;
  }
  return sql;
}