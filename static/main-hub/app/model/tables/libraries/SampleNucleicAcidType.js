Ext.define('MainHub.model.tables.libraries.SampleNucleicAcidType', {
    extend: 'MainHub.model.Base',

    fields: [
        {
            type: 'int',
            name: 'id'
        },
        {
            type: 'string',
            name: 'name'
        },
        {
            type: 'string',
            name: 'type'
        }
    ]
});
