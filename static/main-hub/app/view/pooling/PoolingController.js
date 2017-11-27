Ext.define('MainHub.view.pooling.PoolingController', {
  extend: 'MainHub.components.BaseGridController',
  alias: 'controller.pooling',

  mixins: [
    'MainHub.grid.SearchInputMixin'
  ],

  config: {
    control: {
      '#': {
        activate: 'activateView'
      },
      '#pooling-grid': {
        resize: 'resize',
        itemcontextmenu: 'showMenu',
        groupcontextmenu: 'showGroupMenu',
        boxready: 'addToolbarButtons',
        beforeEdit: 'toggleEditors',
        edit: 'editRecord'
      },
      '#check-column': {
        beforecheckchange: 'selectRecord'
      },
      '#download-benchtop-protocol-button': {
        click: 'downloadBenchtopProtocol'
      },
      '#download-pooling-template-button': {
        click: 'downloadPoolingTemplate'
      },
      '#search-field': {
        change: 'changeFilter'
      },
      '#cancel-button': {
        click: 'cancel'
      },
      '#save-button': {
        click: 'save'
      }
    }
  },

  addToolbarButtons: function (grid) {
    var toolbar = grid.down('toolbar[dock="bottom"]');

    toolbar.insert(0, {
      type: 'button',
      itemId: 'download-benchtop-protocol-button',
      text: 'Download Benchtop Protocol',
      iconCls: 'fa fa-file-excel-o fa-lg'
    });

    toolbar.insert(1, {
      type: 'button',
      itemId: 'download-pooling-template-button',
      text: 'Download Template QC Normalization and Pooling',
      iconCls: 'fa fa-file-excel-o fa-lg'
    });
  },

  toggleEditors: function (editor, context) {
    var record = context.record;
    if (
      record.get('record_type') === 'Sample' &&
      (record.get('status') === 2 || record.get('status') === -2)
    ) {
      return false;
    }
  },

  selectRecord: function (cb, rowIndex, checked, record) {
    // Don't select samples which aren't prepared yet
    if (!this._isPrepared(record)) {
      return false;
    }

    // Don't select records from a different pool
    var selectedRecord = record.store.findRecord('selected', true);
    if (selectedRecord) {
      if (record.get('pool') !== selectedRecord.get('pool')) {
        new Noty({
          text: 'You can only select libraries from the same pool.',
          type: 'warning'
        }).show();
        return false;
      }
    }
  },

  selectUnselectAll: function (grid, groupId, selected) {
    var self = this;
    var store = grid.getStore();
    var selectedRecords = this._getSelectedRecords(grid, groupId);

    if (selectedRecords.length > 0 && selectedRecords[0].pool !== groupId) {
      new Noty({
        text: 'You can only select libraries from the same pool.',
        type: 'warning'
      }).show();
      return false;
    }

    store.each(function (item) {
      if (item.get(store.groupField) === groupId && self._isPrepared(item)) {
        item.set('selected', selected);
      }
    });
  },

  editRecord: function (editor, context) {
    var store = editor.grid.getStore();
    var record = context.record;
    var changes = record.getChanges();
    var values = context.newValues;

      // Set Concentration C1
    if (
      Object.keys(changes).indexOf('concentration_c1') === -1 &&
      values.concentration > 0 &&
      values.mean_fragment_size > 0
    ) {
      var concentrationC1 = ((values.concentration /
        (values.mean_fragment_size * 650)) * Math.pow(10, 6)).toFixed(1);
      record.set('concentration_c1', concentrationC1);
    }

    // Send the changes to the server
    this.syncStore(store.getId());
  },

  applyToAll: function (gridView, record, dataIndex) {
    var self = this;
    var store = gridView.grid.getStore();
    var allowedColumns = ['concentration_c1'];

    if (dataIndex && allowedColumns.indexOf(dataIndex) !== -1) {
      store.each(function (item) {
        if (
          item.get(store.groupField) === record.get(store.groupField) &&
          item !== record && self._isPrepared(item)
        ) {
          item.set(dataIndex, record.get(dataIndex));
        }
      });

      // Send the changes to the server
      self.syncStore(store.getId());
    } else {
      self._showEditableColumnsMessage(gridView, allowedColumns);
    }
  },

  downloadBenchtopProtocol: function (btn) {
    var store = btn.up('grid').getStore();
    var selectedRecords = this._getSelectedRecordsByRecordType(store);
    var libraries = selectedRecords[0];
    var samples = selectedRecords[1];

    if (libraries.length === 0 && samples.length === 0) {
      new Noty({
        text: 'You did not select any libraries.',
        type: 'warning'
      }).show();
      return;
    }

    var poolId = store.findRecord('selected', true).get('pool');
    var form = Ext.create('Ext.form.Panel', { standardSubmit: true });

    form.submit({
      url: 'api/pooling/download_benchtop_protocol/',
      params: {
        pool_id: poolId,
        samples: Ext.JSON.encode(samples),
        libraries: Ext.JSON.encode(libraries)
      }
    });
  },

  downloadPoolingTemplate: function (btn) {
    var store = btn.up('grid').getStore();
    var selectedRecords = this._getSelectedRecordsByRecordType(store);
    var libraries = selectedRecords[0];
    var samples = selectedRecords[1];

    if (libraries.length === 0 && samples.length === 0) {
      new Noty({
        text: 'You did not select any libraries.',
        type: 'warning'
      }).show();
      return;
    }

    var form = Ext.create('Ext.form.Panel', { standardSubmit: true });
    form.submit({
      url: 'api/pooling/download_pooling_template/',
      params: {
        samples: Ext.JSON.encode(samples),
        libraries: Ext.JSON.encode(libraries)
      }
    });
  },

  _isPrepared: function (item) {
    return item.get('record_type') === 'Library' ||
      (item.get('record_type') === 'Sample' && item.get('status') === 3);
  },

  _getSelectedRecords: function (grid, groupId) {
    var store = grid.getStore();
    var records = [];

    store.each(function (item) {
      if (item.get('selected')) {
        records.push({
          pk: item.get('pk'),
          record_type: item.get('record_type'),
          pool: item.get('pool')
        });
      }
    });

    return records;
  },

  _getSelectedRecordsByRecordType: function (store) {
    var libraries = [];
    var samples = [];

    store.each(function (record) {
      if (record.get('selected')) {
        if (record.get('record_type') === 'Library') {
          libraries.push(record.get('pk'));
        } else {
          samples.push(record.get('pk'));
        }
      }
    });

    return [libraries, samples];
  }
});
