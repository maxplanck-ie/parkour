Ext.define('MainHub.view.QualityControl.IncomingLibraries.IncomingLibrariesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.qualitycontrol-incominglibraries-incominglibraries',
    
    config: {
        control: {
            '#incomingLibraries': {
                boxready: 'onIncomingLibrariesTableBoxready',
                refresh: 'onIncomingLibrariesTableRefresh',
                beforeedit: 'onIncomingLibrariesTableBeforeEdit',
                edit: 'onIncomingLibrariesTableEdit'
            }
        }
    },

    onIncomingLibrariesTableBoxready: function(grid) {
        // Triggers when the table is shown for the first time
        grid.fireEvent('refresh', grid);
    },

    onIncomingLibrariesTableRefresh: function(grid) {
        // Reload the table
        grid.getStore().removeAll();
        grid.getStore().reload();
    },

    onIncomingLibrariesTableBeforeEdit: function() {
        Ext.getStore('concentrationMethodsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Concentration Methods', 'error');
        });
    },

    onIncomingLibrariesTableEdit: function(editor, context) {
        context.record.set(context.newValues);

        // Set date if Concentration field was filled in
        if (context.field == 'concentrationFacility') {
            var date = new Date();

            var dd = date.getDate();
            if (dd < 10) dd = '0' + dd;

            var mm = date.getMonth() + 1;
            if (mm < 10) mm = '0' + mm;

            var yy = date.getFullYear();

            context.record.set('dateFacility', dd + '.' + mm + '.' + yy);
        }

        // TODO: update DB record
    }
});
