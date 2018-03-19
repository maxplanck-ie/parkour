Ext.define('MainHub.store.statistics.Sequences', {
  extend: 'Ext.data.Store',
  storeId: 'SequencesStatistics',

  requires: [
    'MainHub.model.statistics.Sequences'
  ],

  model: 'MainHub.model.statistics.Sequences',

  // groupField: 'request',
  // groupDir: 'DESC',

  // proxy: {
  //   type: 'ajax',
  //   url: 'api/run_statistics/',
  //   pageParam: false,   // to remove param "page"
  //   startParam: false,  // to remove param "start"
  //   limitParam: false,  // to remove param "limit"
  //   noCache: false     // to remove param "_dc",
  // },

  data: [
    {
      request: 'Project_270_Gilsbach_B03_Hein',
      barcode: '18L004171',
      name: 'ATAC_EC_1_R1',
      lane: '1, 2, 3, 4',
      pool: 'Pool 254',
      library_protocol: 'Other-DNA ',
      library_type: 'Other',
      reads_pf_requested: null,
      reads_pf_sequenced: null,
      confident_reads: 0.5,
      optical_duplicates: 0.57,
      dupped_reads: null,
      mapped_reads: null,
      insert_size: null
    },
    {
      request: 'Project_270_Gilsbach_B03_Hein',
      barcode: '18L004172',
      name: 'ATAC_EC_1_R2',
      lane: '1, 2, 3, 4',
      pool: 'Pool 254',
      library_protocol: 'Other-DNA ',
      library_type: 'Other',
      reads_pf_requested: null,
      reads_pf_sequenced: null,
      confident_reads: 0.53,
      optical_duplicates: 0.56,
      dupped_reads: null,
      mapped_reads: null,
      insert_size: null
    }
  ],

  getId: function () {
    return 'SequencesStatistics';
  }
});
