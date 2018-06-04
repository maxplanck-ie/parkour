Ext.define('MainHub.view.enaexporter.Samples', {
  extend: 'MainHub.view.enaexporter.ENABaseGrid',
  alias: 'widget.ena-samples',

  border: 0,

  columns: {
    defaults: {
      minWidth: 150,
      flex: 1,
      editor: {
        xtype: 'textfield',
        allowBlank: false
      }
    },
    items: [
      {
        xtype: 'checkcolumn',
        itemId: 'check-column',
        dataIndex: 'selected',
        tdCls: 'no-dirty',
        editor: null,
        minWidth: 40,
        width: 40
      },
      // Experiments
      {
        text: 'Library Name',
        dataIndex: 'library_name'
      },
      {
        text: 'Library Strategy',
        dataIndex: 'library_strategy'
      },
      {
        text: 'Design Description',
        dataIndex: 'design_description'
      },
      {
        text: 'Library Source',
        dataIndex: 'library_source'
      },
      {
        text: 'Library Selection',
        dataIndex: 'library_selection'
      },
      {
        text: 'Library Layout',
        dataIndex: 'library_layout'
      },
      {
        text: 'Insert Size',
        dataIndex: 'insert_size',
        editor: {
          xtype: 'numberfield',
          minValue: 0
        }
      },
      {
        text: 'Library Construction Protocol',
        tooltip: 'Library Construction Protocol',
        dataIndex: 'library_construction_protocol'
      },
      {
        text: 'Platform',
        dataIndex: 'platform'
      },
      {
        text: 'Instrument Model',
        dataIndex: 'instrument_model'
      },
      // Samples
      {
        text: 'Scientific Name',
        dataIndex: 'scientific_name'
      },
      {
        text: 'Taxon ID',
        dataIndex: 'taxon_id',
        editor: {
          xtype: 'numberfield',
          minValue: 0
        }
      },
      {
        text: 'Sample Description',
        dataIndex: 'sample_description'
      },
      {
        text: 'File Name',
        dataIndex: 'file_name'
      },
      {
        text: 'File Format',
        dataIndex: 'file_format'
      }
    ]
  }
});
