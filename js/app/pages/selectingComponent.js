/* 
    selectingComponent class
*/
module.exports = function( optionsToApply, recordsToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    var pageUtils = require( './pageUtils.js' );
    
    var options = optionsToApply;
    var records = recordsToApply;
    
    var thisOptions = options.selecting;
    
    var $selectAllCheckbox = $( '#' + options.listTableId ).find( '.zcrud-select-all-rows' ); // Reference to the 'select/deselect all' checkbox (jQuery object)
    var shiftKeyDown = false; // True, if shift key is currently down.
    var modeOnRowClickOn =  -1 != thisOptions.mode.indexOf( 'onRowClick' );
    var modeCheckBoxOn =  -1 != thisOptions.mode.indexOf( 'checkbox' );
    
    var bindKeyboardEvents = function (){

        // Register to events to set shiftKeyDown value
        $( document )
            .keydown( function ( event ) {
            switch ( event.which ) {
                case 16:
                    shiftKeyDown = true;
                    break;
            }
        })
            .keyup( function ( event ) {
            switch ( event.which ) {
                case 16:
                    shiftKeyDown = false;
                    break;
            }
        });
    };
    
    var getTableBody = function(){
        return $( '#' + options.listTbodyId );
    };
    var getAllTableRows = function(){
        return getTableBody().find( '>tr.zcrud-data-row' );
    };
    
    var bindSelectAllHeader = function(){
        
        $selectAllCheckbox.click( function () {
            
            if ( records.length <= 0 ) {
                $selectAllCheckbox.attr( 'checked', false );
                return;
            }

            if ( $selectAllCheckbox.is( ':checked' ) ) {
                _selectRows( getAllTableRows() );
            } else {
                _deselectRows( getAllTableRows() );
            }

            onSelectionChanged();
        });
    };
    
    var bindRowsEvents = function(){
        
        // Select/deselect on row click
        if ( modeOnRowClickOn ) {
            $( '#' + options.listTableId ).find( '.zcrud-row-selected' ).parent( 'tr' ).click( function () {
                invertRowSelection( S( this ) );
            });
        }

        // Select/deselect checkbox column
        if ( modeCheckBoxOn ) {
            $( '#' + options.listTableId ).find( '.zcrud-row-selected' ).click( function () {
                invertRowSelection( S( this ).parent( 'tr' ) );
            });
        }
    };
    
    var bindEvents = function(){
        bindKeyboardEvents();   
        bindSelectAllHeader();
        bindRowsEvents();
    };
    
    /* Inverts selection state of a single row.
        *************************************************************************/
    var invertRowSelection = function ( $row ) {
        
        if ( $row.hasClass( 'zcrud-row-selected' ) ) {
            _deselectRows( $row );
            
        } else {
            //Shift key?
            if ( shiftKeyDown ) {
                var $tableRows = getAllTableRows();
                var rowIndex = findRowIndex( $row );
                //try to select row and above rows until first selected row
                var beforeIndex = findFirstSelectedRowIndexBeforeIndex( rowIndex, $tableRows ) + 1;
                if ( beforeIndex > 0 && beforeIndex < rowIndex ) {
                    _selectRows( getAllTableRows().slice( beforeIndex, rowIndex + 1 ) );
                } else {
                    //try to select row and below rows until first selected row
                    var afterIndex = findFirstSelectedRowIndexAfterIndex( rowIndex, $tableRows ) - 1;
                    if ( afterIndex > rowIndex ) {
                        _selectRows( getAllTableRows().slice( rowIndex, afterIndex + 1 ) );
                    } else {
                        //just select this row
                        _selectRows( $row );
                    }
                }
            } else {
                _selectRows( $row );
            }
        }

        onSelectionChanged();
    };

    /* Finds index of a row in table.
        *************************************************************************/
    var findRowIndex = function ( $row, $tableRows ) {
        return pageUtils.findIndexInArray( $row, $tableRows, function ( $row1, $row2 ) {
            return $row1.html() === $row2.html();
        });
    };
    
    /* Search for a selected row (that is before given row index) to up and returns it's index 
        *************************************************************************/
    var findFirstSelectedRowIndexBeforeIndex = function ( rowIndex, $tableRows ) {
        
        for ( var i = rowIndex - 1; i >= 0; --i ) {
            if ( $tableRows[i].hasClass( 'zcrud-row-selected' ) ) {
                return i;
            }
        }

        return -1;
    };
    
    /* Search for a selected row (that is after given row index) to down and returns it's index 
        *************************************************************************/
    var findFirstSelectedRowIndexAfterIndex = function ( rowIndex, $tableRows ) {
        
        for ( var i = rowIndex + 1; i < this._$tableRows.length; ++i ) {
            if ( $tableRows[i].hasClass( 'zcrud-row-selected' ) ) {
                return i;
            }
        }

        return -1;
    };
    
    /* Makes row/rows 'selected'.
        *************************************************************************/
    var _selectRows = function ( $rows ) {
        
        if ( ! thisOptions.multiselect ) {
            _deselectRows( _getSelectedRows() );
        }

        $rows.addClass( 'zcrud-row-selected' );
        //this._jqueryuiThemeAddClass($rows, 'ui-state-highlight');

        if ( modeCheckBoxOn ) {
            $rows.find( '>td.zcrud-select-row >input' ).prop( 'checked', true );
        }

        refreshSelectAllCheckboxState();
    };
    
    /* Makes row/rows 'non selected'.
        *************************************************************************/
    var _deselectRows =  function ( $rows ) {
        
        $rows.removeClass( 'zcrud-row-selected ui-state-highlight' );
        if ( modeCheckBoxOn ) {
            $rows.find( '>td.zcrud-select-row >input' ).prop( 'checked', false );
        }

        refreshSelectAllCheckboxState();
    };
    
    /* Updates state of the 'select/deselect' all checkbox according to count of selected rows.
        *************************************************************************/
    var refreshSelectAllCheckboxState = function () {
        
        if ( ! modeCheckBoxOn || ! thisOptions.multiselect ) {
            return;
        }

        var totalRowCount = getAllTableRows().length;
        var selectedRowCount = _getSelectedRows().length;

        if ( selectedRowCount == 0 ) {
            $selectAllCheckbox.prop( 'indeterminate', false );
            $selectAllCheckbox.attr( 'checked', false );
            
        } else if ( selectedRowCount == totalRowCount ) {
            $selectAllCheckbox.prop( 'indeterminate', false );
            $selectAllCheckbox.attr( 'checked', true );
            
        } else {
            $selectAllCheckbox.attr( 'checked', false );
            $selectAllCheckbox.prop( 'indeterminate', true );
        }
    };
    
    var dataFromServer = function( data ){
    };

    var getThisOptions = function(){
        return thisOptions;
    };
    
    var selectRows = function(){
        _selectRows( $rows );
        onSelectionChanged(); //TODO: trigger only if selected rows changes?
    };
    
    /* Gets all selected rows.
        *************************************************************************/
    var selectedRows = function(){
        return this._$tableBody
            .find('>tr.zcrud-row-selected');
    };
    
    var onSelectionChanged = function () {
        options.events.selectionChanged();
    };
    
    return {
        dataFromServer: dataFromServer,
        bindEvents: bindEvents,
        getThisOptions: getThisOptions,
        selectRows: selectRows,
        selectedRows: selectedRows
    };
};
