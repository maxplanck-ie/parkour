Ext.define('MainHub.view.enauploader.ENAUploader', {
  extend: 'Ext.window.Window',

  requires: [
    'MainHub.view.enauploader.ENAUploaderController',
    'MainHub.view.enauploader.ENAUploaderModel',
    'MainHub.view.enauploader.ENABaseGrid',
    'MainHub.view.enauploader.Experiments',
    'MainHub.view.enauploader.Samples',
    'MainHub.view.enauploader.Studies',
    'MainHub.view.enauploader.Runs'
  ],

  controller: 'enauploader-enauploader',
  viewModel: {
    type: 'enauploader-enauploader'
  },

  title: 'ENA Uploader',

  height: 550,
  width: 700,

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
