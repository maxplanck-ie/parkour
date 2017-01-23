Ext.define('MainHub.model.librarypreparation.LibraryPreparation', {
    extend: 'MainHub.model.Base',

    fields: [{
            name: 'name',
            type: 'string'
        },
        {
            name: 'active',
            type: 'bool'
        },
        {
            name: 'sampleId',
            type: 'int'
        },
        {
            name: 'barcode',
            type: 'string'
        },
        {
            name: 'libraryProtocolName',
            type: 'string'
        },
        {
            name: 'libraryProtocol',
            type: 'int'
        },
        {
            name: 'concentrationSample',
            type: 'float'
        },
        {
            name: 'startingAmount',
            type: 'string'
        },
        {
            name: 'startingVolume',
            type: 'string'
        },
        {
            name: 'spikeInDescription',
            type: 'string'
        },
        {
            name: 'spikeInVolume',
            type: 'string'
        },
        {
            name: 'ulSample',
            type: 'string'
        },
        {
            name: 'ulBuffer',
            type: 'string'
        },
        {
            name: 'indexI7Id',
            type: 'string'
        },
        {
            name: 'indexI5Id',
            type: 'string'
        },
        {
            name: 'pcrCycles',
            type: 'string'
        },
        {
            name: 'concentrationLibrary',
            type: 'string'
        },
        {
            name: 'meanFragmentSize',
            type: 'string'
        },
        {
            name: 'nM',
            type: 'string'
        },
        {
            name: 'file',
            type: 'string'
        }
    ]
});
