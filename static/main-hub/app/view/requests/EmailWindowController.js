Ext.define('MainHub.view.requests.EmailWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.requests-emailwindow',
    requires: [],

    config: {
        control: {
            '#sendEmail': {
                click: 'send'
            }
        }
    },

    send: function(btn) {
        var wnd = btn.up('window');
        var form = wnd.down('#email-form').getForm();

        if (form.isValid()) {
            var params = $.merge({
                request_id: wnd.record.get('requestId')
            }, form.getFieldValues());

            form.submit({
                url: 'request/send_email/',
                params: params,
                success: function(f, action) {
                    Ext.ux.ToastMessage('Email has been sent!');
                    wnd.close();
                },
                failure: function(f, action) {
                    var error = action.result ? action.result.error : action.response.statusText;
                    Ext.ux.ToastMessage(error, 'error');
                    console.error(action);
                }
            });
        } else {
            Ext.ux.ToastMessage('All fields must be filled in.', 'warning');
        }
    }
});
