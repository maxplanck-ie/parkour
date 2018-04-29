Ext.define('MainHub.view.enauploader.ENAUploaderController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.enauploader-enauploader',

  config: {
    control: {
      '#': {
        beforeshow: 'setModelData'
      },
      '#tabs': {
        tabchange: 'tabChange'
      },
      '#samples-grid': {
        boxready: 'loadSamples'
      },
      '#check-column': {
        checkchange: 'checkSample'
      },
      '#download-files-button': {
        click: 'download'
      }
    }
  },

  setModelData: function (wnd) {
    wnd.down('#request-form').getForm().setValues(wnd.request.data);
  },

  tabChange: function (tp, newTab) {
    if (newTab.itemId === 'general-tab') {
      Ext.getStore('ENASamples').clearFilter();
    } else {
      Ext.getStore('ENASamples').filterBy(function (item) {
        return item.get('selected');
      });
    }
  },

  loadSamples: function (grid) {
    var requestId = grid.up('window').request.get('pk');

    grid.setLoading();
    grid.getStore().reload({
      url: Ext.String.format('api/ena_uploader/{0}/', requestId),
      callback: function () {
        grid.setLoading(false);
      }
    });
  },

  checkSample: function (checkColumn, rowIndex, checked, record) {
    var windowModel = checkColumn.up('window').getViewModel();
    var selectedSamples = this.getSelectedSamples(record.store);

    windowModel.setData({
      tabsDisabled: selectedSamples.length === 0
    });
  },

  download: function (btn) {
    var requestId = btn.up('window').request.get('pk');
    var selectedSamples = this.getSelectedSamples(Ext.getStore('ENASamples'));

    if (selectedSamples.length === 0) {
      new Noty({
        text: 'You did not select any samples.',
        type: 'warning'
      }).show();
      return false;
    }

    var form = Ext.create('Ext.form.Panel', { standardSubmit: true });
    form.submit({
      url: Ext.String.format('api/ena_uploader/{0}/download/', requestId),
      params: {
        data: Ext.JSON.encode(Ext.Array.pluck(selectedSamples, 'data'))
      }
    });
  },

  getSelectedSamples: function (store) {
    return store.data.items.filter(function (item) {
      return item.get('selected');
    });
  }
});
