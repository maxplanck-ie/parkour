Ext.define('MainHub.view.statistics.RunStatisticsController', {
  extend: 'MainHub.components.BaseGridController',
  alias: 'controller.run-statistics',

  config: {
    control: {
      '#': {
        activate: 'activateView'
      },
      'parkourmonthpicker': {
        select: 'selectMonth'
      }
    }
  },

  activateView: function (view) {
    var monthPicker = view.down('parkourmonthpicker');
    monthPicker.fireEvent('select', monthPicker, monthPicker.getValue());
  },

  selectMonth: function (mp, value) {
    var grid = mp.up('grid');

    grid.getStore().reload({
      params: {
        year: value.getFullYear(),
        month: value.getMonth() + 1
      },
      callback: function () {
        grid.getView().features[0].collapseAll();
      }
    });
  }
});
