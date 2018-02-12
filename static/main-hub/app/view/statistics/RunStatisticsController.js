Ext.define('MainHub.view.statistics.RunStatisticsController', {
  extend: 'MainHub.components.BaseGridController',
  alias: 'controller.run-statistics',

  config: {
    control: {
      '#': {
        activate: 'activateView'
      }
    }
  }
});
