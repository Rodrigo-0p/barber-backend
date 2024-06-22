
module.exports = [
  {
    table: 'acerca_de',
    column: [ { column_name: 'id'         , data_type: 'integer'           },
              { column_name: 'titulo'     , data_type: 'character varying' },
              { column_name: 'subtitulo'  , data_type: 'character varying' },
              { column_name: 'descripcion', data_type: 'character varying' },
              { column_name: 'name_img'   , data_type: 'character varying' },
              { column_name: 'activo'     , data_type: 'character'         },
              { column_name: 'empresa_id' , data_type: 'integer'           }
            ],
    pk:[{ column_name: 'id', position: 1 }]
  }
]