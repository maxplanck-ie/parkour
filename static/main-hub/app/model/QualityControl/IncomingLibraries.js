Ext.define('MainHub.model.QualityControl.IncomingLibraries', {
    extend: 'MainHub.model.Base',

    fields: [
        {  name: 'libraryId', 	 type: 'int' 	 },
        {  name: 'sampleId',  	 type: 'int' 	 },
        {  name: 'name',		 type: 'string'  },
        {  name: 'recordType',	 type: 'string'  },
        {  name: 'dateFacility', type: 'string'  },
    ]
});
