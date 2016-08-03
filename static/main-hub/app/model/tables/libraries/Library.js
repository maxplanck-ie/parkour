Ext.define('MainHub.model.tables.libraries.Library', {
    extend: 'MainHub.model.Base',

    fields: [
        {name: 'id', type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'recordType', type: 'string'},
        {name: 'date', type: 'string'},
        {name: 'libraryProtocol', type: 'string'},
        {name: 'libraryProtocolId', type: 'int'},
        {name: 'libraryType', type: 'string'},
        {name: 'libraryTypeId', type: 'int'},
        {name: 'enrichmentCycles', type: 'int'},
        {name: 'organism', type: 'string'},
        {name: 'organismId', type: 'int'},
        {name: 'indexType', type: 'string'},
        {name: 'indexTypeId', type: 'int'},
        {name: 'indexReads', type: 'int'},
        {name: 'indexI7', type: 'string'},
        {name: 'indexI5', type: 'string'},
        {name: 'equalRepresentation', type: 'string'},
        {name: 'DNADissolvedIn', type: 'string'},
        {name: 'concentration', type: 'float'},
        {name: 'concentrationMethod', type: 'string'},
        {name: 'concentrationMethodId', type: 'int'},
        {name: 'sampleVolume', type: 'int'},
        {name: 'meanFragmentSize', type: 'int'},
        {name: 'qPCRResult', type: 'float'},
        {name: 'sequencingRunCondition', type: 'string'},
        {name: 'sequencingRunConditionId', type: 'int'},
        {name: 'sequencingDepth', type: 'int'},
        {name: 'comments', type: 'string'}
    ]
});
