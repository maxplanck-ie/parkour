Ext.define('MainHub.view.statistics.Sequences', {
  extend: 'Ext.container.Container',
  xtype: 'sequences-statistics',

  requires: [
    'MainHub.components.BaseGrid',
    'MainHub.components.SearchField',
    'MainHub.view.statistics.SequencesController',
    'Ext.ux.DateRangePicker'
  ],

  controller: 'sequences-statistics',

  anchor: '100% -1',
  layout: 'fit',

  items: [{
    xtype: 'basegrid',
    store: 'SequencesStatistics',
    height: Ext.Element.getViewportHeight() - 64,

    header: {
      title: 'Sequences',
      items: [{
        xtype: 'parkoursearchfield',
        store: 'SequencesStatistics',
        emptyText: 'Search',
        // paramName: 'pool',
        width: 200
      }]
    },

    columns: {
      defaults: {
        minWidth: 135,
        flex: 1
      },
      items: [
        {
          text: 'Request',
          dataIndex: 'request',
          renderer: 'gridCellTooltipRenderer',
          filter: { type: 'string' }
        },
        {
          text: 'Barcode',
          dataIndex: 'barcode',
          filter: { type: 'string' }
        },
        {
          text: 'Name',
          dataIndex: 'name',
          renderer: 'gridCellTooltipRenderer',
          filter: { type: 'string' }
        },
        {
          text: 'Lane',
          dataIndex: 'lane',
          filter: { type: 'string' }
        },
        {
          text: 'Pool',
          dataIndex: 'pool',
          filter: { type: 'string' }
        },
        {
          text: 'Library Protocol',
          dataIndex: 'library_protocol',
          renderer: 'gridCellTooltipRenderer',
          filter: { type: 'string' }
        },
        {
          text: 'Library Type',
          dataIndex: 'library_type',
          renderer: 'gridCellTooltipRenderer',
          filter: { type: 'string' }
        },
        {
          text: 'Reads PF (M), requested',
          tooltip: 'Reads PF (M), requested',
          dataIndex: 'reads_pf_requested',
          filter: { type: 'number' }
        },
        {
          text: 'Reads PF (M), sequenced',
          tooltip: 'Reads PF (M), sequenced',
          dataIndex: 'reads_pf_sequenced',
          renderer: function (value) {
            if (value) {
              value = (value / 1000000).toFixed(1);
            }
            return value;
          },
          filter: { type: 'number' }
        },
        {
          text: 'confident off-species reads',
          tooltip: 'confident off-species reads',
          dataIndex: 'confident_reads',
          renderer: floatRenderer,
          filter: { type: 'number' }
        },
        {
          text: '% Optical Duplicates',
          tooltip: '% Optical Duplicates',
          dataIndex: 'optical_duplicates',
          renderer: floatRenderer,
          filter: { type: 'number' }
        },
        {
          text: '% dupped reads',
          tooltip: '% dupped reads',
          dataIndex: 'dupped_reads',
          renderer: floatRenderer,
          filter: { type: 'number' }
        },
        {
          text: '% mapped reads',
          tooltip: '% mapped reads',
          dataIndex: 'mapped_reads',
          renderer: floatRenderer,
          filter: { type: 'number' }
        },
        {
          text: 'Insert Size',
          dataIndex: 'insert_size',
          filter: { type: 'number' }
        }
      ]
    },

    plugins: [
      {
        ptype: 'bufferedrenderer',
        trailingBufferZone: 100,
        leadingBufferZone: 100
      },
      {
        ptype: 'gridfilters'
      }
    ],

    features: [{
      ftype: 'grouping',
      startCollapsed: true,
      enableGroupingMenu: false,
      groupHeaderTpl: [
        '<strong>{children:this.getFlowcellId} ' +
        '({children:this.getDate}, {children:this.getSequencer})</strong>',
        {
          getFlowcellId: function (children) {
            return children[0].get('flowcell_id');
          },
          getDate: function (children) {
            return Ext.util.Format.date(children[0].get('create_time'));
          },
          getSequencer: function (children) {
            return children[0].get('sequencer');
          }
        }
      ]
    }],

    dockedItems: [{
      xtype: 'toolbar',
      dock: 'top',
      items: [{
        xtype: 'daterangepicker',
        ui: 'header',
        drpDefaults: {
          showButtonTip: false,
          dateFormat: 'd.m.Y',
          mainBtnTextColor: '#999',
          mainBtnIconCls: 'x-fa fa-calendar',
          presetPeriodsBtnIconCls: 'x-fa fa-calendar-check-o',
          confirmBtnIconCls: 'x-fa fa-check'
        }
      }]
    }]
  }]
});

function floatRenderer (value) {
  if (value) {
    value = value.toFixed(2);
  }
  return value;
}
