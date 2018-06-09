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

  title: 'ENA Exporter',

  height: 525,
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
            anchor: '100%',
            labelWidth: 100,
            allowBlank: false
          },
          items: [
            {
              name: 'name',
              fieldLabel: 'Request',
              emptyText: 'Request',
              readOnly: true
            },
            {
              name: 'study_title',
              fieldLabel: 'Title',
              emptyText: 'Title of the study as would be used in a publication'
            },
            {
              xtype: 'combobox',
              name: 'study_type',
              fieldLabel: 'Type',
              emptyText: 'Select Study Type',
              queryMode: 'local',
              displayField: 'name',
              valueField: 'name',
              store: 'ENAStudyTypes',
              forceSelection: true,
              listConfig: {
                getInnerTpl: function () {
                  return '<span data-qtip="{description}">{name}</span>';
                }
              }
            },
            {
              name: 'study_abstract',
              xtype: 'textarea',
              fieldLabel: 'Abstract',
              emptyText: 'Briefly describe the goals, purpose, and scope of the study',
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
