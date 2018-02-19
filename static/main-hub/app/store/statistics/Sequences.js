Ext.define('MainHub.store.statistics.Sequences', {
  extend: 'Ext.data.Store',
  storeId: 'SequencesStatistics',

  requires: [
    'MainHub.model.statistics.Sequences'
  ],

  model: 'MainHub.model.statistics.Sequences',

  // groupField: 'flowcell_id',
  // groupDir: 'ASC',

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
      fast_qc_r1: 'link',
      fast_qc_r2: 'link',
      sequencer: 'NextSeq HIGH',
      flowcell: '180115_NB501361_0232_AHF7KVBGX5',
      lane: '1, 2, 3, 4',
      pool: 'Pool 254',
      library_protocol: 'Other-DNA ',
      library_type: 'Other',
      confident_reads: 0.5,
      contamination_report: 'link',
      percentage_optical_duplicates: 0.57
    },
    {
      request: 'Project_270_Gilsbach_B03_Hein',
      barcode: '18L004172',
      name: 'ATAC_EC_1_R2',
      fast_qc_r1: 'link',
      fast_qc_r2: 'link',
      sequencer: 'NextSeq HIGH',
      flowcell: '180115_NB501361_0232_AHF7KVBGX5',
      lane: '1, 2, 3, 4',
      pool: 'Pool 254',
      library_protocol: 'Other-DNA ',
      library_type: 'Other',
      confident_reads: 0.53,
      contamination_report: 'link',
      percentage_optical_duplicates: 0.56
    }
  ],

  getId: function () {
    return 'SequencesStatistics';
  }
});
