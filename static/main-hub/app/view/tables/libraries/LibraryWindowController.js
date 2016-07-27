Ext.define('MainHub.view.tables.libraries.LibraryWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tables-libraries-librarywindow',

    config: {
        control: {
            '#': {
                boxready: 'onLibraryWindowBoxready'
            },
            '#libraryProtocolField': {
                select: 'onLibraryProtocolFieldSelect'
            },
            '#indexType': {
                select: 'onIndexTypeSelect'
            },
            '#indexReadsField': {
                select: 'onIndexReadsFieldSelect'
            },
            '#addLibraryWndBtn': {
                click: 'onAddLibraryWndBtnClick'
            },
            '#cancelBtn': {
                click: 'onCancelBtnClick'
            }
        }
    },

    onLibraryWindowBoxready: function(wnd) {
        if (wnd.mode == 'add') {
            Ext.getCmp('saveAndAddLibraryWndBtn').show();
            Ext.getCmp('addLibraryWndBtn').show();
        } else {

        }

        // Load Library Protocols
        wnd.setLoading();
        Ext.getStore('libraryProtocolsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Library Protocols', 'error');
            wnd.setLoading(false);
        });

        // Load Organisms
        wnd.setLoading();
        Ext.getStore('organismsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Organisms', 'error');
            wnd.setLoading(false);
        });

        // Load Index Types
        wnd.setLoading();
        Ext.getStore('indexTypesStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Index Types', 'error');
            wnd.setLoading(false);
        });
    },

    onLibraryProtocolFieldSelect: function(fld, record) {
        var wnd = fld.up('library_wnd'),
            libraryTypeStore = Ext.getStore('libraryTypeStore'),
            libraryTypeField = Ext.getCmp('libraryTypeField'),
            keepLibraryTypeField = Ext.getCmp('keepLibraryTypeField');

        // Load Library Type
        wnd.setLoading();
        libraryTypeStore.load({
            params: {
                'library_protocol_id': record.data.libraryProtocolId
            },
            callback: function(records, operation, success) {
                libraryTypeField.setDisabled(false);
                keepLibraryTypeField.setDisabled(false);
                if (!success) Ext.ux.ToastMessage('Cannot load Principal Investigators', 'error');

                wnd.setLoading(false);
            }
        });
    },

    onIndexTypeSelect: function(fld, record) {
        var wnd = fld.up('library_wnd'),
            indexI7Store = Ext.getStore('indexI7Store'),
            indexI5Store = Ext.getStore('indexI5Store');

        // Load Index I7
        wnd.setLoading();
        indexI7Store.load({
            params: {
                'index_type_id': record.data.indexTypeId
            },
            callback: function(records, operation, success) {
                if (!success) Ext.ux.ToastMessage('Cannot load Index I7', 'error');
                wnd.setLoading(false);
            }
        });

        // Load Index I5
        wnd.setLoading();
        indexI5Store.load({
            params: {
                'index_type_id': record.data.indexTypeId
            },
            callback: function(records, operation, success) {
                if (!success) Ext.ux.ToastMessage('Cannot load Index I5', 'error');
                wnd.setLoading(false);
            }
        });
    },

    onIndexReadsFieldSelect: function(fld, record) {
        var index1Field = Ext.getCmp('index1Field'),
            index2Field = Ext.getCmp('index2Field');

        if (record.data.id == 1) {
            index1Field.setDisabled(true);
            index2Field.setDisabled(true);
        } else if (record.data.id == 2) {
            index1Field.setDisabled(false);
            index2Field.setDisabled(true);
        } else {
            index1Field.setDisabled(false);
            index2Field.setDisabled(false);
        }
    },

    onAddLibraryWndBtnClick: function(btn) {
        var wnd = btn.up('library_wnd'),
            form = Ext.getCmp('libraryForm');

        if (form.isValid()) {
            var data = form.getForm().getFieldValues();

            // debugger;
        }
    },

    onCancelBtnClick: function(btn) {
        btn.up('library_wnd').close();
    }
});
