Ext.define('MainHub.view.flowcell.Flowcells', {
  extend: 'Ext.container.Container',
  xtype: 'flowcells',

  requires: [
    'MainHub.components.BaseGrid',
    'MainHub.view.flowcell.FlowcellsController'
  ],

  controller: 'flowcells',

  anchor: '100% -1',
  layout: 'fit',

  items: [{
    xtype: 'basegrid',
    id: 'flowcells-grid',
    itemId: 'flowcells-grid',
    store: 'Flowcells',

    header: {
      title: 'Load Flowcells',
      items: [
        {
          xtype: 'textfield',
          itemId: 'search-field',
          emptyText: 'Search',
          margin: '0 15px 0 0',
          width: 200
        },
        {
          xtype: 'button',
          itemId: 'load-button',
          text: 'Load'
        }
      ]
    },

    customConfig: {
      qualityCheckMenuOptions: ['completed']
    },

    columns: [
      {
        xtype: 'checkcolumn',
        itemId: 'check-column',
        dataIndex: 'selected',
        resizable: false,
        menuDisabled: true,
        hideable: false,
        tdCls: 'no-dirty',
        width: 35
      },
      {
        text: 'Lane',
        dataIndex: 'name',
        menuDisabled: true,
        hideable: false,
        flex: 1
      },
      {
        text: 'Pool',
        dataIndex: 'pool_name',
        menuDisabled: true,
        hideable: false,
        flex: 1
      },
      {
        text: 'Date',
        dataIndex: 'create_time',
        renderer: Ext.util.Format.dateRenderer('d.m.Y'),
        flex: 1
      },
      {
        text: 'Length',
        tooltip: 'Read Length',
        dataIndex: 'read_length_name',
        flex: 1
      },
      {
        text: 'Index I7',
        dataIndex: 'index_i7_show',
        renderer: 'yesNoRenderer',
        flex: 1
      },
      {
        text: 'Index I5',
        dataIndex: 'index_i5_show',
        renderer: 'yesNoRenderer',
        flex: 1
      },
      {
        text: 'Sequencer',
        dataIndex: 'sequencer_name',
        flex: 1
      },
      {
        text: 'Equal nucl.',
        tooltip: 'Equal Representation of Nucleotides',
        dataIndex: 'equal_representation',
        renderer: 'yesNoRenderer',
        flex: 1
      },
      {
        text: 'Loading Conc.',
        tooltip: 'Loading Concentration',
        dataIndex: 'loading_concentration',
        flex: 1,
        editor: {
          xtype: 'numberfield',
          decimalPrecision: 1,
          minValue: 0
        }
      },
      {
        text: 'PhiX %',
        dataIndex: 'phix',
        flex: 1,
        editor: {
          xtype: 'numberfield',
          decimalPrecision: 1,
          minValue: 0
        }
      }
    ],

    features: [{
      ftype: 'grouping',
      startCollapsed: true,
      enableGroupingMenu: false,
      groupHeaderTpl: [
        '<strong>Flowcell ID: {children:this.getFlowcellId}</strong>',
        {
          getFlowcellId: function (children) {
            return children[0].get('flowcell_id');
          }
        }
      ]
    }]
  }]
});
