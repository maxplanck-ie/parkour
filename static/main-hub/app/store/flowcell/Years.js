Ext.define('MainHub.store.flowcell.Years', {
  extend: 'Ext.data.Store',
  storeId: 'FlowcellYears',

  proxy: {
    type: 'ajax',
    url: 'api/flowcells/years/',
    pageParam: false,   // to remove param "page"
    startParam: false,  // to remove param "start"
    limitParam: false,  // to remove param "limit"
    noCache: false      // to remove param "_dc",
  }
});
