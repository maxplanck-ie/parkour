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
        boxready: 'loadSamples',
        headercontextmenu: 'showHeaderMenu'
      },
      '#check-column': {
        checkchange: 'checkSample'
      },
      'enabasegrid': {
        itemcontextmenu: 'showContextMenu'
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

  showHeaderMenu: function (ct, column, e) {
    var me = this;

    if (column.dataIndex !== 'selected') {
      return false;
    }

    e.stopEvent();
    Ext.create('Ext.menu.Menu', {
      plain: true,
      defaults: {
        margin: 5
      },
      items: [
        {
          text: 'Select All',
          handler: function () {
            me.selectAll(true);
          }
        },
        '-',
        {
          text: 'Unselect All',
          handler: function () {
            me.selectAll(false);
          }
        }
      ]
    }).showAt(e.getXY());
  },

  showContextMenu: function (gridView, record, itemEl, index, e) {
    var me = this;

    e.stopEvent();
    Ext.create('Ext.menu.Menu', {
      plain: true,
      items: [{
        text: 'Apply to All',
        margin: 5,
        handler: function () {
          var dataIndex = MainHub.Utilities.getDataIndex(e, gridView);
          me.applyToAll(gridView, record, dataIndex);
        }
      }]
    }).showAt(e.getXY());
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

  selectAll: function (result) {
    var store = Ext.getStore('ENASamples');
    result = result || false;

    store.each(function (item) {
      item.set('selected', result);
    });

    if (store.getCount() > 0) {
      this.getView().getViewModel().setData({
        tabsDisabled: !result
      });
    }
  },

  applyToAll: function (gridView, record, dataIndex) {
    var store = Ext.getStore('ENASamples');

    if (dataIndex) {
      store.each(function (item) {
        if (item !== record) {
          item.set(dataIndex, record.get(dataIndex));
        }
      });
    }
  },

  getSelectedSamples: function (store) {
    return store.data.items.filter(function (item) {
      return item.get('selected');
    });
  }
});
