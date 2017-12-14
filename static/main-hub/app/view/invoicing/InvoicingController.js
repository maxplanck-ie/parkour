Ext.define('MainHub.view.invoicing.InvoicingController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.invoicing',

  config: {
    control: {
      '#': {
        activate: 'activateView'
      },
      '#invoicing-grid': {
        resize: 'resize'
      },
      '#fixed-costs-grid,#preparation-costs-grid,#sequencing-costs-grid': {
        edit: 'edit'
      }
    }
  },

  activateView: function (view) {
    var store = view.down('#invoicing-grid').getStore();
    Ext.getStore(store.getId()).reload();

    // Load cost stores
    view.down('#fixed-costs-grid').getStore().reload();
    view.down('#preparation-costs-grid').getStore().reload();
    view.down('#sequencing-costs-grid').getStore().reload();
  },

  resize: function (el) {
    el.setHeight(Ext.Element.getViewportHeight() - 64);
  },

  edit: function (editor, context) {
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
