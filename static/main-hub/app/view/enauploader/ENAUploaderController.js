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
      '#add-selected-button': {
        click: 'showAddMenu'
      },
      '#refresh-galaxy-status-button': {
        click: 'refreshGalaxyStatus'
      },
      'enabasegrid': {
        itemcontextmenu: 'showContextMenu'
      },
      '#create-empty-record-button': {
        click: 'createEmptyRecord'
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
    tp.up('window').getViewModel().setData({
      createButtonHidden: newTab.itemId === 'general-tab'
    });
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
      defaults: {
        margin: 5
      },
      items: [
        {
          text: 'Apply to All',
          handler: function () {
            var dataIndex = MainHub.Utilities.getDataIndex(e, gridView);
            me.applyToAll(gridView, record, dataIndex);
          }
        },
        {
          text: 'Delete',
          handler: function () {
            record.store.remove(record);
          }
        }
      ]
    }).showAt(e.getXY());
  },

  showAddMenu: function (btn, e) {
    var me = this;

    e.stopEvent();
    Ext.create('Ext.menu.Menu', {
      plain: true,
      defaults: {
        margin: 5
      },
      items: [
        {
          text: 'Experiments',
          handler: function () {
            me.addTo('experiments');
          }
        },
        {
          text: 'Samples',
          handler: function () {
            me.addTo('samples');
          }
        }
      ]
    }).showAt(e.getXY());
  },

  addTo: function (type) {
    var selectedSamples = this.getSelectedSamples(Ext.getStore('ENARecords'));
    var store = type === 'experiments'
      ? Ext.getStore('ENAExperiments')
      : Ext.getStore('ENASamples');
    var Model = store.getModel();

    if (selectedSamples.length === 0) {
      new Noty({
        text: 'You did not select any samples.',
        type: 'warning'
      }).show();
      return false;
    }

    var barcodes = store.data.items.reduce(function (filtered, item) {
      var barcode = item.get('barcode');
      if (barcode) filtered.push(barcode);
      return filtered;
    }, []);

    selectedSamples.forEach(function (item) {
      if (barcodes.indexOf(item.get('barcode')) === -1) {
        var clone = Ext.Object.merge({}, item.data);
        delete clone.id;
        store.add(new Model(clone));
      }
    });
  },

  refreshGalaxyStatus: function (btn) {
    var wnd = btn.up('window');
    var form = wnd.down('form').getForm();
    var data = form.getValues();
    var galaxyURL = data.galaxy_url;
    var galaxyAPIKey = data.galaxy_api_key;

    if (galaxyURL === '' || galaxyAPIKey === '') {
      new Noty({
        text: 'Galaxy URL or Galaxy API Key is missing.',
        type: 'warning'
      }).show();
      return false;
    }

    $.ajax({
      dataType: 'json',
      url: 'api/ena_uploader/get_galaxy_status/',
      timeout: 5000,  // 5 seconds
      data: {
        galaxy_url: galaxyURL,
        galaxy_api_key: galaxyAPIKey
      },
      success: function (obj) {
        var status = obj.success ? 'online' : 'offline';
        var type = obj.success ? 'info' : 'warning';

        new Noty({ text: 'Galaxy is ' + status, type: type }).show();
        wnd.getViewModel().setData({ galaxyStatus: status });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        var error;

        if (textStatus === 'timeout') {
          error = 'Timeout Exceeded.';
        } else {
          error = errorThrown || textStatus;
        }

        new Noty({ text: error, type: 'error' }).show();
      }
    });
  },

  selectAll: function (result) {
    var store = Ext.getStore('ENARecords');
    result = result || false;

    store.each(function (item) {
      item.set('selected', result);
    });
  },

  applyToAll: function (gridView, record, dataIndex) {
    var store = Ext.getStore('ENARecords');

    if (dataIndex) {
      store.each(function (item) {
        if (item !== record) {
          item.set(dataIndex, record.get(dataIndex));
        }
      });
    }
  },

  createEmptyRecord: function (btn) {
    var tab = btn.up('window').down('#tabs').getActiveTab();
    var store = tab.down('grid').getStore();
    store.add({});
  },

  download: function (btn) {
    var requestId = btn.up('window').request.get('pk');
    var experiments = Ext.getStore('ENAExperiments').data.items;
    var samples = Ext.getStore('ENASamples').data.items;
    var studies = Ext.getStore('ENAStudies').data.items;
    var runs = Ext.getStore('ENARuns').data.items;

    // TODO: validate records in all grids

    var form = Ext.create('Ext.form.Panel', { standardSubmit: true });
    form.submit({
      url: Ext.String.format('api/ena_uploader/{0}/download/', requestId),
      params: {
        experiments: Ext.JSON.encode(Ext.Array.pluck(experiments, 'data')),
        samples: Ext.JSON.encode(Ext.Array.pluck(samples, 'data')),
        studies: Ext.JSON.encode(Ext.Array.pluck(studies, 'data')),
        runs: Ext.JSON.encode(Ext.Array.pluck(runs, 'data'))
      }
    });
  },

  getSelectedSamples: function (store) {
    return store.data.items.filter(function (item) {
      return item.get('selected');
    });
  }
});
