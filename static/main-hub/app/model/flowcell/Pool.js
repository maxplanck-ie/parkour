Ext.define('MainHub.model.flowcell.Pool', {
    extend: 'MainHub.model.Base',

    fields: [{
            name: 'name',
            type: 'string'
        },
        {
            name: 'id',
            type: 'int'
        },
        {
            name: 'readLength',
            type: 'int'
        },
        {
            name: 'readLengthName',
            type: 'string'
        },
        {
            name: 'size',
            type: 'int'
        },
        {
            name: 'poolSizeId',
            type: 'int'
        },
        {
            name: 'loaded',
            type: 'int'
        }
    ],

    disabled: false,

    setDisabled: function(state) {
        this.disabled = state;
        this.store.fireEvent('disable', this, state);
    },

    isDisabled: function() {
        return this.disabled;
    }
});
