Ext.define('MainHub.store.enauploader.ENASamples', {
  extend: 'Ext.data.Store',
  storeId: 'ENASamples',

  requires: [
    'MainHub.model.enauploader.ENASamples'
  ],

  model: 'MainHub.model.enauploader.ENASamples',

  proxy: {
    type: 'ajax',
    pageParam: false,   // to remove param "page"
    startParam: false,  // to remove param "start"
    limitParam: false,  // to remove param "limit"
    noCache: false      // to remove param "_dc"
  },

  getId: function () {
    return 'ENASamples';
  }
});
