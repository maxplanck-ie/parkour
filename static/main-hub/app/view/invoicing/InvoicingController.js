Ext.define('MainHub.view.invoicing.InvoicingController', {
  extend: 'MainHub.components.BaseGridController',
  alias: 'controller.invoicing',

  config: {
    control: {
      '#': {
        activate: 'activateView'
      },
      '#invoicing-grid': {
        resize: 'resize'
      }
    }
  }
});
