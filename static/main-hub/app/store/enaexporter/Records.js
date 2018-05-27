Ext.define('MainHub.store.enaexporter.Records', {
  extend: 'Ext.data.Store',
  storeId: 'ENARecords',

  requires: [
    'MainHub.model.Record'
  ],

  model: 'MainHub.model.Record',

  proxy: {
    type: 'ajax',
    pageParam: false,  // to remove param "page"
    startParam: false, // to remove param "start"
    limitParam: false, // to remove param "limit"
    noCache: false     // to remove param "_dc"
  },

  getId: function () {
    return 'ENARecords';
  }
});
