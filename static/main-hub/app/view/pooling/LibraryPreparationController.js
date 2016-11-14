Ext.define('MainHub.view.pooling.LibraryPreparationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.library-preparation',

    requires: [],

    config: {
        control: {
            '#libraryPreparationTable': {
                boxready: 'onLibraryPreparationTableBoxready',
                refresh: 'onLibraryPreparationTableRefresh',
                edit: 'onLibraryPreparationTableEdit'
            }
        }
    },

    onLibraryPreparationTableBoxready: function() {
        Ext.getStore('libraryPreparationStore').load();
    },

    onLibraryPreparationTableRefresh: function(grid) {
        // Reload the store
        // grid.getStore().removeAll();
        // grid.getStore().reload();
        Ext.getStore('libraryPreparationStore').reload();
    },

    onLibraryPreparationTableEdit: function(editor, context) {
        var grid = context.grid,
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues,
            url = 'edit_library_preparation/';

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,

            params: {
                sample_id:              record.get('sampleId'),
                starting_amount:        values.startingAmount,
                starting_volume:        values.startingVolume,
                spike_in_description:   values.spikeInDescription,
                spike_in_volume:        values.spikeInVolume,
                ul_sample:              values.ulSample,
                ul_buffer:              values.ulBuffer,
                pcr_cycles:             values.pcrCycles,
                concentration_library:  values.concentrationLibrary,
                mean_fragment_size:     values.meanFragmentSize,
                nM:                     values.nM
            },

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    // grid.fireEvent('refresh', grid);
                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.error('[ERROR]: ' + url + ': ' + obj.error);
                }
            },

            failure: function (response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error('[ERROR]: ' + url);
            }
        });
    }
});
