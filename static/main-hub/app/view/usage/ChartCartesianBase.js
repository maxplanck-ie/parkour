Ext.define('MainHub.view.usage.ChartCartesianBase', {
  extend: 'Ext.chart.CartesianChart',
  xtype: 'parkourcartesian',

  border: 0,

  // theme: 'sky',

  colors: [
    '#5DA5DA',
    '#FAA43A',
    '#60BD68',
    '#F17CB0',
    '#B2912F',
    '#B276B2',
    '#DECF3F',
    '#F15854',
    '#4D4D4D'
  ],

  // colors: [
  //   '#8dd3c7',
  //   '#ffffb3',
  //   '#bebada',
  //   '#fb8072',
  //   '#80b1d3',
  //   '#fdb462',
  //   '#b3de69',
  //   '#fccde5',
  //   '#d9d9d9',
  //   '#bc80bd',
  //   '#ccebc5',
  //   '#ffed6f'
  // ],

  insetPadding: {
    top: 40,
    left: 40,
    right: 40,
    bottom: 30
  },

  axes: [
    {
      type: 'category',
      position: 'bottom',
      fields: ['name'],
      label: {
        rotate: {
          degrees: -45
        }
      },
      style: {
        strokeStyle: '#ccc'
      }
    },
    {
      type: 'numeric',
      position: 'left',
      grid: true,
      fields: ['data'],
      minimum: 0,
      hidden: true,
      style: {
        strokeStyle: '#ccc'
      }
    }
  ],

  series: [{
    type: 'bar',
    xField: 'name',
    yField: ['libraries', 'samples'],
    stacked: true,
    tooltip: {
      trackMouse: true,
      renderer: function (toolTip, record, ctx) {
        var name = ctx.field.charAt(0).toUpperCase() + ctx.field.slice(1);
        toolTip.setHtml(name + ': ' + record.get(ctx.field));
      }
    }
  }]
});
