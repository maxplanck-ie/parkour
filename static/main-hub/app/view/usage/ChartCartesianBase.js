Ext.define('MainHub.view.usage.ChartCartesianBase', {
  extend: 'Ext.chart.CartesianChart',
  xtype: 'parkourcartesian',

  border: 0,

  colors: [
    '#247BA0',
    '#70C1B3',
    '#B2DBBF',
    '#F3FFBD',
    '#FF1654'
  ],

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
