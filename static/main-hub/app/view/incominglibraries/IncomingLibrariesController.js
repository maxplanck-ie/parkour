Ext.define('MainHub.view.incominglibraries.IncomingLibrariesController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.incominglibraries-incominglibraries',

  mixins: [
    'MainHub.mixins.grid.CheckboxesAndSearchInput',
    'MainHub.mixins.grid.Resize',
    'MainHub.mixins.store.SyncStore'
  ],

  config: {
    control: {
      '#': {
        activate: 'activateView'
      },
      '#incoming-libraries-grid': {
        resize: 'resize',
        itemcontextmenu: 'showMenu',
        groupcontextmenu: 'showGroupMenu',
        beforeedit: 'toggleEditors',
        edit: 'editRecord'
      },
      '#show-libraries-checkbox': {
        change: 'changeFilter'
      },
      '#show-samples-checkbox': {
        change: 'changeFilter'
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
    var store = view.down('grid').getStore();
    Ext.getStore(store.getId()).reload();
  },

  selectUnselectAll: function (grid, groupId, selected) {
    var store = grid.getStore();
    var dataIndex = grid.initialConfig.customConfig.groupIdDataIndex;
    store.each(function (item) {
      if (item.get(dataIndex) === groupId) {
        item.set('selected', selected);
      }
    });
  },

  showMenu: function (gridView, record, item, index, e) {
    var self = this;
    var qcMenuOptions = gridView.grid.initialConfig.customConfig.qualityCheckMenuOptions;
    var menuItems = [{
      text: 'Apply to All',
      margin: '5px 5px 2px 5px',
      handler: function () {
        var dataIndex = self.getDataIndex(e, gridView);
        self.applyToAll(record, dataIndex);
      }
    }];

    if (qcMenuOptions && qcMenuOptions.length > 0) {
      var qcMenu = {
        xtype: 'container',
        items: [
          {
            xtype: 'container',
            html: 'Quality Check',
            margin: '10px 5px 5px 5px',
            style: {
              color: '#000'
            }
          },
          {
            xtype: 'container',
            margin: 5,
            layout: {
              type: 'hbox',
              pack: 'center',
              align: 'middle'
            },
            defaults: {
              xtype: 'button',
              scale: 'medium',
              margin: '5px 10px 10px'
            },
            items: []
          }
        ]
      };

      if (qcMenuOptions.indexOf('passed') !== -1) {
        qcMenu.items[1].items.push({
          ui: 'menu-button-green',
          tooltip: 'passed',
          iconCls: 'fa fa-lg fa-check',
          handler: function () {
            self.qualityCheckSingle(record, 'passed');
            this.up('menu').hide();
          }
        });
      }

      if (qcMenuOptions.indexOf('compromised') !== -1) {
        qcMenu.items[1].items.push({
          ui: 'menu-button-yellow',
          tooltip: 'compromised',
          iconCls: 'fa fa-lg fa-exclamation-triangle',
          handler: function () {
            self.qualityCheckSingle(record, 'compromised');
            this.up('menu').hide();
          }
        });
      }

      if (qcMenuOptions.indexOf('failed') !== -1) {
        qcMenu.items[1].items.push({
          ui: 'menu-button-red',
          tooltip: 'failed',
          iconCls: 'fa fa-lg fa-times',
          handler: function () {
            self.qualityCheckSingle(record, 'failed');
            this.up('menu').hide();
          }
        });
      }

      menuItems.push('-');
      menuItems.push(qcMenu);
    }

    e.stopEvent();
    Ext.create('Ext.menu.Menu', {
      plain: true,
      items: menuItems
    }).showAt(e.getXY());
  },

  showGroupMenu: function (gridView, node, groupId, e) {
    var self = this;
    var grid = gridView.grid;
    var qcMenuOptions = gridView.grid.initialConfig.customConfig.qualityCheckMenuOptions;
    var menuItems = [
      {
        text: 'Select All',
        margin: '5px 5px 0 5px',
        handler: function () {
          self.selectUnselectAll(grid, parseInt(groupId), true);
        }
      },
      {
        text: 'Unselect All',
        margin: 5,
        handler: function () {
          self.selectUnselectAll(grid, parseInt(groupId), false);
        }
      }
    ];

    if (
      qcMenuOptions &&
      qcMenuOptions.length > 0 &&
      self._getSelectedRecords(grid, parseInt(groupId)).length > 0
    ) {
      var qcMenu = {
        xtype: 'container',
        items: [
          {
            xtype: 'container',
            html: 'Quality Check: Selected',
            margin: '10px 5px 5px 5px',
            style: {
              color: '#000'
            }
          },
          {
            xtype: 'container',
            margin: 5,
            layout: {
              type: 'hbox',
              pack: 'center',
              align: 'middle'
            },
            defaults: {
              xtype: 'button',
              scale: 'medium',
              margin: '5px 10px 10px'
            },
            items: []
          }
        ]
      };

      if (qcMenuOptions.indexOf('passed') !== -1) {
        qcMenu.items[1].items.push({
          ui: 'menu-button-green',
          tooltip: 'passed',
          iconCls: 'fa fa-lg fa-check',
          handler: function () {
            self.qualityCheckSelected(grid, parseInt(groupId), 'passed');
            this.up('menu').hide();
          }
        });
      }

      if (qcMenuOptions.indexOf('compromised') !== -1) {
        qcMenu.items[1].items.push({
          ui: 'menu-button-yellow',
          tooltip: 'compromised',
          iconCls: 'fa fa-lg fa-exclamation-triangle',
          handler: function () {
            self.qualityCheckSelected(grid, parseInt(groupId), 'compromised');
            this.up('menu').hide();
          }
        });
      }

      if (qcMenuOptions.indexOf('failed') !== -1) {
        qcMenu.items[1].items.push({
          ui: 'menu-button-red',
          tooltip: 'failed',
          iconCls: 'fa fa-lg fa-times',
          handler: function () {
            self.qualityCheckSelected(grid, parseInt(groupId), 'failed');
            this.up('menu').hide();
          }
        });
      }

      menuItems.push('-');
      menuItems.push(qcMenu);
    }

    e.stopEvent();
    Ext.create('Ext.menu.Menu', {
      plain: true,
      items: menuItems
    }).showAt(e.getXY());
  },

  toggleEditors: function (editor, context) {
    var record = context.record;
    var qPCRResultEditor = Ext.getCmp('qPCRResultEditor');
    var rnaQualityEditor = Ext.getCmp('rnaQualityIncomingEditor');
    var nucleicAcidTypesStore = Ext.getStore('nucleicAcidTypesStore');

    // Toggle qPCR Result and RNA Quality
    if (record.get('record_type') === 'Library') {
      qPCRResultEditor.enable();
      rnaQualityEditor.disable();
    } else {
      qPCRResultEditor.disable();

      var nat = nucleicAcidTypesStore.findRecord('id',
          record.get('nucleic_acid_type')
      );

      if (nat !== null && nat.get('type') === 'RNA') {
        rnaQualityEditor.enable();
      } else {
        rnaQualityEditor.disable();
      }
    }
  },

  editRecord: function (editor, context) {
    var store = editor.grid.getStore();
    var record = context.record;
    var changes = record.getChanges();
    var values = context.newValues;
    var reload = Object.keys(changes).indexOf('quality_check') !== -1;

    // Compute Amount
    if (
      Object.keys(changes).indexOf('amount_facility') === -1 &&
      values.dilution_factor &&
      values.concentration_facility &&
      values.sample_volume_facility
    ) {
      var amountFacility = parseFloat(values.dilution_factor) *
        parseFloat(values.concentration_facility) *
        parseFloat(values.sample_volume_facility);

      record.set('amount_facility', amountFacility);
    }

    // Send the changes to the server
    this.syncStore(store.getId(), reload);
  },

  applyToAll: function (record, dataIndex) {
    var store = record.store;
    var allowedColumns = [
      'dilution_factor',
      'concentration_facility',
      'concentration_method_facility',
      'sample_volume_facility',
      'amount_facility',
      'size_distribution_facility',
      'comments_facility',
      'qpcr_result_facility',
      'rna_quality_facility'
    ];
    var ngFormulaDataIndices = [
      'dilution_factor',
      'concentration_facility',
      'sample_volume_facility'
    ];

    if (typeof dataIndex !== 'undefined' && allowedColumns.indexOf(dataIndex) !== -1) {
      store.each(function (item) {
        if (item.get('request') === record.get('request') && item !== record) {
          item.set(dataIndex, record.get(dataIndex));

          // Calculate Amount (facility)
          if (ngFormulaDataIndices.indexOf(dataIndex) !== -1) {
            var dilutionFactor = item.get('dilution_factor');
            var concentrationFacility = item.get('concentration_facility');
            var sampleVolumeFacility = item.get('sample_volume_facility');
            if (dilutionFactor && concentrationFacility && sampleVolumeFacility) {
              var amountFacility = parseFloat(dilutionFactor) *
                parseFloat(concentrationFacility) *
                parseFloat(sampleVolumeFacility);
              item.set('amount_facility', amountFacility);
            }
          }
        }
      });

      // Send the changes to the server
      this.syncStore(store.getId());
    }
  },

  qualityCheckSelected: function (grid, groupId, result) {
    var store = grid.getStore();
    var dataIndex = grid.initialConfig.customConfig.groupIdDataIndex;

    store.each(function (item) {
      if (item.get(dataIndex) === groupId && item.get('selected')) {
        item.set('quality_check', result);
      }
    });

    this.syncStore(store.getId(), true);
  },

  qualityCheckSingle: function (record, result) {
    var store = record.store;
    record.set('quality_check', result);
    this.syncStore(store.getId(), true);
  },

  save: function (btn) {
    var store = btn.up('grid').getStore();
    this.syncStore(store.getId());
  },

  cancel: function (btn) {
    btn.up('grid').getStore().rejectChanges();
  },

  getDataIndex: function (e, view) {
    var xPos = e.getXY()[0];
    var columns = view.getGridColumns();
    var dataIndex;

    for (var column in columns) {
      var leftEdge = columns[column].getPosition()[0];
      var rightEdge = columns[column].getSize().width + leftEdge;

      if (xPos >= leftEdge && xPos <= rightEdge) {
        dataIndex = columns[column].dataIndex;
        break;
      }
    }

    return dataIndex;
  },

  _getSelectedRecords: function (grid, groupId) {
    var store = grid.getStore();
    var dataIndex = grid.initialConfig.customConfig.groupIdDataIndex;
    var records = [];

    store.each(function (item) {
      if (item.get(dataIndex) === groupId && item.get('selected')) {
        records.push(item);
      }
    });

    return records;
  }
});
