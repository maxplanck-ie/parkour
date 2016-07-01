Ext.define('MainHub.model.tables.researchers.PrincipalInvestigator', {
    extend: 'MainHub.model.Base',

    fields: [
        {
            type: 'int',
            name: 'piId'
        },
        {
            type: 'string',
            name: 'name'
        }
    ]
});
