Ext.define('MainHub.store.enauploader.Studies', {
  extend: 'Ext.data.Store',
  storeId: 'ENAStudies',

  requires: [
    'MainHub.model.enauploader.Study'
  ],

  model: 'MainHub.model.enauploader.Study',

  getId: function () {
    return 'ENAStudies';
  }
});
