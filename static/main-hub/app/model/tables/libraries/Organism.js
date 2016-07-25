Ext.define('MainHub.model.tables.libraries.Organism', {
    extend: 'MainHub.model.Base',

    fields: [
        {
            type: 'int',
            name: 'organismId'
        },
        {
            type: 'string',
            name: 'name'
        }
    ]
});
