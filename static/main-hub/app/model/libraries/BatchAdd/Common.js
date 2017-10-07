Ext.define('validator.Unique', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.unique',
    validate: function(value, record) {
        var store = Ext.getCmp('batch-add-grid').getStore();
        var names = [];
        // var isValid = true;

        store.each(function(item) {
            var name = item.get('name');
            if (item !== record && name !== '') {
                names.push(name);
            }
        });

        return names.indexOf(value) === -1 || 'Must be unique';
    }
});

Ext.define('validator.GreaterThanZero', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.greaterthanzero',
    validate: function(value) {
        return (value > 0) || 'Must be greater than zero';
    }
});

Ext.define('MainHub.model.libraries.BatchAdd.Common', {
    extend: 'Ext.data.Model',

    fields: [
        {
            type: 'string',
            name: 'name'
        },
        {
            type: 'int',
            name: 'library_protocol',
            allowNull: true,
            defaultValue: null
        },
        {
            type: 'int',
            name: 'library_type',
            allowNull: true,
            defaultValue: null
        },
        {
            type: 'int',
            name: 'sequencing_depth'
        },
        {
            type: 'float',
            name: 'concentration'
        },
        {
            type: 'int',
            name: 'concentration_method',
            allowNull: true,
            defaultValue: null
        },
        {
            type: 'int',
            name: 'amplification_cycles'
        },
        {
            type: 'bool',
            name: 'equal_representation_nucleotides'
        },
        {
            type: 'int',
            name: 'read_length',
            allowNull: true,
            defaultValue: null
        },
        {
            type: 'int',
            name: 'organism',
            allowNull: true,
            defaultValue: null
        },
        {
            type: 'string',
            name: 'comments'
        },
        {
            type: 'bool',
            name: 'invalid',
            defaultValue: false
        },
        {
            type: 'auto',
            name: 'errors',
            defaultValue: {}
        }
    ],

    validators: {
        name: [{
            type: 'presence'
        },{
            type: 'unique'
        }],
        library_protocol: 'presence',
        library_type: 'presence',
        concentration: 'presence',
        read_length: 'presence',
        sequencing_depth: 'greaterthanzero',
        amplification_cycles: 'presence',
        concentration_method: 'presence',
        organism: 'presence'
    }
});
