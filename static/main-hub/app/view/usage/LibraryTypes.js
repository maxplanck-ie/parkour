Ext.define('MainHub.view.usage.LibraryTypes', {
  extend: 'MainHub.view.usage.ChartBase',
  xtype: 'librarytypes',

  requires: [
    'MainHub.view.usage.ChartPolarBase'
  ],

  title: 'Library Types',

  items: [{
    xtype: 'parkourpolar',

    store: {
      fields: ['name', 'data'],
      data: [
        {
          name: 'mRNA',
          data: 300
        },
        {
          name: 'ChiP',
          data: 500
        },
        {
          name: 'Amplikon',
          data: 22
        },
        {
          name: 'Single Cell',
          data: 200
        }
      ]
    }
  }]
});
