Ext.define('MainHub.model.researchers.PrincipalInvestigator', {
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
