Ext.define('MainHub.view.enaexporter.ENAExporter', {
  extend: 'Ext.window.Window',

  requires: [
    'MainHub.view.enaexporter.ENAExporterController',
    'MainHub.view.enaexporter.ENAExporterModel',
    'MainHub.view.enaexporter.ENABaseGrid',
    'MainHub.view.enaexporter.Experiments',
    'MainHub.view.enaexporter.Samples',
    'MainHub.view.enaexporter.Studies',
    'MainHub.view.enaexporter.Runs'
  ],

  controller: 'enaexporter-enaexporter',
  viewModel: {
    type: 'enaexporter-enaexporter'
  },

  title: 'ENA Uploader',

  height: 725,
  width: 800,

  modal: true,
  resizable: false,
  maximizable: true,
  autoShow: true,

  border: 0,
  layout: 'fit',

  items: [{
    xtype: 'tabpanel',
    itemId: 'tabs',
    defaults: {
      styleHtmlContent: true,
      layout: 'fit'
    },
    items: [
      {
        title: 'General',
        itemId: 'general-tab',
        padding: 15,
        items: [{
          xtype: 'form',
          itemId: 'request-form',
          layout: 'anchor',
          border: 0,
          defaultType: 'textfield',
          defaults: {
            labelWidth: 100,
            readOnly: true,
            anchor: '100%'
          },
          items: [
            {
              name: 'name',
              fieldLabel: 'Request',
              emptyText: 'Request'
            },
            {
              name: 'description',
              xtype: 'textarea',
              fieldLabel: 'Description',
              emptyText: 'Description',
              height: 75
            },
            {
              xtype: 'container',
              html: '<hr />',
              margin: '5px 0 7px'
            },
            {
              name: 'galaxy_url',
              fieldLabel: 'Galaxy URL',
              emptyText: 'Galaxy URL',
              // vtype: 'url',
              readOnly: false
            },
            {
              name: 'galaxy_api_key',
              fieldLabel: 'Galaxy API Key',
              emptyText: 'Galaxy API Key',
              readOnly: false
            },
            {
              xtype: 'fieldcontainer',
              fieldLabel: 'Galaxy Status',
              layout: 'hbox',
              defaults: {
                xtype: 'container'
              },
              items: [
                {
                  margin: '5px 5px 0 0',
                  bind: {
                    html: '<div class="status galaxy-status-{galaxyStatus}"></div>'
                  }
                },
                {
                  margin: '5px 20px 0 0',
                  bind: {
                    html: '{galaxyStatus}'
                  }
                },
                {
                  xtype: 'button',
                  itemId: 'refresh-galaxy-status-button',
                  iconCls: 'fa fa-lg fa-refresh',
                  ui: 'header',
                  text: 'Refresh'
                }
              ]
            },
            {
              xtype: 'container',
              html: '<hr />',
              margin: '5px 0 7px'
            },
            {
              xtype: 'fieldcontainer',
              fieldLabel: 'Samples',
              items: [{
                xtype: 'grid',
                itemId: 'samples-grid',
                sortableColumns: false,
                enableColumnMove: false,
                enableColumnResize: false,
                enableColumnHide: false,
                viewConfig: {
                  stripeRows: false
                },
                height: 245,
                store: 'ENARecords',
                columns: {
                  items: [
                    {
                      xtype: 'checkcolumn',
                      itemId: 'check-column',
                      dataIndex: 'selected',
                      tdCls: 'no-dirty',
                      width: 40
                    },
                    {
                      text: 'Name',
                      dataIndex: 'library_name',
                      flex: 1
                    },
                    {
                      text: '',
                      dataIndex: 'record_type',
                      width: 35,
                      renderer: function (value, meta, record) {
                        return record.getRecordType().charAt(0);
                      }
                    },
                    {
                      text: 'Barcode',
                      dataIndex: 'barcode',
                      minWidth: 95,
                      flex: 1,
                      renderer: function (value, meta, record) {
                        return record.getBarcode();
                      }
                    }
                  ]
                },
                bbar: [
                  '->',
                  {
                    itemId: 'add-selected-button',
                    tooltip: 'Add selected items to Experiments/Samples',
                    text: 'Add to'
                  }
                ]
              }],
              getValue: function () {
                // return Ext.pluck(this.down('grid').getStore().data.items, 'id');
              }
            }
          ]
        }]
      },
      {
        title: 'Experiments',
        itemId: 'experiments-tab',
        items: [{
          xtype: 'ena-experiments',
          store: 'ENAExperiments'
        }]
      },
      {
        title: 'Samples',
        itemId: 'samples-tab',
        items: [{
          xtype: 'ena-samples',
          store: 'ENASamples'
        }]
      },
      {
        title: 'Studies',
        itemId: 'studies-tab',
        items: [{
          xtype: 'ena-studies',
          store: 'ENAStudies'
        }]
      },
      {
        title: 'Runs',
        itemId: 'runs-tab',
        items: [{
          xtype: 'ena-runs',
          store: 'ENARuns'
        }]
      }
    ]
  }],

  bbar: [
    {
      itemId: 'create-empty-record-button',
      tooltip: 'Create empty record',
      iconCls: 'fa fa-plus fa-lg',
      text: 'Create',
      bind: {
        hidden: '{createButtonHidden}'
      }
    },
    '->',
    {
      itemId: 'download-files-button',
      iconCls: 'fa fa-download fa-lg',
      text: 'Download Files'
    }
  ]
});
