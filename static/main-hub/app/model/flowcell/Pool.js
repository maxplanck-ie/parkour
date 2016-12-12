Ext.define('MainHub.model.flowcell.Pool', {
    extend: 'MainHub.model.Base',

    fields: [
        {  name: 'name',            type: 'string'  },
        {  name: 'id',              type: 'int'     },
        {  name: 'readLength',      type: 'int'     },
        {  name: 'readLengthName',  type: 'string'  },
        {  name: 'size',            type: 'int'     }
    ]
});
