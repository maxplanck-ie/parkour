Ext.define('MainHub.store.enauploader.Samples', {
  extend: 'Ext.data.Store',
  storeId: 'ENASamples',

  requires: [
    'MainHub.model.enauploader.Sample'
  ],

  model: 'MainHub.model.enauploader.Sample',

  getId: function () {
    return 'ENASamples';
  }
});
