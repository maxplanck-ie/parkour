Ext.define('MainHub.store.enaexporter.Runs', {
  extend: 'Ext.data.Store',
  storeId: 'ENARuns',

  requires: [
    'MainHub.model.enaexporter.Run'
  ],

  model: 'MainHub.model.enaexporter.Run',

  getId: function () {
    return 'ENARuns';
  }
});
