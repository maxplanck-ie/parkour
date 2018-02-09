Ext.define('MainHub.view.usage.ChartPolarBase', {
  extend: 'Ext.chart.PolarChart',
  xtype: 'parkourpolar',

  border: 0,

  colors: [
    '#247BA0',
    '#70C1B3',
    '#B2DBBF',
    '#F3FFBD',
    '#FF1654'
  ],

  insetPadding: 40,
  innerPadding: 10,

  interactions: ['rotate', 'itemhighlight'],

  // legend: {
  //   docked: 'right'
  // },

  series: {
    type: 'pie',
    highlight: true,
    angleField: 'data',
    donut: 20,
    label: {
      field: 'name',
      display: 'outside',
      contrast: true,
      // font: '14px Open Sans',
      color: '#606060',
      calloutLine: {
        length: 50,
        width: 3
      }
    },
    tooltip: {
      trackMouse: true,
      renderer: function (toolTip, record, ctx) {
        toolTip.setHtml(record.get('name') + ': ' + record.get('data'));
      }
    }
  }
});
