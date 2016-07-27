Ext.define('MainHub.model.tables.libraries.Library', {
    extend: 'MainHub.model.Base',

    fields: [
        {name: 'id', type: 'int'},
        {name: 'libraryName', type: 'string'},
        {name: 'date', type: 'string'},
        {name: 'libraryProtocol', type: 'string'},
        {name: 'libraryType', type: 'string'},
        {name: 'enrichmentCycles', type: 'int'},
        {name: 'organism', type: 'string'},
        {name: 'indexType', type: 'string'},
        {name: 'indexReads', type: 'int'},
        {name: 'indexI7', type: 'string'},
        {name: 'indexI5', type: 'string'},
        {name: 'equalRepresentation', type: 'string'},
        {name: 'DNADissolvedIn', type: 'string'},
        {name: 'concentration', type: 'string'},
        {name: 'concentrationMethod', type: 'string'},
        {name: 'sampleVolume', type: 'string'},
        {name: 'qPCRResult', type: 'string'},
        {name: 'sequencingRunCondition', type: 'string'},
        {name: 'sequencingDepth', type: 'string'},
        {name: 'comments', type: 'string'}
    ]
});
