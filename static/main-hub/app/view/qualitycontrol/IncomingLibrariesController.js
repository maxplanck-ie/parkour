Ext.define('MainHub.view.qualitycontrol.IncomingLibrariesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.qualitycontrol-incominglibraries',
    
    config: {
        control: {
            '#incomingLibraries': {
                boxready: 'onIncomingLibrariesTableBoxready',
                refresh: 'onIncomingLibrariesTableRefresh',
                edit: 'onIncomingLibrariesTableEdit'
            }
        }
    },

    onIncomingLibrariesTableBoxready: function(grid) {
        // Triggers when the table is shown for the first time
        Ext.getStore('concentrationMethodsStore').load(function(records, operation, success) {
            if (!success) {
                Ext.ux.ToastMessage('Cannot load Concentration Methods', 'error');
            } else {
                grid.fireEvent('refresh', grid);
            }
        });
    },

    onIncomingLibrariesTableRefresh: function(grid) {
        // Reload the table
        grid.getStore().removeAll();
        grid.getStore().reload();
    },

    onIncomingLibrariesTableEdit: function(editor, context) {
        var grid = this.getView().down('grid'),
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues,
            amountFacility = values.amountFacility;

        // Compute Amount
        if (Object.keys(changes).indexOf('amountFacility') == -1 && values.dilutionFactor !== '' && 
            values.concentrationFacility !== '' && values.sampleVolumeFacility !== '') {
            amountFacility = parseFloat(values.dilutionFactor) * parseFloat(values.concentrationFacility) * parseFloat(values.sampleVolumeFacility);
        }

        var url = 'qc_incoming_libraries/';
        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,

            params: {
                'record_type': record.get('recordType'),
                'record_id': (record.get('recordType') == 'L') ? record.get('libraryId') : record.get('sampleId'),
                'dilution_factor': values.dilutionFactor,
                'concentration_facility': values.concentrationFacility,
                'concentration_method_facility_id': values.concentrationMethodFacility,
                'sample_volume_facility': values.sampleVolumeFacility,
                'amount_facility': amountFacility,
                'qpcr_result_facility': values.qPCRResultFacility,
                'rna_quality_facility': values.rnaQualityFacility,
                'size_distribution_facility': values.sizeDistributionFacility,
                'comments_facility': values.commentsFacility,
                'qc_result': values.qcResult
            },

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    grid.fireEvent('refresh', grid);
                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.log('[ERROR]: ' + url + ': ' + obj.error);
                    console.log(response);
                }
            },

            failure: function (response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.log('[ERROR]: ' + url);
                console.log(response);
            }
        });
    }
});
