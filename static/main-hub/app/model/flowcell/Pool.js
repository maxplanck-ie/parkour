Ext.define('MainHub.model.flowcell.Pool', {
    extend: 'MainHub.model.Base',

    fields: [
        {  name: 'name',                        type: 'string'  },
        {  name: 'id',                          type: 'int'     },
        {  name: 'sequencingRunCondition',      type: 'int'     },
        {  name: 'sequencingRunConditionName',  type: 'string'  },
        {  name: 'size',                        type: 'int'     },
        {  name: 'lane',                        type: 'string'  },
        {  name: 'laneName',                    type: 'string'  }
    ]
});
