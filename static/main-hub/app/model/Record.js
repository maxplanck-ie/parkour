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
            name: 'name',
            type: 'string'
        },
        {
            name: 'status',
            type: 'int'
        },
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

    // getRecordType: function() {
    //     return (this.get('sample_id') === 0) ? 'L' : 'S';
    // },

    getBarcode: function() {
        var barcode = this.get('barcode');
        return this.get('is_converted') ? barcode + '*' : barcode;
    }
});
