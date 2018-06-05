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
      '#download-button': {
        click: 'handleButtonClick'
      },
      '#upload-button': {
        click: 'handleButtonClick'
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

    Ext.Ajax.request({
      url: 'api/ena_exporter/get_galaxy_status/',
      timeout: 5000, // 5 seconds
      params: {
        galaxy_url: galaxyURL,
        galaxy_api_key: galaxyAPIKey
      },

      success: function (response) {
        var obj = Ext.decode(response.responseText);
        var status = obj.success ? 'online' : 'offline';
        var type = obj.success ? 'info' : 'error';

        new Noty({ text: 'Galaxy is ' + status, type: type }).show();
        wnd.getViewModel().setData({ galaxyStatus: status });
      },

      failure: function (response) {
        var error = response.statusText === 'communication failure'
          ? 'Timeout Exceeded.'
          : response.statusText;

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

  handleButtonClick: function (btn) {
    var wnd = btn.up('window');
    var requestId = wnd.request.get('pk');
    var samples = Ext.getStore('ENASamples').data.items;
    var data = wnd.down('form').getForm().getValues();
    var galaxyURL = data.galaxy_url;
    var galaxyAPIKey = data.galaxy_api_key;
    var action = btn.itemId.split('-')[0];
    var params = {
      samples: Ext.JSON.encode(Ext.Array.pluck(samples, 'data')),
      study_abstract: data.study_abstract,
      study_type: data.study_type
    };

    if (samples.length === 0) {
      new Noty({ text: 'No samples selected.', type: 'warning' }).show();
      return false;
    }

    if (action === 'download') {
      var form = Ext.create('Ext.form.Panel', { standardSubmit: true });
      form.submit({
        url: Ext.String.format('api/ena_exporter/{0}/download/', requestId),
        params: params
      });
    } else {
      if (galaxyURL === '' || galaxyAPIKey === '') {
        new Noty({
          text: 'Galaxy URL or Galaxy API Key is missing.',
          type: 'warning'
        }).show();
        return false;
      }

      params.galaxy_url = galaxyURL;
      params.galaxy_api_key = galaxyAPIKey;

      wnd.setLoading('Uploading...');
      Ext.Ajax.request({
        url: Ext.String.format('api/ena_exporter/{0}/{1}/', requestId, action),
        params: params,

        success: function (response) {
          var obj = Ext.decode(response.responseText);
          var status = obj.success ? 'online' : 'offline';

          if (obj.success) {
            new Noty({
              text: 'Files have been successfully uploaded!'
            }).show();
          } else {
            new Noty({
              type: 'error',
              text: obj.message
            }).show();
          }
          wnd.getViewModel().setData({ galaxyStatus: status });
          wnd.setLoading(false);
        },

        failure: function (response) {
          console.log('server-side failure with status code ' + response.status);
          wnd.setLoading(false);
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
