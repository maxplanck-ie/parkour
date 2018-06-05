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
              itemId: 'galaxy-url-input',
              fieldLabel: 'Galaxy URL',
              emptyText: 'Galaxy URL',
              enableKeyEvents: true,
              regex: new RegExp(/^(https?:\/\/.*):?(\d*)\/?(.*)$/),
              regexText: 'Enter a valid Galaxy URL with a protocol.'
            },
            {
              name: 'galaxy_api_key',
              itemId: 'galaxy-api-key-input',
              fieldLabel: 'Galaxy API Key',
              emptyText: 'Galaxy API Key',
              enableKeyEvents: true
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
      itemId: 'download-button',
      iconCls: 'fa fa-download fa-lg',
      text: 'Download'
    },
    {
      itemId: 'upload-button',
      iconCls: 'fa fa-upload fa-lg',
      text: 'Upload to Galaxy'
    }
  ]
});
