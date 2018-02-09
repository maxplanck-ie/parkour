Ext.define('MainHub.view.usage.UsageController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.usage',

  config: {
    control: {
      '#': {
        activate: 'loadData'
      },
      'usagerecords': {}
    }
  },

  loadData: function (view) {
    var recordsChart = view.down('usagerecords');
    var organizationsChart = view.down('usageorganizations');
    var principalInvestigatorsChart = view.down('usageprincipalinvestigators');
    var libraryTypesChart = view.down('usagelibrarytypes');

    recordsChart.setLoading();
    recordsChart.down('polar').getStore().load({
      callback: function () {
        recordsChart.setLoading(false);
      }
    });

    organizationsChart.setLoading();
    organizationsChart.down('polar').getStore().load({
      callback: function () {
        organizationsChart.setLoading(false);
      }
    });

    principalInvestigatorsChart.setLoading();
    principalInvestigatorsChart.down('polar').getStore().load({
      callback: function () {
        principalInvestigatorsChart.setLoading(false);
      }
    });

    libraryTypesChart.setLoading();
    libraryTypesChart.down('polar').getStore().load({
      callback: function () {
        libraryTypesChart.setLoading(false);
      }
    });
  }
});
