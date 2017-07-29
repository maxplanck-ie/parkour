Ext.define('MainHub.overrides.grid.plugin.Clipboard', {
    override: 'Ext.grid.plugin.Clipboard',

    putCellData: function (data, format) {
        var values = Ext.util.TSV.decode(data),
            row,
            recCount = values.length,
            colCount = recCount ? values[0].length : 0,
            sourceRowIdx, sourceColIdx,
            view = this.getCmp().getView(),
            maxRowIdx = view.dataSource.getCount() - 1,
            maxColIdx = view.getVisibleColumnManager().getColumns().length - 1,
            navModel = view.getNavigationModel(),
            destination = navModel.getPosition(),
            dataIndex, destinationStartColumn,
            dataObject = {};

        // If the view is not focused, use the first cell of the selection as the destination.
        if (!destination) {
            view.getSelectionModel().getSelected().eachCell(function(c){
                destination = c;
                return false;
            });
        }

        if (destination) {
            // Create a new Context based upon the outermost View.
            destination = new Ext.grid.CellContext(view).setPosition(destination.record, destination.column);
        } else {
            destination = new Ext.grid.CellContext(view).setPosition(0, 0);
        }
        destinationStartColumn = destination.colIdx;

        // Don't allow pasting into read-only and combobox fields
        var destinationColumnEditor = destination.column.config.editor;
        if (!destinationColumnEditor || (destinationColumnEditor && destinationColumnEditor.xtype === 'combobox')) {
            return false;
        }

        for (sourceRowIdx = 0; sourceRowIdx < recCount; sourceRowIdx++) {
            row = values[sourceRowIdx];

            // Collect new values in dataObject
            for (sourceColIdx = 0; sourceColIdx < colCount; sourceColIdx++) {
                dataIndex = destination.column.dataIndex;
                if (dataIndex) {
                    switch (format) {
                        // Raw field values
                        case 'raw':
                            dataObject[dataIndex] = row[sourceColIdx];
                            break;

                        // Textual data with HTML tags stripped
                        case 'text':
                            dataObject[dataIndex] = row[sourceColIdx];
                            break;

                        // innerHTML from the cell inner
                        case 'html':
                            break;
                    }
                }
                // If we are at the end of the destination row, break the column loop.
                if (destination.colIdx === maxColIdx) {
                    break;
                }
                destination.setColumn(destination.colIdx + 1);
            }

            // Update the record in one go.
            destination.record.set(dataObject);

            // If we are at the end of the destination store, break the row loop.
            if (destination.rowIdx === maxRowIdx) {
                break;
            }

            // Jump to next row in destination
            destination.setPosition(destination.rowIdx + 1, destinationStartColumn);
        }
    }
});
