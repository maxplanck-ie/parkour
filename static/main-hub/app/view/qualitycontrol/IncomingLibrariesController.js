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
            amountFacility = (values.amountFacility != null) ? values.amountFacility : '',
            dilutionFactor = (values.dilutionFactor != null) ? values.dilutionFactor : '',
            concentrationFacility = (values.concentrationFacility != null) ? values.concentrationFacility : '',
            concentrationMethodFacility = (values.concentrationMethodFacility != null) ? values.concentrationMethodFacility : '',
            sampleVolumeFacility = (values.sampleVolumeFacility != null) ? values.sampleVolumeFacility : '',
            qPCRResultFacility = (values.qPCRResultFacility != null) ? values.qPCRResultFacility : '',
            rnaQualityFacility = (values.rnaQualityFacility != null) ? values.rnaQualityFacility : '',
            sizeDistributionFacility = (values.sizeDistributionFacility != null) ? values.sizeDistributionFacility : '',
            commentsFacility = (values.commentsFacility != null) ? values.commentsFacility : '',
            qcResult = (values.qcResult != null) ? values.qcResult : '';

        // Compute Amount
        if (Object.keys(changes).indexOf('amountFacility') == -1 && dilutionFactor !== '' && 
            concentrationFacility !== '' && sampleVolumeFacility !== '') {
            amountFacility = parseFloat(dilutionFactor) * parseFloat(concentrationFacility) * parseFloat(sampleVolumeFacility);
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
                'dilution_factor': dilutionFactor,
                'concentration_facility': concentrationFacility,
                'concentration_method_facility_id': concentrationMethodFacility,
                'sample_volume_facility': sampleVolumeFacility,
                'amount_facility': amountFacility,
                'qpcr_result_facility': qPCRResultFacility,
                'rna_quality_facility': rnaQualityFacility,
                'size_distribution_facility': sizeDistributionFacility,
                'comments_facility': commentsFacility,
                'qc_result': qcResult
            },

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    grid.fireEvent('refresh', grid);
                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.error('[ERROR]: ' + url + ': ' + obj.error);
                    console.error(response);
                }
            },

            failure: function (response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error('[ERROR]: ' + url);
                console.error(response);
            }
        });
    }
});
