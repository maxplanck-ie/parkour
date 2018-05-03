Ext.define('MainHub.view.enauploader.Studies', {
  extend: 'MainHub.view.enauploader.ENABaseGrid',
  alias: 'widget.ena-studies',

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
        text: 'Study Type',
        dataIndex: 'study_type'
      },
      {
        text: 'Study Abstract',
        dataIndex: 'study_abstract'
      },
      {
        text: 'PubMed ID',
        dataIndex: 'pubmed_id'
      }
    ]
  }
});
