/* 
    selectingComponent class
*/
module.exports = function( optionsToApply, thisOptionsToApply, listPageToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    var pageUtils = require( './pageUtils.js' );
    
    var options = optionsToApply;
    var listPage = listPageToApply;
    
    var thisOptions = thisOptionsToApply;
    var getThisOptions = function(){
        return thisOptions;
    };
    
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
    
    // Return a reference to the 'select/deselect all' checkbox (jQuery object)
    var $selectAllCheckbox = undefined; 
    var getSelectAllCheckbox = function(){
        
        if ( ! $selectAllCheckbox ){
            $selectAllCheckbox = $( '#' + listPage.getThisOptions().tableId ).find( '.zcrud-select-all-rows' );
        }
        return $selectAllCheckbox;
    };
    
    var getTableBody = function(){
        return $( '#' + listPage.getThisOptions().tbodyId );
    };
    var getAllTableRows = function(){
        return getTableBody().find( '>tr.zcrud-data-row' );
    };
    
    var bindSelectAllHeader = function(){
        
        getSelectAllCheckbox().click( function () {
            
            var allTableRows = getAllTableRows();
            if ( allTableRows.length <= 0 ) {
                getSelectAllCheckbox().attr( 'checked', false );
                return;
            }

            if ( $( this ).is( ':checked' ) ) {
                _selectRows( allTableRows );
            } else {
                _deselectRows( allTableRows );
            }

            onSelectionChanged();
        });
    };
    
    var bindRowsEvents = function(){
        
        // Select/deselect on row click
        if ( modeOnRowClickOn ) {
            getAllTableRows().click( function () {
                invertRowSelection( $( this ) );
            });
        }

        // Select/deselect checkbox column
        if ( ! modeOnRowClickOn && modeCheckBoxOn ) {
            getAllTableRows().find( '.zcrud-select-row' ).click( function () {
                invertRowSelection( $( this ).parents( 'tr' ) );
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
                var $mappedArray = buildMappedArray( getAllTableRows() );
                //var $tableRows = getAllTableRows();
                var rowIndex = findRowIndex( $row, $mappedArray );
                //try to select row and above rows until first selected row
                var beforeIndex = findFirstSelectedRowIndexBeforeIndex( rowIndex, $mappedArray ) + 1;
                if ( beforeIndex > 0 && beforeIndex < rowIndex ) {
                    _selectRows( 
                        buildJqueryWrapped(
                            $mappedArray.slice( beforeIndex, rowIndex + 1 ) ) );
                } else {
                    //try to select row and below rows until first selected row
                    var afterIndex = findFirstSelectedRowIndexAfterIndex( rowIndex, $mappedArray ) - 1;
                    if ( afterIndex > rowIndex ) {
                        _selectRows( 
                            buildJqueryWrapped(
                                $mappedArray.slice( rowIndex, afterIndex + 1 ) ) );
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
    
    var buildMappedArray = function( $tableRows ){
        
        return $tableRows.map( function( index, element ) {
            return $( this );
        }).get();
    };
    
    var buildJqueryWrapped = function( array ){
        return $( array ).map ( function (){
            return this.toArray();
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
        
        for ( var i = rowIndex + 1; i < $tableRows.length; ++i ) {
            if ( $tableRows[i].hasClass( 'zcrud-row-selected' ) ) {
                return i;
            }
        }
        return -1;
    };
    
    /* Makes row/rows 'selected'.
        *************************************************************************/
    var _selectRows = function ( $rows ) {
        
        if ( ! thisOptions.multiple ) {
            _deselectRows( selectedRows() );
        }

        $rows.addClass( 'zcrud-row-selected' );
        //this._jqueryuiThemeAddClass($rows, 'ui-state-highlight');

        if ( modeCheckBoxOn ) {
            $rows.find( '.zcrud-select-row' ).prop( 'checked', true );
        }

        refreshSelectAllCheckboxState();
    };
    
    /* Makes row/rows 'non selected'.
        *************************************************************************/
    var _deselectRows =  function ( $rows ) {
        
        $rows.removeClass( 'zcrud-row-selected' );
        if ( modeCheckBoxOn ) {
            $rows.find( '.zcrud-select-row' ).prop( 'checked', false );
        }

        refreshSelectAllCheckboxState();
    };
    
    /* Updates state of the 'select/deselect' all checkbox according to count of selected rows.
        *************************************************************************/
    var refreshSelectAllCheckboxState = function () {
        
        if ( ! modeCheckBoxOn || ! thisOptions.multiple ) {
            return;
        }

        var totalRowCount = getAllTableRows().length;
        var selectedRowCount = selectedRows().length;

        if ( selectedRowCount == 0 ) {
            getSelectAllCheckbox().prop( 'indeterminate', false );
            getSelectAllCheckbox().attr( 'checked', false );
            
        } else if ( selectedRowCount == totalRowCount ) {
            getSelectAllCheckbox().prop( 'indeterminate', false );
            getSelectAllCheckbox().attr( 'checked', true );
            
        } else {
            getSelectAllCheckbox().attr( 'checked', false );
            getSelectAllCheckbox().prop( 'indeterminate', true );
        }
    };
    
    var selectRows = function(){
        _selectRows( $rows );
        onSelectionChanged(); //TODO: trigger only if selected rows changes?
    };
    
    /* Gets all selected rows.
        *************************************************************************/
    var selectedRows = function(){
        return $( '#' + listPage.getThisOptions().tableId ).find( '.zcrud-row-selected' );
    };
    
    var selectedRecords = function(){

        var result = [];

        var $selectedRows = selectedRows();
        $selectedRows.each( function( index ) {
            var key = $( this ).data( 'record-key' );
            var record = listPage.getRecordByKey( key );
            result.push( record );
        });
        
        return result;
    };
    
    var onSelectionChanged = function () {
        options.events.selectionChanged(
            selectedRows() );
    };
    
    var resetPage = function(){
        getSelectAllCheckbox().prop( 'indeterminate', false );
        getSelectAllCheckbox().attr( 'checked', false );
    };
    
    return {
        bindEvents: bindEvents,
        getThisOptions: getThisOptions,
        selectRows: selectRows,
        selectedRows: selectedRows,
        selectedRecords: selectedRecords,
        resetPage: resetPage
    };
};
