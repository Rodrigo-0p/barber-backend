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
  }
  return value;
};
exports.generate_insert = async (table_name, data, opcion, tableColumn) => {
  let sql = '';
  let content = data.filter(item => item.inserted);
  let array_opcion = Object.keys(opcion);
  if (content.length > 0) {
    let columns = tableColumn;
    sql = "BEGIN;";
    for (let index = 0; index < content.length; index++) {
      const element = content[index];
      sql += `\nINSERT INTO ${table_name} (`;
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        if (i === 0) sql += `\n  ${column.column_name}`;
        else sql += `\n, ${column.column_name}`;
      }
      sql += `)\nVALUES (`;
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        if (_.contains(array_opcion, column.column_name)) {
          if (i === 0) sql += `\n  ${opcion[column.column_name]}`;
          else sql += `\n, ${opcion[column.column_name]}`;
        } else {
          if (i === 0) sql += `\n  ${valorNull(element[column.column_name], column.data_type)}`;
          else sql += `\n, ${valorNull(element[column.column_name], column.data_type)}`;
        }
      }
      sql += `);`;
    }
    sql += `\nCOMMIT;`;
  }
  return sql;
};
