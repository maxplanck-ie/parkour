Ext.define('MainHub.view.pooling.BenchtopProtocolWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.benchtop-protocol-window',

    requires: [],

    config: {
        control: {
            '#selectAll': {
                click: 'onSelectAllClick'
            },
            '#download': {
                click: 'onDownloadBtn'
            }
        }
    },

    onSelectAllClick: function() {
        Ext.getCmp('concentrationSampleCb').setValue(true);
        Ext.getCmp('startingAmountCb').setValue(true);
        Ext.getCmp('startingVolumeCb').setValue(true);
        Ext.getCmp('spikeInVolumeCb').setValue(true);
        Ext.getCmp('ulSampleCb').setValue(true);
        Ext.getCmp('ulBufferCb').setValue(true);
    },

    onDownloadBtn: function(btn) {
        var wnd = btn.up('window'),
            form = Ext.getCmp('benchtopProtocolParams').getForm(),
            data = form.getFieldValues();

        if (Object.keys(data).length > 0) {
            form.submit({
                url: 'download_benchtop_protocol_xls/',
                target: '_blank',
                params: {
                    'params': data.params,
                    'samples': Ext.JSON.encode(wnd.samples)
                }
            });
        } else {
            Ext.ux.ToastMessage('You did not select any parameters.', 'warning');
        }
    }
});
