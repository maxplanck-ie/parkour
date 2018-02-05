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

    columns: {
      defaults: {
        minWidth: 150,
        flex: 1
      },
      items: [
        {
          xtype: 'checkcolumn',
          itemId: 'check-column',
          dataIndex: 'selected',
          resizable: false,
          menuDisabled: true,
          hideable: false,
          tdCls: 'no-dirty',
          minWidth: 35,
          width: 35,
          flex: 0
        },
        {
          text: 'Lane',
          dataIndex: 'name',
          menuDisabled: true,
          hideable: false
        },
        {
          text: 'Pool',
          dataIndex: 'pool_name',
          menuDisabled: true,
          hideable: false,
          renderer: function (value) {
            return Ext.String.format('<a href="javascript:void(0)" class="pool-name">{0}</a>', value);
          }
        },
        {
          text: 'Date',
          dataIndex: 'create_time',
          renderer: Ext.util.Format.dateRenderer()
        },
        {
          text: 'Length',
          tooltip: 'Read Length',
          dataIndex: 'read_length_name'
        },
        {
          text: 'Index I7',
          dataIndex: 'index_i7_show',
          renderer: 'yesNoRenderer'
        },
        {
          text: 'Index I5',
          dataIndex: 'index_i5_show',
          renderer: 'yesNoRenderer'
        },
        {
          text: 'Sequencer',
          dataIndex: 'sequencer_name'
        },
        {
          text: 'Equal nucl.',
          tooltip: 'Equal Representation of Nucleotides',
          dataIndex: 'equal_representation',
          renderer: 'yesNoRenderer'
        },
        {
          text: 'Loading Conc.',
          tooltip: 'Loading Concentration',
          dataIndex: 'loading_concentration',
          editor: {
            xtype: 'numberfield',
            decimalPrecision: 1,
            minValue: 0
          }
        },
        {
          text: 'PhiX %',
          dataIndex: 'phix',
          editor: {
            xtype: 'numberfield',
            decimalPrecision: 1,
            minValue: 0
          }
        }
      ]
    },

    features: [{
      ftype: 'grouping',
      startCollapsed: true,
      enableGroupingMenu: false,
      groupHeaderTpl: [
        '<strong>{children:this.getFlowcellId} ({children:this.getDate})</strong>',
        {
          getFlowcellId: function (children) {
            return children[0].get('flowcell_id');
          },
          getDate: function (children) {
            return Ext.util.Format.date(children[0].get('create_time'));
          }
        }
      ]
    }],

    dockedItems: [
      {
        xtype: 'toolbar',
        dock: 'top',
        items: [{
          xtype: 'combobox',
          itemId: 'years-combobox',
          fieldLabel: 'Select Year',
          store: 'FlowcellYears',
          queryMode: 'local',
          valueField: 'year',
          displayField: 'year',
          forceSelection: true,
          labelWidth: 80,
          width: 170
        }]
      },
      {
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
          {
            itemId: 'download-benchtop-protocol-button',
            text: 'Download Benchtop Protocol',
            iconCls: 'fa fa-file-excel-o fa-lg'
          },
          {
            itemId: 'download-sample-sheet-button',
            text: 'Download Sample Sheet',
            iconCls: 'fa fa-file-excel-o fa-lg'
          },
          '->',
          {
            itemId: 'cancel-button',
            iconCls: 'fa fa-ban fa-lg',
            text: 'Cancel'
          },
          {
            // xtype: 'button',
            itemId: 'save-button',
            iconCls: 'fa fa-floppy-o fa-lg',
            text: 'Save'
          }
        ]
      }
    ]
  }]
});
