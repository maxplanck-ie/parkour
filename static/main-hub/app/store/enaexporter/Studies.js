Ext.define('MainHub.store.enaexporter.Studies', {
  extend: 'Ext.data.Store',
  storeId: 'ENAStudies',

  requires: [
    'MainHub.model.enaexporter.Study'
  ],

  model: 'MainHub.model.enaexporter.Study',

  getId: function () {
    return 'ENAStudies';
  }
});
