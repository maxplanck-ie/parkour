Ext.define('MainHub.model.tables.libraries.LibraryType', {
    extend: 'MainHub.model.Base',

    fields: [
        {
            type: 'int',
            name: 'libraryTypeId'
        },
        {
            type: 'string',
            name: 'name'
        }
    ]
});
