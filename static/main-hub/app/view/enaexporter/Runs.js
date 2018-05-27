Ext.define('MainHub.view.enaexporter.Runs', {
  extend: 'MainHub.view.enaexporter.ENABaseGrid',
  alias: 'widget.ena-runs',

  border: 0,

  columns: {
    defaults: {
      minWidth: 150,
      flex: 1,
      editor: {
        xtype: 'textfield'
      }
    },
    items: [
      {
        text: 'Alias',
        dataIndex: 'alias'
      },
      {
        text: 'Status',
        dataIndex: 'status'
      },
      {
        text: 'Experiment Alias',
        dataIndex: 'experiment_alias'
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
