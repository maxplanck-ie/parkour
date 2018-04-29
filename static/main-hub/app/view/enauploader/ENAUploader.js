Ext.define('MainHub.view.enauploader.ENAUploader', {
  extend: 'Ext.window.Window',

  requires: [
    'MainHub.view.enauploader.ENAUploaderController',
    'MainHub.view.enauploader.ENAUploaderModel',
    'MainHub.view.enauploader.ENABaseGrid',
    'MainHub.view.enauploader.Experiments'
  ],

  controller: 'enauploader-enauploader',
  viewModel: {
    type: 'enauploader-enauploader'
  },

  title: 'ENA Uploader',

  height: 500,
  width: 650,

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
      styleHtmlContent: true
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
            labelWidth: 80,
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
                height: 195,
                store: 'ENASamples',
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
                      dataIndex: 'name',
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
                }
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
        bind: {
          disabled: '{tabsDisabled}'
        },
        items: [{
          xtype: 'ena-experiments'
        }]
      },
      {
        title: 'Runs',
        itemId: 'runs-tab',
        html: 'Runs Tab',
        bind: {
          disabled: '{tabsDisabled}'
        }
      },
      {
        title: 'Studies',
        itemId: 'studies-tab',
        html: 'Studies Tab',
        bind: {
          disabled: '{tabsDisabled}'
        }
      },
      {
        title: 'Samples',
        itemId: 'samples-tab',
        html: 'Samples Tab',
        bind: {
          disabled: '{tabsDisabled}'
        }
      }
    ]
  }],

  bbar: [
    '->',
    {
      xtype: 'button',
      itemId: 'download-files-button',
      iconCls: 'fa fa-download fa-lg',
      text: 'Download Files'
    }
  ]
});
