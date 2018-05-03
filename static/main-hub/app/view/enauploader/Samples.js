Ext.define('MainHub.view.enauploader.Samples', {
  extend: 'MainHub.view.enauploader.ENABaseGrid',
  alias: 'widget.ena-samples',

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
        text: 'Title',
        dataIndex: 'title'
      },
      {
        text: 'Scientific Name',
        dataIndex: 'scientific_name'
      },
      {
        text: 'Taxon ID',
        dataIndex: 'taxon_id'
      },
      {
        text: 'Sample Description',
        dataIndex: 'sample_description'
      }
    ]
  }
});
