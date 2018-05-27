Ext.define('MainHub.store.enaexporter.Samples', {
  extend: 'Ext.data.Store',
  storeId: 'ENASamples',

  requires: [
    'MainHub.model.enaexporter.Sample'
  ],

  model: 'MainHub.model.enaexporter.Sample',

  getId: function () {
    return 'ENASamples';
  }
});
