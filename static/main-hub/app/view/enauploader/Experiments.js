Ext.define('MainHub.view.enauploader.Experiments', {
  extend: 'MainHub.view.enauploader.ENABaseGrid',
  alias: 'widget.ena-experiments',

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
        text: 'Name',
        dataIndex: 'name'
      },
      {
        text: 'Library Protocol',
        dataIndex: 'library_protocol'
      },
      {
        text: 'Library Type',
        dataIndex: 'library_type'
      },
      {
        text: 'Design Description',
        dataIndex: 'description'
      },
      {
        text: 'Library Layout',
        dataIndex: 'library_layout'
      },
      {
        text: 'Insert Size',
        dataIndex: 'mean_fragment_size'
      },
      {
        text: 'Sequencer',
        dataIndex: 'sequencer'
      },
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
        text: 'Study Alias',
        dataIndex: 'study_alias'
      },
      {
        text: 'Sample Alias',
        dataIndex: 'sample_alias'
      },
      {
        text: 'Source',
        dataIndex: 'library_source'
      },
      {
        text: 'Selection',
        dataIndex: 'library_selection'
      },
      {
        text: 'Platform',
        dataIndex: 'platform'
      }
    ]
  }
});
