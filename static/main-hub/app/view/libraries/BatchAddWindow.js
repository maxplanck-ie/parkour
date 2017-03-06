Ext.define('MainHub.view.libraries.BatchAddWindow', {
    extend: 'Ext.window.Window',
    controller: 'libraries-batchaddwindow',

    requires: ['MainHub.view.libraries.BatchAddWindowController'],

    title: 'Add Sample',
    height: 650,
    width: 1000,
    modal: true,
    resizable: false,
    maximizable: true,
    layout: 'fit',

    items: [{
        xtype: 'grid',
        id: 'lol',
        itemId: 'batchAddGrid',
        border: 0,
        header: {
            items: [
                {
                    xtype: 'container',
                    html: 'test'
                }
            ]
        },
        columns: [
            {
                xtype: 'rownumberer',
                width: 40
            },
            {
                text: 'Name',
                dataIndex: 'name',
                flex: 1,
                editor: {
                    xtype: 'textfield'
                }
            },
            {
                text: 'Protocol',
                dataIndex: 'library_protocol',
                flex: 1
            },
            {
                text: 'Depth (M)',
                dataIndex: 'sequencing_depth',
                width: 85,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0,
                    allowDecimals: false
                }
            },
            {
                text: 'ng/μl',
                dataIndex: 'concentration',
                width: 70
            },
            {
                text: 'Method',
                dataIndex: 'concentration_method',
                width: 80
            },
            {
                text: 'μg',
                dataIndex: 'sample_volume',
                width: 70
            }
        ],
        store: Ext.create('Ext.data.Store', {
            data: [
                {name: 'Sample 1', 'library_protocol': 'NEBNext'},
                {name: 'Sample 2', 'library_protocol': 'NEBNext'},
                {name: 'Sample 3', 'library_protocol': 'NEBNext'},
                {name: 'Sample 4', 'library_protocol': 'NEBNext'},
                {name: 'Sample 5', 'library_protocol': 'NEBNext'},
                {name: 'Sample 6', 'library_protocol': 'NEBNext'},
                {name: 'Sample 7', 'library_protocol': 'NEBNext'},
                {name: 'Sample 8', 'library_protocol': 'NEBNext'},
                {name: 'Sample 9', 'library_protocol': 'NEBNext'},
                {name: 'Sample 10', 'library_protocol': 'NEBNext'},
                {name: 'Sample 11', 'library_protocol': 'NEBNext'},
                {name: 'Sample 12', 'library_protocol': 'NEBNext'},
                {name: 'Sample 13', 'library_protocol': 'NEBNext'},
                {name: 'Sample 14', 'library_protocol': 'NEBNext'},
                {name: 'Sample 15', 'library_protocol': 'NEBNext'},
                {name: 'Sample 16', 'library_protocol': 'NEBNext'},
                {name: 'Sample 17', 'library_protocol': 'NEBNext'},
                {name: 'Sample 18', 'library_protocol': 'NEBNext'},
                {name: 'Sample 19', 'library_protocol': 'NEBNext'},
                {name: 'Sample 20', 'library_protocol': 'NEBNext'}
            ]
        }),
        bbar: [
            '->',
            {
                text: 'Add',
                itemId: 'addBtn'
            }
        ],
        plugins: [{
            ptype: 'rowediting',
            clicksToEdit: 1
        }]
    }]
});
