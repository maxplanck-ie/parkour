Ext.define('MainHub.view.statistics.Sequences', {
  extend: 'Ext.container.Container',
  xtype: 'sequences-statistics',

  requires: [
    'MainHub.components.BaseGrid',
    'MainHub.components.SearchField',
    'MainHub.view.statistics.SequencesController'
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
            text: 'Fast QC R1',
            dataIndex: 'fast_qc_r1',
            renderer: me.linkRenderer
          },
          {
            text: 'Fast QC R2',
            dataIndex: 'fast_qc_r2',
            renderer: me.linkRenderer
          },
          {
            text: 'Sequencer',
            dataIndex: 'sequencer',
            filter: { type: 'string' }
          },
          {
            text: 'Flowcell',
            dataIndex: 'flowcell',
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
            text: 'Confident off-species Reads',
            tooltip: 'Confident off-species Reads',
            dataIndex: 'confident_reads',
            filter: { type: 'number' }
          },
          {
            text: 'Contamination Report',
            tooltip: 'Contamination Report',
            dataIndex: 'contamination_report',
            renderer: me.linkRenderer
          },
          {
            text: '% Read Pairs Unique',
            tooltip: '% Read Pairs Unique',
            dataIndex: 'percentage_read_pairs_unique',
            // renderer: me.percentageRenderer,
            filter: { type: 'number' }
          },
          {
            text: '% Read Pairs Not Optical Duplicates',
            tooltip: '% Read Pairs Not Optical Duplicates',
            dataIndex: 'percentage_read_pairs_duplicates',
            // renderer: me.percentageRenderer,
            filter: { type: 'number' }
          },
          {
            text: '% Optical Duplicates',
            tooltip: '% Optical Duplicates',
            dataIndex: 'percentage_optical_duplicates',
            // renderer: me.percentageRenderer,
            filter: { type: 'number' }
          },
          {
            text: '% Uniquely Mapped',
            tooltip: '% Uniquely Mapped',
            dataIndex: 'percentage_uniquely_mapped',
            // renderer: me.percentageRenderer,
            filter: { type: 'number' }
          },
          {
            text: '% Mapped to Multiple',
            tooltip: '% Mapped to Multiple',
            dataIndex: 'percentage_multiple_mapped',
            // renderer: me.percentageRenderer,
            filter: { type: 'number' }
          },
          {
            text: 'Unmapped',
            dataIndex: 'unmapped',
            filter: { type: 'number' }
          },
          {
            text: 'Insert Size',
            dataIndex: 'insert_size',
            filter: { type: 'number' }
          },
          {
            text: 'FRiP Score',
            dataIndex: 'frip_score',
            filter: { type: 'number' }
          }
        ]
      },

      dockedItems: []
    }];

    this.callParent(arguments);
  },

  linkRenderer: function (value) {
    return Ext.String.format('<a href="{0}" target="_blank">link</a>', value);
  },

  percentageRenderer: function (value) {
    if (value) {
      value += '%';
    }
    return value;
  }
});
