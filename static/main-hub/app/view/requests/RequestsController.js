Ext.define('MainHub.view.requests.RequestsController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.requests',

  config: {
    control: {
      '#': {
        activate: 'activateView'
      },
      '#requests-grid': {
        resize: 'resize',
        boxready: 'boxready',
        itemcontextmenu: 'showMenu'
      },
      '#add-request-button': {
        click: 'addRequest'
      }
    }
  },

  activateView: function () {
    Ext.getStore('requestsStore').reload();
  },

  resize: function (el) {
    el.setHeight(Ext.Element.getViewportHeight() - 64);
  },

  boxready: function () {
    // Hide the User column for non-administrators
    if (!USER.is_staff) {
      Ext.getCmp('requests-grid').down('[dataIndex=user_full_name]').setVisible(false);
    }
  },

  addRequest: function (btn) {
    Ext.create('MainHub.view.requests.RequestWindow', {
      title: 'New Request',
      mode: 'add'
    }).show();
  },

  showMenu: function (grid, record, itemEl, index, e) {
    var me = this;

    var menuItems = [{
      text: 'View',
      handler: function () {
        Ext.create('MainHub.view.requests.RequestWindow', {
          title: record.get('name'),
          mode: 'edit',
          record: record
        }).show();
      }
    }];

    var deleteRequestOption = {
      text: 'Delete',
      handler: function () {
        Ext.Msg.show({
          title: 'Delete Request',
          message: Ext.String.format('Are you sure you want to delete the request "{0}"?', record.get('name')),
          buttons: Ext.Msg.YESNO,
          icon: Ext.Msg.QUESTION,
          fn: function (btn) {
            if (btn === 'yes') { me.deleteRequest(record); }
          }
        });
      }
    };

    var enaExporterOption = {
      text: 'ENA Exporter',
      handler: function () {
        Ext.create('MainHub.view.enaexporter.ENAExporter', {
          request: record
        });
      }
    };

    if (!USER.is_staff && !record.restrict_permissions) {
      menuItems.push(deleteRequestOption);
      menuItems.push(enaExporterOption);
    } else if (USER.is_staff) {
      menuItems.push(deleteRequestOption);
      menuItems.push(enaExporterOption);
      menuItems.push('-');
      menuItems.push({
        text: 'Compose Email',
        handler: function () {
          Ext.create('MainHub.view.requests.EmailWindow', {
            title: 'New Email',
            record: record
          });
        }
      });
    }

    e.stopEvent();
    Ext.create('Ext.menu.Menu', {
      plain: true,
      defaults: {
        margin: 5
      },
      items: menuItems
    }).showAt(e.getXY());
  },

  deleteRequest: function (record) {
    Ext.Ajax.request({
      url: Ext.String.format('api/requests/{0}/', record.get('pk')),
      method: 'DELETE',
      scope: this,

      success: function (response) {
        var obj = Ext.JSON.decode(response.responseText);

        if (obj.success) {
          Ext.getStore('requestsStore').reload();
          new Noty({ text: 'Request has been deleted!' }).show();
        } else {
          new Noty({ text: obj.message, type: 'error' }).show();
        }
      },

      failure: function (response) {
        new Noty({ text: response.statusText, type: 'error' }).show();
        console.error(response);
      }
    });
  }
});
