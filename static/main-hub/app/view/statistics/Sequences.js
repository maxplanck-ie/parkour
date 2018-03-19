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

  initComponent: function () {
    var me = this;

    this.items = [{
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
            filter: { type: 'number' }
          },
          {
            text: 'confident off-species reads',
            tooltip: 'confident off-species reads',
            dataIndex: 'confident_reads',
            filter: { type: 'number' }
          },
          {
            text: '% Optical Duplicates',
            tooltip: '% Optical Duplicates',
            dataIndex: 'optical_duplicates',
            // renderer: me.percentageRenderer,
            filter: { type: 'number' }
          },
          {
            text: '% dupped reads',
            tooltip: '% dupped reads',
            dataIndex: 'dupped_reads',
            // renderer: me.percentageRenderer,
            filter: { type: 'number' }
          },
          {
            text: '% mapped reads',
            tooltip: '% mapped reads',
            dataIndex: 'mapped_reads',
            // renderer: me.percentageRenderer,
            filter: { type: 'number' }
          },
          {
            text: 'Insert Size',
            dataIndex: 'insert_size',
            filter: { type: 'number' }
          }
        ]
      },

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
    }];

    this.callParent(arguments);
  },

  percentageRenderer: function (value) {
    return value ? value + '%' : value;
  }
});
