Ext.define('MainHub.view.enaexporter.ENAExporterController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.enaexporter-enaexporter',

  config: {
    control: {
      '#': {
        boxready: 'loadSamples',
        beforeshow: 'setModelData'
      },
      '#tabs': {
        // tabchange: 'tabChange'
      },
      '#samples-grid': {
        headercontextmenu: 'showHeaderMenu'
      },
      '#refresh-galaxy-status-button': {
        click: 'refreshGalaxyStatus'
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
    wnd.down('form').getForm().setValues(wnd.request.data);
  },

  // tabChange: function (tp, newTab) {
  //   tp.up('window').getViewModel().setData({
  //     createButtonHidden: newTab.itemId === 'general-tab'
  //   });
  // },

  loadSamples: function (wnd) {
    var requestId = wnd.request.get('pk');

    Ext.getStore('ENASamples').reload({
      url: Ext.String.format('api/ena_exporter/{0}/', requestId)
    });
  },

  showHeaderMenu: function (ct, column, e) {
    var me = this;
    var store = Ext.getStore('ENASamples');
    var selectedSamples = this.getSelectedSamples(store);

    if (column.dataIndex !== 'selected') {
      return false;
    }

    var items = [
      {
        text: 'Select All',
        handler: function () {
          me.selectAll(true);
        }
      }, {
        text: 'Unselect All',
        handler: function () {
          me.selectAll(false);
        }
      }
    ];

    if (selectedSamples.length > 0) {
      items = items.concat([
        '-',
        {
          text: Ext.String.format('Delete Selected ({0})', selectedSamples.length),
          handler: function () {
            store.remove(selectedSamples);
          }
        }
      ]);
    }

    e.stopEvent();
    Ext.create('Ext.menu.Menu', {
      plain: true,
      defaults: {
        margin: 5
      },
      items: items
    }).showAt(e.getXY());
  },

  showContextMenu: function (gridView, record, itemEl, index, e) {
    var me = this;
    var dataIndex = MainHub.Utilities.getDataIndex(e, gridView);

    if (!dataIndex || dataIndex === 'selected') {
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
          text: 'Apply to All',
          handler: function () {
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
      url: 'api/ena_exporter/get_galaxy_status/',
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
    var store = Ext.getStore('ENASamples');
    result = result || false;

    store.each(function (item) {
      item.set('selected', result);
    });
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

  download: function (btn) {
    var wnd = btn.up('window');
    var requestId = wnd.request.get('pk');
    var samples = Ext.getStore('ENASamples').data.items;
    var data = wnd.down('form').getForm().getValues();

    if (samples.length === 0) {
      new Noty({ text: 'No samples selected.', type: 'warning' }).show();
      return false;
    }

    var form = Ext.create('Ext.form.Panel', { standardSubmit: true });
    form.submit({
      url: Ext.String.format('api/ena_exporter/{0}/download/', requestId),
      params: {
        samples: Ext.JSON.encode(Ext.Array.pluck(samples, 'data')),
        study_abstract: data.study_abstract,
        study_type: data.study_type
      }
    });
  },

  getSelectedSamples: function (store) {
    return store.data.items.filter(function (item) {
      return item.get('selected');
    });
  }
});
