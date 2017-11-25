Ext.define('MainHub.mixins.store.SyncStore', {
  syncStore: function (storeId, reload) {
    var reload = reload || false;
    Ext.getStore(storeId).sync({
      success: function (batch) {
        var response = batch.operations[0].getResponse();
        var obj = Ext.JSON.decode(response.responseText);

        if (reload) {
          Ext.getStore(storeId).reload();
        }

        if (obj.hasOwnProperty('message') && obj.message !== '') {
          new Noty({ text: obj.message, type: 'warning' }).show();
        } else {
          new Noty({ text: 'The changes have been saved.' }).show();
        }
      },

      failure: function (batch) {
        var error = batch.operations[0].getError();
        console.error(error);

        try {
          var obj = Ext.JSON.decode(error.response.responseText);
          if (!obj.success && obj.message && obj.message !== '') {
            error = obj.message;
          }
        } catch (e) {
          error = error.statusText;
        }

        new Noty({ text: error, type: 'error' }).show();
      }
    });
  }
});
