Ext.define('MainHub.view.enaexporter.ENAExporter', {
  extend: 'Ext.window.Window',

  requires: [
    'MainHub.view.enaexporter.ENAExporterController',
    'MainHub.view.enaexporter.ENAExporterModel',
    'MainHub.view.enaexporter.ENABaseGrid',
    'MainHub.view.enaexporter.Samples'
  ],

  controller: 'enaexporter-enaexporter',
  viewModel: {
    type: 'enaexporter-enaexporter'
  },

  title: 'ENA Uploader',

  height: 480,
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
          layout: 'anchor',
          border: 0,
          defaultType: 'textfield',
          defaults: {
            labelWidth: 100,
            anchor: '100%'
          },
          items: [
            {
              name: 'name',
              fieldLabel: 'Request',
              emptyText: 'Request',
              readOnly: true
            },
            {
              name: 'study_type',
              fieldLabel: 'Study Type',
              emptyText: 'Study Type',
              allowBlank: false
            },
            {
              name: 'study_abstract',
              xtype: 'textarea',
              fieldLabel: 'Study Abstract',
              emptyText: 'Study Abstract',
              allowBlank: false,
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
                  margin: '8px 5px 0 0',
                  bind: {
                    html: '<div class="status galaxy-status-{galaxyStatus}"></div>'
                  }
                },
                {
                  margin: '8px 20px 0 0',
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
            }
          ]
        }]
      },
      {
        title: 'Samples',
        itemId: 'samples-tab',
        items: [{
          xtype: 'ena-samples',
          itemId: 'samples-grid',
          store: 'ENASamples'
        }]
      }
    ]
  }],

  bbar: [
    '->',
    {
      itemId: 'download-files-button',
      iconCls: 'fa fa-download fa-lg',
      text: 'Download Files'
    }
  ]
});
