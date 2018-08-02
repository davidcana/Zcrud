/* 
    selectingComponent class
*/
module.exports = function( optionsToApply, thisOptionsToApply, parentToApply, pageToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    var pageUtils = require( '../pages/pageUtils.js' );
    var fieldUtils = require( '../fields/fieldUtils.js' );
    
    var options = optionsToApply;
    var parent = parentToApply;
    var page = pageToApply;
    
    var thisOptions = thisOptionsToApply;
    var getThisOptions = function(){
        return thisOptions;
    };
    
    var shiftKeyDown = false; // True, if shift key is currently down
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
    var get$selectAllCheckbox = function(){
        return parent.get$().find( '.zcrud-select-all-rows' );
    };
    
    var get$allTableRows = function(){
        return parent.get$().find( 'tr.zcrud-data-row' );
    };
    
    var bindSelectAllHeader = function(){
        
        get$selectAllCheckbox().click( function () {
            
            var allTableRows = get$allTableRows();
            if ( allTableRows.length <= 0 ) {
                get$selectAllCheckbox().attr( 'checked', false );
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
    
    var bindRowsEvents = function( $selection ){

        // Select/deselect on row click
        if ( modeOnRowClickOn ) {
            $selection.click( function () {
                invertRowSelection( $( this ) );
            });
        }

        // Select/deselect checkbox column
        if ( ! modeOnRowClickOn && modeCheckBoxOn ) {
            $selection.find( '.zcrud-select-row' ).click( function () {
                invertRowSelection( $( this ).parents( 'tr' ) );
            });
        }
    };
    
    var bindEventsIn1Row = function( $row ){
        bindRowsEvents( $row );
    };
    
    var bindEvents = function(){
        
        bindKeyboardEvents();   
        bindSelectAllHeader();
        bindRowsEvents( get$allTableRows() );
    };
    
    // Invert selection state of a single row
    var invertRowSelection = function ( $row ) {
        
        if ( $row.hasClass( 'zcrud-row-selected' ) ) {
            _deselectRows( $row );
            
        } else {
            // Shift key?
            if ( shiftKeyDown ) {
                var $mappedArray = buildMappedArray( get$allTableRows() );
                var rowIndex = findRowIndex( $row, $mappedArray );
                
                // Try to select row and above rows until first selected row
                var beforeIndex = findFirstSelectedRowIndexBeforeIndex( rowIndex, $mappedArray ) + 1;
                if ( beforeIndex > 0 && beforeIndex < rowIndex ) {
                    _selectRows( 
                        buildJqueryWrapped(
                            $mappedArray.slice( beforeIndex, rowIndex + 1 ) ) );
                } else {
                    // Try to select row and below rows until first selected row
                    var afterIndex = findFirstSelectedRowIndexAfterIndex( rowIndex, $mappedArray ) - 1;
                    if ( afterIndex > rowIndex ) {
                        _selectRows( 
                            buildJqueryWrapped(
                                $mappedArray.slice( rowIndex, afterIndex + 1 ) ) );
                    } else {
                        // Just select this row
                        _selectRows( $row );
                    }
                }
            } else {
                _selectRows( $row );
            }
        }

        onSelectionChanged();
    };

    // Find index of a row in table.
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
    
    // Look for a selected row (that is before given row index) to up and returns it's index 
    var findFirstSelectedRowIndexBeforeIndex = function ( rowIndex, $tableRows ) {
        
        for ( var i = rowIndex - 1; i >= 0; --i ) {
            if ( $tableRows[i].hasClass( 'zcrud-row-selected' ) ) {
                return i;
            }
        }
        return -1;
    };
    
    // Look for a selected row (that is after given row index) to down and returns it's index 
    var findFirstSelectedRowIndexAfterIndex = function ( rowIndex, $tableRows ) {
        
        for ( var i = rowIndex + 1; i < $tableRows.length; ++i ) {
            if ( $tableRows[i].hasClass( 'zcrud-row-selected' ) ) {
                return i;
            }
        }
        return -1;
    };
    
    // Make row/rows 'selected'
    var _selectRows = function ( $rows ) {
        
        if ( ! thisOptions.multiple ) {
            _deselectRows( get$selectedRows() );
        }

        $rows.addClass( 'zcrud-row-selected' );

        if ( modeCheckBoxOn ) {
            $rows.find( '.zcrud-select-row' ).prop( 'checked', true );
        }

        refreshSelectAllCheckboxState();
    };
    
    // Make row/rows 'non selected'
    var _deselectRows =  function ( $rows ) {
        
        $rows.removeClass( 'zcrud-row-selected' );
        if ( modeCheckBoxOn ) {
            $rows.find( '.zcrud-select-row' ).prop( 'checked', false );
        }

        refreshSelectAllCheckboxState();
    };
    
    // Update state of the 'select/deselect' all checkbox according to count of selected rows
    var refreshSelectAllCheckboxState = function () {
        
        if ( ! modeCheckBoxOn || ! thisOptions.multiple ) {
            return;
        }

        var totalRowCount = get$allTableRows().length;
        var selectedRowCount = get$selectedRows().length;

        if ( selectedRowCount == 0 ) {
            get$selectAllCheckbox().prop( 'indeterminate', false );
            get$selectAllCheckbox().attr( 'checked', false );
            
        } else if ( selectedRowCount == totalRowCount ) {
            get$selectAllCheckbox().prop( 'indeterminate', false );
            get$selectAllCheckbox().attr( 'checked', true );
            
        } else {
            get$selectAllCheckbox().attr( 'checked', false );
            get$selectAllCheckbox().prop( 'indeterminate', true );
        }
    };
    
    var deselectAll = function(){
        deselectRows( get$allTableRows() );
    };
    
    var selectRows = function( $rows ){
        _selectRows( $rows );
        onSelectionChanged(); //TODO: trigger only if selected rows changes?
    };
    
    var deselectRows = function( $rows ){
        _deselectRows( $rows );
        onSelectionChanged(); //TODO: trigger only if selected rows changes?
    };
    
    var selectRecords = function( records ){
        selectionOperationOnRecords( records, selectRows);
    };
    
    var deselectRecords = function( records ){
        selectionOperationOnRecords( records, deselectRows);
    };
    
    var selectionOperationOnRecords = function( records, operationFunction ){

        if ( ! records ){
            return;
        }

        var selector = '';
        for ( var c = 0; c < records.length; ++c ){
            var record = records[ c ];
            if ( c > 0 ){
                selector += ', ';
            }
            var key = record[ options.key ];
            selector += "[data-record-key='" + key + "']";
        }

        if ( selector ){
            operationFunction( get$allTableRows().filter( selector ) );
        }
    };
    
    // Get all selected rows
    var get$selectedRows = function(){
        return parent.get$().find( '.zcrud-row-selected:not(.zcrud-hidden)' );
    };
    
    var getSelectedRecords = function(){

        var result = [];

        var $selectedRows = get$selectedRows();
        $selectedRows.each( function( index ) {
            var $row = $( this );
            //var key = $row.data( 'record-key' );
            //var record = parent.getRecordByKey( key, $row );
            var record = fieldUtils.buildRecordFromSelection( parent.getFields(), $row );
            result.push( record );
        });
        
        return result;
    };
    
    var onSelectionChanged = function () {
        
        options.events.selectionChanged({
            '$rows': get$selectedRows(),
            records: getSelectedRecords(),
            options: options
        });
    };
    
    var resetPage = function(){
        
        get$selectAllCheckbox().prop( 'indeterminate', false )
                               .attr( 'checked', false );
    };
    
    return {
        bindEvents: bindEvents,
        getThisOptions: getThisOptions,
        selectRecords: selectRecords,
        selectRows: selectRows,
        deselectRecords: deselectRecords,
        deselectRows: deselectRows,
        getSelectedRows: get$selectedRows,
        getSelectedRecords: getSelectedRecords,
        resetPage: resetPage,
        bindEventsIn1Row: bindEventsIn1Row,
        deselectAll: deselectAll
    };
};
