Ext.define('MainHub.store.enaexporter.Experiments', {
  extend: 'Ext.data.Store',
  storeId: 'ENAExperiments',

  requires: [
    'MainHub.model.enaexporter.Experiment'
  ],

  model: 'MainHub.model.enaexporter.Experiment',

  getId: function () {
    return 'ENAExperiments';
  }
});
