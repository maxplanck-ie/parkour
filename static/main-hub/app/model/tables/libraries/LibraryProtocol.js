Ext.define('MainHub.model.tables.libraries.LibraryProtocol', {
    extend: 'MainHub.model.Base',

    fields: [
        {
            type: 'int',
            name: 'libraryProtocolId'
        },
        {
            type: 'string',
            name: 'name'
        },
        {
            type: 'string',
            name: 'provider'
        }
    ]
});
