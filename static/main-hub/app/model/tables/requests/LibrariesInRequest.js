Ext.define('MainHub.model.tables.requests.LibrariesInRequest', {
    extend: 'MainHub.model.Base',

    fields: [
        {  name: 'name',        type: 'string'  },
        {  name: 'recordType',  type: 'string'  },
        {  name: 'libraryId',   type: 'int'     },
        {  name: 'sampleId',    type: 'int'     }
    ]
});
