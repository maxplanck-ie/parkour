Ext.define('MainHub.view.librarypreparation.BenchtopProtocolWindow', {
    extend: 'Ext.window.Window',
    requires: ['MainHub.view.librarypreparation.BenchtopProtocolWindowController'],
    controller: 'benchtop-protocol-window',

    title: 'Download Benchtop Protocol',
    height: 520,
    width: 280,

    modal: true,
    resizable: false,
    layout: 'fit',
    bodyPadding: 15,
    border: 0,

    samples: [],

    items: [{
        border: 0,
        layout: 'vbox',
        items: [
            {
                html: '<strong>Choose parameters:</strong>',
                margin: '0 0 15px',
                border: 0
            },
            {
                xtype: 'form',
                id: 'benchtopProtocolParams',
                layout: 'fit',
                border: 0,
                standardSubmit: true,

                items: [{
                    xtype: 'fieldcontainer',
                    defaultType: 'checkbox',
                    items: [
                        {
                            boxLabel: 'Barcode',
                            inputValue: 'Barcode',
                            name: 'params',
                            id: 'barcodeCb'
                        },
                        {
                            boxLabel: 'Concentration Sample (ng/µl)',
                            inputValue: 'Concentration Sample (ng/µl)',
                            name: 'params',
                            id: 'concentrationSampleCb'
                        },
                        {
                            boxLabel: 'Starting Amount (ng)',
                            inputValue: 'Starting Amount (ng)',
                            name: 'params',
                            id: 'startingAmountCb'
                        },
                        {
                            boxLabel: 'Starting Volume (ng)',
                            inputValue: 'Starting Volume (ng)',
                            name: 'params',
                            id: 'startingVolumeCb'
                        },
                        {
                            boxLabel: 'Spike-in Volume (µl)',
                            inputValue: 'Spike-in Volume (µl)',
                            name: 'params',
                            id: 'spikeInVolumeCb'
                        },
                        {
                            boxLabel: 'µl Sample',
                            inputValue: 'µl Sample',
                            name: 'params',
                            id: 'ulSampleCb'
                        },
                        {
                            boxLabel: 'µl Buffer',
                            inputValue: 'µl Buffer',
                            name: 'params',
                            id: 'ulBufferCb'
                        },
                        {
                            boxLabel: 'Index I7 ID',
                            inputValue: 'Index I7 ID',
                            name: 'params',
                            id: 'indexI7IdCb'
                        },
                        {
                            boxLabel: 'Index I5 ID',
                            inputValue: 'Index I5 ID',
                            name: 'params',
                            id: 'indexI5IdCb'
                        }
                    ]
                }]
            }
        ]
    }],

    bbar: [
        {
            text: 'Select All',
            itemId: 'selectAll'
        },
        '->',
        {
            text: 'Download',
            itemId: 'download'
        }
    ]
});
