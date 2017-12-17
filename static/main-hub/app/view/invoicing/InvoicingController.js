Ext.define('MainHub.view.invoicing.InvoicingController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.invoicing',

  config: {
    control: {
      '#': {
        activate: 'activateView'
      },
      '#billing-period-combobox': {
        select: 'selectBillingPeriod'
      },
      '#invoicing-grid': {
        resize: 'resize'
      },
      '#fixed-costs-grid,#preparation-costs-grid,#sequencing-costs-grid': {
        edit: 'editPrice'
      }
    }
  },

  activateView: function (view) {
    var billingPeriodCb = view.down('#billing-period-combobox');
    billingPeriodCb.getStore().reload({
      callback: function (records) {
        if (records.length > 0) {
          var lastRecord = records[records.length - 1];
          billingPeriodCb.select(lastRecord);
          billingPeriodCb.fireEvent('select', billingPeriodCb, lastRecord);
          billingPeriodCb.cancelFocus();
        }
      }
    });

    // Load cost stores
    view.down('#fixed-costs-grid').getStore().reload();
    view.down('#preparation-costs-grid').getStore().reload();
    view.down('#sequencing-costs-grid').getStore().reload();
  },

  resize: function (el) {
    el.setHeight(Ext.Element.getViewportHeight() - 64);
  },

  selectBillingPeriod: function (cb, record) {
    Ext.getStore('Invoicing').reload({
      params: {
        year: record.get('value')[0],
        month: record.get('value')[1]
      }
    });
  },

  editPrice: function (editor, context) {
    var store = editor.grid.getStore();
    var proxy = store.getProxy();

    proxy.api.update = Ext.String.format('{0}{1}/',
      proxy.api.read, context.record.get('id')
    );

    store.sync({
      success: function (batch) {
        Ext.getCmp('invoicing-grid').getStore().reload();
        new Noty({ text: 'The changes have been saved.' }).show();
      }
    });
  },

  gridCellTooltipRenderer: function (value, meta) {
    meta.tdAttr = Ext.String.format('data-qtip="{0}"', value);
    return value;
  },

  listRenderer: function (value, meta) {
    meta.tdAttr = Ext.String.format('data-qtip="{0}"', value.join('<br/>'));
    return value.join('; ');
  },

  sequencerRenderer: function (value, meta) {
    var items = value.map(function (item) {
      return Ext.String.format('{0}: {1}',
        item.flowcell_id, item.sequencer_name
      );
    });
    meta.tdAttr = Ext.String.format('data-qtip="{0}"', items.join('<br/>'));
    return Ext.Array.pluck(value, 'sequencer_name').join('; ');
  },

  percentageRenderer: function (value, meta) {
    var tpl = new Ext.XTemplate(
      '<ul>',
        '<tpl for=".">',
          '<li>{flowcell_id}',
            '<ul>',
              '<tpl for="pools">',
                '<li>{name}: {percentage}</li>',
              '</tpl>',
            '</ul>',
          '</li>',
        '</tpl>',
      '</ul>'
    );
    meta.tdAttr = Ext.String.format('data-qtip="{0}"', tpl.apply(value));

    return Ext.Array.pluck(value, 'pools').map(function (item) {
      return Ext.Array.pluck(item, 'percentage').join(', ');
    }).join('; ');
  },

  readLengthRenderer: function (value, meta) {
    var store = Ext.getStore('readLengthsStore');
    var items = value.map(function (id) {
      var record = store.findRecord('id', id, 0, false, true, true);
      return record.get('name');
    });
    return items.join(', ');
  },

  libraryProtocolRenderer: function (value, meta) {
    var store = Ext.getStore('libraryProtocolsStore');
    var record = store.findRecord('id', value, 0, false, true, true);
    return record ? record.get('name') : value;
  }
});
