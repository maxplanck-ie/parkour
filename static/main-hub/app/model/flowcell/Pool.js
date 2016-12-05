Ext.define('MainHub.model.flowcell.Pool', {
    extend: 'MainHub.model.Base',

    fields: [
        {  name: 'name',    type: 'string'  },
        {  name: 'id',      type: 'int'     },
        {  name: 'size',    type: 'int'     },
        {  name: 'lane',    type: 'string'  }
    ]
});
