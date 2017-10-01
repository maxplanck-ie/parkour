Ext.define('MainHub.model.Record', {
    extend: 'MainHub.model.Base',

    fields: [
        // {
        //     name: 'library_id',
        //     type: 'int'
        // },
        // {
        //     name: 'sample_id',
        //     type: 'int'
        // },
        {
            name: 'pk',
            type: 'int'
        },
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'record_type',
            type: 'string'
        },
        // {
        //     name: 'status',
        //     type: 'int'
        // },
        {
            name: 'barcode',
            type: 'string'
        },
        {
            name: 'is_converted',
            type: 'bool',
            defaultValue: false
        }
    ],

    getRecordType: function() {
        var type = this.get('record_type');
        if (type === 'Sample' && this.get('is_converted')) {
            type = 'Library';
        }
        return type;
    },

    getBarcode: function() {
        var barcode = this.get('barcode');
        return this.get('is_converted') ? barcode + '*' : barcode;
    }
});
