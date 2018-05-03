Ext.define('MainHub.store.enauploader.Experiments', {
  extend: 'Ext.data.Store',
  storeId: 'ENAExperiments',

  requires: [
    'MainHub.model.enauploader.Experiment'
  ],

  model: 'MainHub.model.enauploader.Experiment',

  getId: function () {
    return 'ENAExperiments';
  }
});
