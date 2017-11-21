Ext.define('MainHub.view.incominglibraries.IncomingLibraries', {
    extend: 'Ext.container.Container',
    xtype: 'incoming-libraries',

    requires: [
        'MainHub.view.incominglibraries.CheckboxGroupingFeature',
        'MainHub.view.incominglibraries.IncomingLibrariesController'
    ],

    controller: 'incominglibraries-incominglibraries',

    anchor: '100% -1',
    layout: 'fit',

    items: [{
        xtype: 'grid',
        id: 'incoming-libraries-grid',
        itemId: 'incoming-libraries-grid',
        height: Ext.Element.getViewportHeight() - 64,
        region: 'center',
        padding: 15,
        header: {
            title: 'Incoming Libraries and Samples',
            items: [
                {
                    xtype: 'fieldcontainer',
                    defaultType: 'checkboxfield',
                    layout: 'hbox',
                    margin: '0 20 0 0',
                    items: [
                        {
                            boxLabel: 'Show Libraries',
                            itemId: 'show-libraries-checkbox',
                            margin: '0 15 0 0',
                            cls: 'grid-header-checkbox',
                            checked: true
                        },
                        {
                            boxLabel: 'Show Samples',
                            itemId: 'show-samples-checkbox',
                            cls: 'grid-header-checkbox',
                            checked: true
                        }
                    ]
                },
                {
                    xtype: 'textfield',
                    itemId: 'search-field',
                    emptyText: 'Search',
                    width: 200
                }
            ]
        },
        viewConfig: {
            // loadMask: false
            // markDirty: false
        },
        selModel: {
            type: 'spreadsheet',
            rowSelect: false
        },
        store: 'IncomingLibraries',
        sortableColumns: false,
        enableColumnMove: false,

        columns: {
            items: [
                {
                    xtype: 'checkcolumn',
                    itemId: 'checkColumn',
                    dataIndex: 'selected',
                    resizable: false,
                    menuDisabled: true,
                    hideable: false,
                    tdCls: 'no-dirty userEntry',
                    width: 40
                },
                {
                    text: 'Name',
                    dataIndex: 'name',
                    menuDisabled: true,
                    hideable: false,
                    minWidth: 150,
                    flex: 1,
                    tdCls: 'userEntry',
                    renderer: function(value, meta) {
                        meta.tdStyle = 'font-weight:bold';
                        return value;
                    }
                },
                {
                    text: '',
                    dataIndex: 'record_type',
                    resizable: false,
                    menuDisabled: true,
                    hideable: false,
                    tdCls: 'userEntry',
                    width: 30,
                    renderer: function(value, meta) {
                        return value.charAt(0);
                    }
                },
                {
                    text: 'Barcode',
                    dataIndex: 'barcode',
                    resizable: false,
                    menuDisabled: true,
                    hideable: false,
                    tdCls: 'userEntry',
                    width: 90
                },
                {
                    text: 'Nuc. Type',
                    tooltip: 'Nucleic Acid Type',
                    dataIndex: 'nucleic_acid_type_name',
                    tdCls: 'userEntry',
                    minWidth: 100,
                    flex: 1
                },
                {
                    text: 'Protocol',
                    tooltip: 'Library Protocol',
                    dataIndex: 'library_protocol_name',
                    tdCls: 'userEntry',
                    minWidth: 100,
                    flex: 1
                },
                {
                    text: 'ng/µl',
                    tooltip: 'Concentration (user)',
                    dataIndex: 'concentration',
                    tdCls: 'userEntry',
                    width: 70
                },
                {
                    text: 'F/S',
                    tooltip: 'Concentration Determined by (user)',
                    dataIndex: 'concentration_method',
                    tdCls: 'userEntry',
                    width: 50,
                    renderer: function(value, meta) {
                        var store = Ext.getStore('concentrationMethodsStore');
                        var record = store.findRecord('id', value);
                        meta.tdAttr = 'data-qtip="' + record.get('name') + '"';
                        return (record) ? record.getShortName() : '';
                    }
                },
                {
                    text: 'qPCR (nM)',
                    tooltip: 'qPCR Result (user)',
                    dataIndex: 'qpcr_result',
                    tdCls: 'userEntry',
                    width: 85
                },
                {
                    text: 'bp',
                    tooltip: 'Mean Fragment Size (user)',
                    dataIndex: 'mean_fragment_size',
                    tdCls: 'userEntry',
                    width: 45
                },
                {
                    text: 'RQN',
                    tooltip: 'RNA Quality (user)',
                    dataIndex: 'rna_quality',
                    tdCls: 'userEntry',
                    width: 55,
                    renderer: function(value) {
                        return value === 11 ? 'Determined by Facility' : value;
                    }
                },

                // Facility
                {
                    text: 'DF',
                    tooltip: 'Dilution Factor (facility)',
                    dataIndex: 'dilution_factor',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 1,
                        allowDecimals: false
                    }
                },
                {
                    text: 'ng/µl',
                    tooltip: 'Concentration (facility)',
                    dataIndex: 'concentration_facility',
                    tdCls: 'facilityEntry',
                    width: 90,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0
                    }
                },
                {
                    text: 'µl',
                    tooltip: 'Sample Volume (facility)',
                    dataIndex: 'sample_volume_facility',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0,
                        allowDecimals: false
                    }
                },
                {
                    text: 'ng',
                    tooltip: 'Amount (facility): DF * ng/µl * µl',
                    dataIndex: 'amount_facility',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0
                    }
                },
                {
                    text: 'F/S',
                    tooltip: 'Concentration Determined by (facility)',
                    dataIndex: 'concentration_method_facility',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'combobox',
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'id',
                        store: 'concentrationMethodsStore',
                        matchFieldWidth: false,
                        forceSelection: true
                    },
                    renderer: function(value, meta) {
                        var store = Ext.getStore('concentrationMethodsStore');
                        var record = store.findRecord('id', value);

                        if (record) {
                            meta.tdAttr = 'data-qtip="' + record.get('name') + '"';
                        }

                        return (record) ? record.getShortName() : '';
                    }
                },
                {
                    text: 'qPCR (nM)',
                    tooltip: 'qPCR Result (facility)',
                    dataIndex: 'qpcr_result_facility',
                    tdCls: 'facilityEntry',
                    width: 85,
                    editor: {
                        xtype: 'numberfield',
                        id: 'qPCRResultEditor',
                        minValue: 0
                    }
                },
                {
                    text: 'bp',
                    tooltip: 'Size Distribution (facility)',
                    dataIndex: 'size_distribution_facility',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0
                    }
                },
                {
                    text: 'RQN',
                    tooltip: 'RNA Quality (facility)',
                    dataIndex: 'rna_quality_facility',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'combobox',
                        id: 'rnaQualityIncomingEditor',
                        queryMode: 'local',
                        valueField: 'value',
                        displayField: 'name',
                        displayTpl: Ext.create('Ext.XTemplate', '<tpl for=".">{value}</tpl>'),
                        store: 'rnaQualityStore',
                        regex: new RegExp('^(11|10|[1-9]?(\.[0-9]+)?|\.[0-9]+)$'),
                        regexText: 'Only values between 1 and 10 are allowed.'
                        // matchFieldWidth: false,
                    },
                    renderer: function(value) {
                        return value === 11 ? 'Determined by Facility' : value;
                    }
                },
                {
                    text: 'Comments',
                    tooltip: 'Comments (facility)',
                    dataIndex: 'comments_facility',
                    tdCls: 'facilityEntry',
                    width: 150,
                    editor: { xtype: 'textfield' }
                },
                {
                    xtype: 'actioncolumn',
                    itemId: 'qc-action-buttons',
                    align: 'center',
                    text: 'QC Result',
                    resizable: false,
                    menuDisabled: true,
                    hideable: false,
                    tdCls: 'facilityEntry',
                    width: 85,
                    items: [
                        {
                            iconCls: 'qc-action-passed x-fa fa-check',
                            tooltip: 'passed'
                        },
                        {
                            iconCls: 'qc-action-failed x-fa fa-times',
                            tooltip: 'failed'
                        },
                        {
                            iconCls: 'qc-action-compromised x-fa fa-exclamation-triangle',
                            tooltip: 'compromised'
                        }
                    ],
                    editor: { xtype: 'container' }
                }
            ]
        },
        features: [{
            ftype: 'checkboxgrouping',
            checkDataIndex: 'samples_submitted',
            startCollapsed: true,
            enableGroupingMenu: false,
            groupHeaderTpl: [
                '<strong>Request: {children:this.getName}</strong> ',
                '(# of Libraries/Samples: {rows.length}, ',
                'Total Sequencing Depth: {children:this.getTotalDepth} M)',
                '<span style="margin-left:25px">',
                '<input type="checkbox" class="group-checkbox" {children:this.getChecked}> Samples submitted',
                '</span>',
                {
                    getName: function(children) {
                        return children[0].get('request_name');
                    },
                    getTotalDepth: function(children) {
                        var sequencingDepths = Ext.Array.pluck(Ext.Array.pluck(children, 'data'), 'sequencing_depth');
                        return Ext.Array.sum(sequencingDepths);
                    },
                    getChecked: function(children) {
                        return children[0].get(this.owner.checkDataIndex) ? 'checked' : '';
                    }
                }
            ]
        }],
        plugins: [
            {
                ptype: 'bufferedrenderer',
                trailingBufferZone: 100,
                leadingBufferZone: 100
            },
            {
                ptype: 'rowediting',
                clicksToEdit: 1
            },
            {
                ptype: 'clipboard'
            }
        ],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            items: [
                '->',
                {
                    xtype: 'button',
                    itemId: 'cancel-button',
                    iconCls: 'fa fa-ban fa-lg',
                    text: 'Cancel'
                },
                {
                    xtype: 'button',
                    itemId: 'save-button',
                    iconCls: 'fa fa-floppy-o fa-lg',
                    text: 'Save'
                }
            ]
        }]
    }]
});
