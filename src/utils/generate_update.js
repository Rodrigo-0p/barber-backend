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
const comparar = async (data, aux, columns) => {
  let content = {};
  try {
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      if (data[column.column_name] != aux[column.column_name]) {
        content = { ...content, [column.column_name]: data[column.column_name] };
      }
    }
    if (Object.keys(content).length == 0) return []; else return [content];
  } catch (error) {
    console.log(error);
  }
}
exports.generate_update = async (table_name, data, auxData, auxKey = [], opcion = {}, tableColumn, tablePrimaryKey) => {
  let sql = '';
  let content = data.filter(item => item.updated);
  let array_opcion = Object.keys(opcion);
  if (content.length > 0) {
    let columns = tableColumn;
    let pks = tablePrimaryKey;
    let XRows = [];
    for (let index = 0; index < content.length; index++) {
      const element = content[index];
      let aux = auxData.filter(item => {
        return item.id == element.id
      });
      let datos_modificados = await comparar(element, aux[0], columns);
      if (datos_modificados.length > 0) XRows = [...XRows, element];
    }
    if (XRows.length > 0) sql += `BEGIN; \n`;
    for (let index = 0; index < XRows.length; index++) {
      sql += `update ${table_name}`;
      sql += `\n   set `;
      const element = XRows[index];
      let aux = auxData.filter(item => item.id == element.id);
      let datos_modificados = await comparar(element, aux[0], columns);
      let keys = Object.keys(datos_modificados[0]);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const type = columns.find(item => item.column_name == key);
        if (_.contains(array_opcion, key)) {
          if (i == 0) sql += `${key} = ${opcion[key]} `;
          else sql += `\n     , ${key} = ${opcion[key]} `;
        } else {
          if (i == 0) sql += `${key} = ${valorNull(element[key], type.data_type)} `;
          else sql += `\n     , ${key} = ${valorNull(element[key], type.data_type)} `;
        }
      }
      sql += `\n where `;

      for (let i = 0; i < pks.length; i++) {
        let key = pks[i];
        let keyValue = { ...key };
        const type = columns.find(item => item.column_name == key.column_name);
        if (_.contains(Object.keys(auxKey), keyValue.column_name)) {
          keyValue.column_name = auxKey[keyValue.column_name];
        }
        if (_.contains(array_opcion, key.column_name)) {
          if (i == 0) sql += `${key.column_name} = ${opcion[key.column_name]} `;
          else sql += `\n   and ${key.column_name} = ${opcion[key.column_name]} `;
        } else {
          if (i == 0) sql += `${key.column_name} = ${valorNull(element[keyValue.column_name], type.data_type)} `;
          else sql += `\n   and ${key.column_name} = ${valorNull(element[keyValue.column_name], type.data_type)} `;
        }
      }
      sql += `;\n`;
    }
    if (XRows.length > 0) sql += `COMMIT;`;
  }
  return sql;
}
