/* 
    SelectingComponent class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );
var Component = require( './component.js' );
var pageUtils = require( '../pages/pageUtils.js' );
var fieldUtils = require( '../fields/fieldUtils.js' );

var SelectingComponent = function( optionsToApply, thisOptionsToApply, parentToApply, pageToApply ) {

    Component.call( this, optionsToApply, thisOptionsToApply, parentToApply, pageToApply );
    
    this.shiftKeyDown = false; // True, if shift key is currently down
    this.modeOnRowClickOn =  -1 != this.thisOptions.mode.indexOf( 'onRowClick' );
    this.modeCheckBoxOn =  -1 != this.thisOptions.mode.indexOf( 'checkbox' );
};
Component.doSuperClassOf( SelectingComponent );

SelectingComponent.prototype.bindKeyboardEvents = function (){
    
    // Register to events to set shiftKeyDown value
    var instance = this;
    
    $( document )
        .keydown( 
            function ( event ) {
                switch ( event.which ) {
                    case 16:
                        instance.shiftKeyDown = true;
                        break;
                }
            }
    )
        .keyup( 
            function ( event ) {
                switch ( event.which ) {
                    case 16:
                        instance.shiftKeyDown = false;
                        break;
                }
            }
    );
};

// Return a reference to the 'select/deselect all' checkbox (jQuery object)
SelectingComponent.prototype.get$selectAllCheckbox = function(){
    return this.parent.get$().find( '.zcrud-select-all-rows' );
};

SelectingComponent.prototype.get$allTableRows = function(){
    return this.parent.get$().find( 'tr.zcrud-data-row' );
};

SelectingComponent.prototype.bindSelectAllHeader = function(){

    var instance = this;
    this.get$selectAllCheckbox().click( 
        function () {
            var allTableRows = instance.get$allTableRows();
            if ( allTableRows.length <= 0 ) {
                instance.get$selectAllCheckbox().attr( 'checked', false );
                return;
            }

            if ( $( this ).is( ':checked' ) ) {
                instance._selectRows( allTableRows );
            } else {
                instance._deselectRows( allTableRows );
            }

            instance.onSelectionChanged();
        }
    );
};

SelectingComponent.prototype.bindRowsEvents = function( $selection ){

    var instance = this;
    
    // Select/deselect on row click
    if ( this.modeOnRowClickOn ) {
        $selection.click( 
            function () {
                instance.invertRowSelection( $( this ) );
            }
        );
    }

    // Select/deselect checkbox column
    if ( ! this.modeOnRowClickOn && this.modeCheckBoxOn ) {
        $selection.find( '.zcrud-select-row' ).click( 
            function () {
                instance.invertRowSelection( $( this ).parents( 'tr' ) );
            }
        );
    }
};

SelectingComponent.prototype.bindEventsIn1Row = function( $row ){
    this.bindRowsEvents( $row );
};

SelectingComponent.prototype.bindEvents = function(){

    this.bindKeyboardEvents();   
    this.bindSelectAllHeader();
    this.bindRowsEvents( this.get$allTableRows() );
};

// Invert selection state of a single row
SelectingComponent.prototype.invertRowSelection = function ( $row ) {

    if ( $row.hasClass( 'zcrud-row-selected' ) ) {
        this._deselectRows( $row );

    } else {
        // Shift key?
        if ( this.shiftKeyDown ) {
            var $mappedArray = this.buildMappedArray( this.get$allTableRows() );
            var rowIndex = this.findRowIndex( $row, $mappedArray );

            // Try to select row and above rows until first selected row
            var beforeIndex = this.findFirstSelectedRowIndexBeforeIndex( rowIndex, $mappedArray ) + 1;
            if ( beforeIndex > 0 && beforeIndex < rowIndex ) {
                this._selectRows( 
                    this.buildJqueryWrapped(
                        $mappedArray.slice( beforeIndex, rowIndex + 1 ) ) );
            } else {
                // Try to select row and below rows until first selected row
                var afterIndex = this.findFirstSelectedRowIndexAfterIndex( rowIndex, $mappedArray ) - 1;
                if ( afterIndex > rowIndex ) {
                    this._selectRows( 
                        this.buildJqueryWrapped(
                            $mappedArray.slice( rowIndex, afterIndex + 1 ) ) );
                } else {
                    // Just select this row
                    this._selectRows( $row );
                }
            }
        } else {
            this._selectRows( $row );
        }
    }

    this.onSelectionChanged();
};

// Find index of a row in table.
SelectingComponent.prototype.findRowIndex = function ( $row, $tableRows ) {

    return pageUtils.findIndexInArray( $row, $tableRows, function ( $row1, $row2 ) {
        return $row1.html() === $row2.html();
    });
};

SelectingComponent.prototype.buildMappedArray = function( $tableRows ){

    return $tableRows.map( function( index, element ) {
        return $( this );
    }).get();
};

SelectingComponent.prototype.buildJqueryWrapped = function( array ){

    return $( array ).map ( function (){
        return this.toArray();
    });
};

// Look for a selected row (that is before given row index) to up and returns it's index 
SelectingComponent.prototype.findFirstSelectedRowIndexBeforeIndex = function ( rowIndex, $tableRows ) {

    for ( var i = rowIndex - 1; i >= 0; --i ) {
        if ( $tableRows[i].hasClass( 'zcrud-row-selected' ) ) {
            return i;
        }
    }
    
    return -1;
};

// Look for a selected row (that is after given row index) to down and returns it's index 
SelectingComponent.prototype.findFirstSelectedRowIndexAfterIndex = function ( rowIndex, $tableRows ) {

    for ( var i = rowIndex + 1; i < $tableRows.length; ++i ) {
        if ( $tableRows[i].hasClass( 'zcrud-row-selected' ) ) {
            return i;
        }
    }
    return -1;
};

// Make row/rows 'selected'
SelectingComponent.prototype._selectRows = function ( $rows ) {

    if ( ! this.thisOptions.multiple ) {
        this._deselectRows( this.get$selectedRows() );
    }

    $rows.addClass( 'zcrud-row-selected' );

    if ( this.modeCheckBoxOn ) {
        $rows.find( '.zcrud-select-row' ).prop( 'checked', true );
    }

    this.refreshSelectAllCheckboxState();
};

// Make row/rows 'non selected'
SelectingComponent.prototype._deselectRows =  function ( $rows ) {

    $rows.removeClass( 'zcrud-row-selected' );
    if ( this.modeCheckBoxOn ) {
        $rows.find( '.zcrud-select-row' ).prop( 'checked', false );
    }

    this.refreshSelectAllCheckboxState();
};

// Update state of the 'select/deselect' all checkbox according to count of selected rows
SelectingComponent.prototype.refreshSelectAllCheckboxState = function () {

    if ( ! this.modeCheckBoxOn || ! this.thisOptions.multiple ) {
        return;
    }

    var totalRowCount = this.get$allTableRows().length;
    var selectedRowCount = this.get$selectedRows().length;

    if ( selectedRowCount == 0 ) {
        this.get$selectAllCheckbox().prop( 'indeterminate', false );
        this.get$selectAllCheckbox().attr( 'checked', false );

    } else if ( selectedRowCount == totalRowCount ) {
        this.get$selectAllCheckbox().prop( 'indeterminate', false );
        this.get$selectAllCheckbox().attr( 'checked', true );

    } else {
        this.get$selectAllCheckbox().attr( 'checked', false );
        this.get$selectAllCheckbox().prop( 'indeterminate', true );
    }
};

SelectingComponent.prototype.deselectAll = function(){
    this.deselectRows( this.get$allTableRows() );
};

SelectingComponent.prototype.selectRows = function( $rows ){
    this._selectRows( $rows );
    this.onSelectionChanged(); //TODO: trigger only if selected rows changes?
};

SelectingComponent.prototype.deselectRows = function( $rows ){
    this._deselectRows( $rows );
    this.onSelectionChanged(); //TODO: trigger only if selected rows changes?
};

SelectingComponent.prototype.selectRecords = function( records ){
    this.selectionOperationOnRecords( records, this.selectRows );
};

SelectingComponent.prototype.deselectRecords = function( records ){
    this.selectionOperationOnRecords( records, this.deselectRows );
};

SelectingComponent.prototype.selectionOperationOnRecords = function( records, operationFunction ){

    if ( ! records ){
        return;
    }

    var selector = '';
    for ( var c = 0; c < records.length; ++c ){
        var record = records[ c ];
        if ( c > 0 ){
            selector += ', ';
        }
        var key = record[ this.options.key ];
        selector += "[data-record-key='" + key + "']";
    }

    if ( selector ){
        operationFunction.call( this, this.get$allTableRows().filter( selector ) );
    }
};

// Get all selected rows
SelectingComponent.prototype.get$selectedRows = function(){
    return this.parent.get$().find( '.zcrud-row-selected:not(.zcrud-hidden)' );
};
SelectingComponent.prototype.getSelectedRows = SelectingComponent.prototype.get$selectedRows;

SelectingComponent.prototype.getSelectedRecords = function(){

    var result = [];
    var instance = this;
    
    var $selectedRows = this.get$selectedRows();
    $selectedRows.each( 
        function( index ) {
            var $row = $( this );

            // Get record
            var record;
            var key = $row.data( 'record-key' );
            if ( key != undefined ){
                record = instance.parent.getRecordByKey( key, $row, true );
            } else {
                var recordId = $row.data( 'record-id' );
                if ( recordId != undefined ){
                    record = instance.parent.getFromAddedRecords( recordId );
                } else {
                    throw 'No selected row!';
                }
            }

            result.push( record );
        }
    );

    return result;
};

SelectingComponent.prototype.onSelectionChanged = function () {

    this.options.events.selectionChanged({
        '$rows': this.get$selectedRows(),
        records: this.getSelectedRecords(),
        options: this.options
    });
};

SelectingComponent.prototype.resetPage = function(){

    this.get$selectAllCheckbox().prop( 'indeterminate', false )
        .attr( 'checked', false );
};

module.exports = SelectingComponent;
