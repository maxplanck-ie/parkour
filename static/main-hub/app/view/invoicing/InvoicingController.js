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
        var lastRecord = records[records.length - 1];
        billingPeriodCb.select(lastRecord);
        billingPeriodCb.fireEvent('select', billingPeriodCb, lastRecord);
        billingPeriodCb.cancelFocus();
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
  }
});
