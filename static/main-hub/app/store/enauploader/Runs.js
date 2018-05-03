Ext.define('MainHub.store.enauploader.Runs', {
  extend: 'Ext.data.Store',
  storeId: 'ENARuns',

  requires: [
    'MainHub.model.enauploader.Run'
  ],

  model: 'MainHub.model.enauploader.Run',

  getId: function () {
    return 'ENARuns';
  }
});
