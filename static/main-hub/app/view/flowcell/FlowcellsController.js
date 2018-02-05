Ext.define('MainHub.view.flowcell.FlowcellsController', {
  extend: 'MainHub.components.BaseGridController',
  alias: 'controller.flowcells',

  requires: [
    'MainHub.view.flowcell.FlowcellWindow',
    'MainHub.view.flowcell.PoolInfoWindow'
  ],

  mixins: [
    'MainHub.grid.SearchInputMixin'
  ],

  config: {
    control: {
      '#': {
        activate: 'activateView'
      },
      '#years-combobox': {
        select: 'selectYear'
      },
      '#flowcells-grid': {
        resize: 'resize',
        itemcontextmenu: 'showMenu',
        groupcontextmenu: 'showGroupMenu',
        cellclick: 'showPoolInfo',
        edit: 'editRecord'
      },
      '#check-column': {
        beforecheckchange: 'selectRecord'
      },
      '#load-button': {
        click: 'onLoadBtnClick'
      },
      '#download-benchtop-protocol-button': {
        click: 'downloadBenchtopProtocol'
      },
      '#download-sample-sheet-button': {
        click: 'downloadSampleSheet'
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

  activateView: function (view) {
    var grid = view.down('grid');
    var toolbar = grid.down('toolbar[dock="bottom"]');

    toolbar.insert(0, {
      type: 'button',
      itemId: 'download-benchtop-protocol-button',
      text: 'Download Benchtop Protocol',
      iconCls: 'fa fa-file-excel-o fa-lg'
    });

    toolbar.insert(1, {
      type: 'button',
      itemId: 'download-sample-sheet-button',
      text: 'Download Sample Sheet',
      iconCls: 'fa fa-file-excel-o fa-lg'
    });

    grid.addDocked({
      xtype: 'toolbar',
      dock: 'top',
      items: [{
        xtype: 'combobox',
        itemId: 'years-combobox',
        fieldLabel: 'Select Year',
        store: 'FlowcellYears',
        queryMode: 'local',
        valueField: 'year',
        displayField: 'year',
        forceSelection: true,
        labelWidth: 80,
        width: 170
      }]
    });

    var flowcellYearsCb = view.down('#years-combobox');
    flowcellYearsCb.getStore().reload({
      callback: function (items) {
        if (items && items.length > 0) {
          var lastItem = items[items.length - 1];
          flowcellYearsCb.select(lastItem);
          flowcellYearsCb.fireEvent('select', flowcellYearsCb, lastItem);
          flowcellYearsCb.cancelFocus();
        }
      }
    });
  },

  selectYear: function (cb, record) {
    var grid = cb.up('grid');

    grid.getStore().reload({
      params: {
        year: record.get('year')
      },
      callback: function () {
        grid.getView().features[0].collapseAll();
      }
    });
  },

  selectRecord: function (cb, rowIndex, checked, record) {
    // Don't select lanes from a different flowcell
    var selectedLane = record.store.findRecord('selected', true);
    if (selectedLane) {
      if (record.get('flowcell') !== selectedLane.get('flowcell')) {
        new Noty({
          text: 'You can only select lanes from the same flowcell.',
          type: 'warning'
        }).show();
        return false;
      }
    }
  },

  selectUnselectAll: function (grid, groupId, selected) {
    var store = grid.getStore();
    var selectedRecords = this._getSelectedRecords(store);

    if (selectedRecords.length > 0 && selectedRecords[0].flowcell !== groupId) {
      new Noty({
        text: 'You can only select lanes from the same flowcell.',
        type: 'warning'
      }).show();
      return false;
    }

    store.each(function (item) {
      if (item.get(store.groupField) === groupId) {
        item.set('selected', selected);
      }
    });
  },

  editRecord: function (editor, context) {
    var store = editor.grid.getStore();
    this.syncStore(store.getId());
  },

  applyToAll: function (gridView, record, dataIndex) {
    var store = gridView.grid.getStore();
    var allowedColumns = ['loading_concentration', 'phix'];

    if (dataIndex && allowedColumns.indexOf(dataIndex) !== -1) {
      store.each(function (item) {
        if (
          item.get(store.groupField) === record.get(store.groupField) &&
          item !== record
        ) {
          item.set(dataIndex, record.get(dataIndex));
        }
      });

      // Send the changes to the server
      this.syncStore(store.getId());
    } else {
      this._showEditableColumnsMessage(gridView, allowedColumns);
    }
  },

  onLoadBtnClick: function () {
    Ext.create('MainHub.view.flowcell.FlowcellWindow');
  },

  downloadBenchtopProtocol: function (btn) {
    var store = btn.up('grid').getStore();
    var selectedLanes = this._getSelectedRecords(store);

    if (selectedLanes.length === 0) {
      new Noty({
        text: 'You did not select any lanes.',
        type: 'warning'
      }).show();
      return;
    }

    var form = Ext.create('Ext.form.Panel', { standardSubmit: true });
    form.submit({
      url: 'api/flowcells/download_benchtop_protocol/',
      params: {
        'ids': Ext.JSON.encode(Ext.Array.pluck(selectedLanes, 'pk'))
      }
    });
  },

  downloadSampleSheet: function (btn) {
    var store = btn.up('grid').getStore();
    var selectedLanes = this._getSelectedRecords(store);

    if (selectedLanes.length === 0) {
      new Noty({
        text: 'You did not select any lanes.',
        type: 'warning'
      }).show();
      return;
    }

    var form = Ext.create('Ext.form.Panel', { standardSubmit: true });
    form.submit({
      url: 'api/flowcells/download_sample_sheet/',
      params: {
        'ids': Ext.JSON.encode(Ext.Array.pluck(selectedLanes, 'pk')),
        'flowcell_id': selectedLanes[0].flowcell
      }
    });
  },

  showPoolInfo: function (view, td, cellIndex, record, tr, rowIndex, e) {
    if (e.getTarget('.pool-name') !== null) {
      Ext.create('MainHub.view.flowcell.PoolInfoWindow', {
        title: record.get('pool_name'),
        pool: record.get('pool')
      });
    }
  },

  _getSelectedRecords: function (store) {
    var records = [];

    store.each(function (item) {
      if (item.get('selected')) {
        records.push({
          pk: item.get('pk'),
          flowcell: item.get('flowcell')
        });
      }
    });

    return records;
  }
});
