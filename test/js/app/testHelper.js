/* 
    testHelper singleton class
*/
var $ = require( 'jquery' );
var testUtils = require( './testUtils.js' );

module.exports = (function() {
    "use strict";

    var getCurrentList = function( options ){
        return  $( '#' + options.pages.list.id );
    };
    
    var countVisibleRows = function( options ){
        return getCurrentList( options ).find( '.zcrud-data-row:not(:hidden)' ).length;
    };
    
    var pagingInfo = function( options ){
        return getCurrentList( options ).find( '.zcrud-page-info' ).html();
    };
    
    var getAllValues = function( selector ){
        return $( selector ).map( function( index, element ) {
            //return this.innerHTML;
            return this.innerText;
        } ).get().join( '/' );
    }
    
    var getAllFieldsValues = function( selector ){
        return $( selector ).find( 'input' ).map( function( index, element ) {
            return this.value;
        } ).get().join( '/' );
    };
    
    var getColumnValues = function( fieldId, isFormField ){
        
        return isFormField?
            getAllFieldsValues( '.' + 'zcrud-column-data-' + fieldId + ':not(:hidden)' ):
            getAllValues( '.' + 'zcrud-column-data-' + fieldId + ':not(:hidden)' );
    };
    
    var getPageListInfo = function( options ){
        
        var info = {
            notActive: [],
            active: []
        };
        
        getCurrentList( options ).find( '.zcrud-page-list' ).children().filter( ':visible' ).each( function( index ) {
            var $this = $( this );
            var id = $this.text().trim();
            
            if ( '...' === id ){
                return;    
            }
            
            var active = ! $this.hasClass( 'zcrud-page-number-disabled' );
            var currentList = active? info.active: info.notActive;
            currentList.push( id );
        });
            
        return info;
    };
    
    var checkPageListInfo = function( assert, options, expectedNotActiveArray, expectedActiveArray ){

        var info = getPageListInfo( options );
        assert.deepEqual( info.active, expectedActiveArray );
        assert.deepEqual( info.notActive, expectedNotActiveArray );
    };

    var goToPage = function( options, pageId ){
        
        var $page = getCurrentList( options ).find( '.zcrud-page-list' ).children().filter( 
            function() {
                return $( this ).text() == pageId;
            });
        $page.trigger( 'click' );
    };
    
    var getPageByClass  = function( options, cssClass ){
        return getCurrentList( options ).find( '.zcrud-page-list' ).children().filter( '.' + cssClass );
    };
    
    var goToPageUsingCombobox = function( options, pageId ){
        var $combobox = $( '#' + options.pages.list.components.paging.goToPageComboboxId );
        $combobox.val( pageId );
        $combobox.trigger( 'change' );
    };
    
    var goToClass = function( options, cssClass ){
        getPageByClass( options, cssClass ).trigger( 'click' );
    };
    
    var goToNextPage = function( options ){
        goToClass( options, 'zcrud-page-number-next' );
    };

    var goToPreviousPage = function( options ){
        goToClass( options, 'zcrud-page-number-previous' );
    };
    
    var goToFirstPage = function( options ){
        goToClass( options, 'zcrud-page-number-first' );
    };
    
    var goToLastPage = function( options ){
        goToClass( options, 'zcrud-page-number-last' );
    };
    
    var changeSize = function( options, size ){
        var $combobox = $( '#' + options.pages.list.components.paging.pageSizeChangeComboboxId );
        $combobox.val( size );
        $combobox.trigger( 'change' );
    };
    
    var filtering = function( options, filter ){
        $( '#zcrud-name-filter' ).val( filter );
        $( '#zcrud-filtering' ).find( '.zcrud-filter-submit-button' ).trigger( 'click' );
    };
    
    var pagingTest = function( testOptions ){
        
        var assert = testOptions.assert;
        var options = testOptions.options;
        
        if ( testOptions.action ){
            if ( testOptions.action.pageId ){
                goToPage( options, testOptions.action.pageId );
            } else if ( testOptions.action.pageIdCombo ){
                goToPageUsingCombobox( options, testOptions.action.pageIdCombo );
            } else if ( testOptions.action.nextPage ){
                goToNextPage( options );
            } else if ( testOptions.action.previousPage ){
                goToPreviousPage( options );
            } else if ( testOptions.action.firstPage ){
                goToFirstPage( options );
            } else if ( testOptions.action.lastPage ){
                goToLastPage( options );
            } else if ( testOptions.action.changeSize ){
                changeSize( options, testOptions.action.changeSize );
            } else if ( testOptions.action.filter != undefined ){
                filtering( options, testOptions.action.filter );
            }
        }
        
        assert.equal( countVisibleRows( options ), testOptions.visibleRows );
        assert.equal( pagingInfo( options ), testOptions.pagingInfo );
        assert.equal( getColumnValues( 'id', testOptions.editable ), testOptions.ids );
        assert.equal( getColumnValues( 'name', testOptions.editable ), testOptions.names );
        checkPageListInfo( assert, options, testOptions.pageListNotActive, testOptions.pageListActive );
    };
    
    var multiplePagingTest = function( testOptions ){
        
        var assert = testOptions.assert;
        var options = testOptions.options;
        //var ids = testOptions.ids;
        //var names = testOptions.names;
        var values = testOptions.values;
        var c = 0;
        
        pagingTest({
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 1-10 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '<<', '<', '1' ],
            pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                pageId: '2' 
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 11-20 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '2' ],
            pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                nextPage: true
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 21-30 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '3' ],
            pageListActive: [ '<<', '<', '1', '2', '4', '5', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                previousPage: true
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 11-20 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '2' ],
            pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                firstPage: true
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 1-10 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '<<', '<', '1' ],
            pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                lastPage: true
            },
            options: options,
            assert: assert,
            visibleRows: 9,
            pagingInfo: 'Showing 121-129 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '13', '>', '>>' ],
            pageListActive: [ '<<', '<', '1', '9', '10', '11', '12' ]
        });
        pagingTest({
            action: { 
                pageIdCombo: '8'
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 71-80 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '8' ],
            pageListActive: [ '<<', '<', '1', '6', '7', '9', '10', '13', '>', '>>' ]
        });
        pagingTest({
            action: { 
                changeSize: '25'
            },
            options: options,
            assert: assert,
            visibleRows: 25,
            pagingInfo: 'Showing 1-25 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '<<', '<', '1' ],
            pageListActive: [ '2', '3', '4', '5', '6', '>', '>>' ]
        });
        pagingTest({
            action: { 
                nextPage: true
            },
            options: options,
            assert: assert,
            visibleRows: 25,
            pagingInfo: 'Showing 26-50 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '2' ],
            pageListActive: [ '<<', '<', '1', '3', '4', '5', '6', '>', '>>' ]
        });
        pagingTest({
            action: { 
                changeSize: '10'
            },
            options: options,
            assert: assert,
            visibleRows: 10,
            pagingInfo: 'Showing 1-10 of 129',
            //ids: ids[ c ],
            //names: names[ c++ ],
            ids:  values[ c ][ 0 ],
            names: values[ c++ ][ 1 ],
            pageListNotActive: [ '<<', '<', '1' ],
            pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
        });
    };
    /*
    var buildIdsList = function( start, end ){
        
        var result = '' + start;
        for ( var c = 1 + start; c <= end; ++c ){
            result += '/' + c;
        }
        return result;
    };
    
    var buildServicesList = function( start, end ){

        var result = 'Service ' + start;
        for ( var c = 1 + start; c <= end; ++c ){
            result += '/Service ' + c;
        }
        return result;
    };*/
    
    var buildValuesList = function( start, end ){

        var ids = '' + start;
        var services = 'Service ' + start;
        for ( var c = 1 + start; c <= end; ++c ){
            ids += '/' + c;
            services += '/Service ' + c;
        }
        
        var result = [];
        result.push( ids );
        result.push( services );
        return result;
    };
    
    var buildCustomValuesList = function( ){
        
        var ids = '';
        var services = '';
        var addSlash = false;
        for ( var c = 0, j = arguments.length; c < j; c++ ){
            if ( addSlash ){
                ids += '/';
                services += '/';
            }
            addSlash = true;
            var item = arguments[ c ];
            if ( ! $.isArray( item ) ){
                ids += item;
                services += 'Service ' + item;
            } else {
                ids += item[ 0 ];
                services += item[ 1 ];
            }
        }
        
        var result = [];
        result.push( ids );
        result.push( services );
        return result;
    };
    
    var keyEvent = function( key, event ){
        var e = $.Event( event, { which: key } );
        $( 'body' ).trigger( e );
    };
    var keyDown = function( key ){
        keyEvent( key, 'keydown' );
    };
    var keyUp = function( key ){
        keyEvent( key, 'keyup' );
    };
    /*
    var $container = $( '#departmentsContainer' );
    var get$container = function(){
        if ( ! $container ){
            $container = $( '#departmentsContainer' );
        }
        return $container;
    };*/
    /*
    var $tbody = undefined;
    var get$tbody = function(){
        if ( ! $tbody ){
            $tbody = $( '#zcrud-list-tbody-department' );
        }
        return $tbody;
    };*/
    
    var getRow = function( key ){
        
        if ( ! key ){
            alert( 'Error: null key in getRow method!' );
            return;
        }
        
        return $( '#zcrud-list-tbody-department' ).find( "[data-record-key='" + key + "']" );
    };
    var getLastRow = function(){
        return $( '#zcrud-list-tbody-department' ).find( 'tr:last' );
    };
    
    var getFieldValue = function( $selection ){
        return $selection.find( 'input' ).val();
    };
    
    var checkRecord = function( assert, key, expectedRecord, editable, checkOnlyStorage ){
        
        if ( ! checkOnlyStorage ){
        
            // Check record from zCrud
            var record = $( '#departmentsContainer' ).zcrud( 'getRecordByKey', key );
            //alert( JSON.stringify( record ) );
            assert.deepEqual( record, expectedRecord );

            // Check record from table
            var row = $( '#zcrud-list-tbody-department' ).find( "[data-record-key='" + key + "']" );
            var id = editable?
                     getFieldValue ( row.find( "td.zcrud-column-data-id" ) ).trim():
                     row.find( "td.zcrud-column-data-id" ).text().trim();
            var name = editable?
                     getFieldValue ( row.find( "td.zcrud-column-data-name" ) ).trim():
                     row.find( "td.zcrud-column-data-name" ).text().trim();
            assert.equal( id, expectedRecord.id );
            assert.equal( name, expectedRecord.name );
        }
        
        // Check record from storage
        assert.deepEqual( testUtils.getService( key ), expectedRecord );
    };
    
    var checkNoRecord = function( assert, key ){
        
        // Check record from zCrud
        var record = $( '#departmentsContainer' ).zcrud( 'getRecordByKey', key );
        assert.equal( record, undefined );

        // Check record from table
        var row = $( '#zcrud-list-tbody-department' ).find( "[data-record-key='" + key + "']" );
        assert.equal( row.length, 0 );
        
        // Check record from storage
        assert.equal( testUtils.getService( key ), undefined );
    };
    
    var clickRowButton = function( $row, cssClass ){
        $row.find( cssClass ).trigger( 'click' );
    };
    var clickListButton = function( key, cssClass ){
        /*
        var row = $( '#zcrud-list-tbody-department' ).find( "[data-record-key='" + key + "']" );
        row.find( cssClass ).trigger( 'click' );*/
        clickRowButton(
            $( '#zcrud-list-tbody-department' ).find( "[data-record-key='" + key + "']" ),
            cssClass
        );
    };
    var clickDeleteListButton = function( key ){
        clickListButton( key, '.zcrud-delete-command-button' );
    };
    var clickUpdateListButton = function( key ){
        clickListButton( key, '.zcrud-edit-command-button' );
    };
    var clickDeleteRowListButton = function( key ){
        clickListButton( key, '.zcrud-delete-row-command-button' );
    };
    var clickLastDeleteRowListButton = function(){
        clickRowButton(
            getLastRow(),
            '.zcrud-delete-row-command-button'
        );
    };
    var clickCreateRowListButton = function(){
        $( '#zcrud-list-department' ).find( '.zcrud-new-row-command-button' ).trigger( 'click' );
    };
    var clickCreateListButton = function(){
        $( '#zcrud-list-department' ).find( '.zcrud-new-command-button' ).trigger( 'click' );
    };
    var clickFormCancelButton = function(){
        $( '#form-cancel-button' ).trigger( 'click' );
    };
    var clickFormSubmitButton = function(){
        $( '#form-submit-button' ).trigger( 'click' );
    };
    
    var getSaveButton = function(){
        return $( '#departmentsContainer' ).find( '.zcrud-save-command-button' );
    };
    var clickEditableListSubmitButton = function(){
        getSaveButton().trigger( 'click' );
    };
    var saveEnabled = function(){
        return ! getSaveButton().prop( "disabled" );
    };
    
    var getUndoButton = function(){
        return $( '#departmentsContainer' ).find( '.zcrud-undo-command-button' );
    };
    var clickUndoButton = function(){
        getUndoButton().trigger( 'click' );
    };
    var getNumberOfUndoActions = function(){
        return Number( getUndoButton().text().replace( /[^0-9]/g, "" ) );
    };
    
    var getRedoButton = function(){
        return $( '#departmentsContainer' ).find( '.zcrud-redo-command-button' );
    };
    var clickRedoButton = function(){
        getRedoButton().trigger( 'click' );
    };
    var getNumberOfRedoActions = function(){
        return Number( getRedoButton().text().replace( /[^0-9]/g, "" ) );
    };
    
    var fillForm = function( record ){

        if ( record.id !== undefined ){
            $( '#zcrud-id' ).val( record.id );
        }
        if ( record.name !== undefined ){
            $( '#zcrud-name' ).val( record.name );
        }
        if ( record.description !== undefined ){
            $( '#zcrud-description' ).val( record.description );
        }
        if ( record.date !== undefined ){
            $( '#zcrud-date' ).val( record.date );
        }
        if ( record.time !== undefined ){
            $( '#zcrud-time' ).val( record.time );
        }
        if ( record.datetime !== undefined ){
            $( '#zcrud-datetime' ).val( record.datetime );
        }
        if ( record.phoneType !== undefined ){
            $( 'input:radio[name=zcrud-phoneType]' ).filter( '[value=' + record.phoneType + ']' ).prop( 'checked', true );
        }
        if ( record.province !== undefined ){
            $( '#zcrud-province' ).val( record.province );
        }
        if ( record.city !== undefined ){
            $( '#zcrud-city' ).val( record.city );
        }
        if ( record.browser !== undefined ){
            $( '#zcrud-browser' ).val( record.browser );
        }
        if ( record.important !== undefined ){
            $( '#zcrud-important' ).prop( 'checked', record.important );
        }
        if ( record.number !== undefined ){
            $( '#zcrud-number' ).val( record.number );
        }
    };
    
    var checkForm = function( assert, record ){

        assert.equal( $( '#zcrud-id' ).val(), record.id );
        assert.equal( $( '#zcrud-name' ).val(), record.name );
        assert.equal( $( '#zcrud-description' ).val(), record.description );
        assert.equal( $( '#zcrud-date' ).val(), record.date );
        assert.equal( $( '#zcrud-time' ).val(), record.time );
        assert.equal( $( '#zcrud-datetime' ).val(), record.datetime );
        assert.equal( $( 'input:radio[name=zcrud-phoneType]' ).filter( '[value=' + record.phoneType + ']' ).prop( 'checked' ), true );
        assert.equal( $( '#zcrud-province' ).val(), record.province );
        assert.equal( $( '#zcrud-city' ).val(), record.city );
        assert.equal( $( '#zcrud-browser' ).val(), record.browser );
        assert.equal( $( '#zcrud-important' ).prop( 'checked' ), record.important );
        assert.equal( $( '#zcrud-number' ).val(), record.number );
    };
    
    var setRowInputVal = function( $row, record, name ){
        var $input = $row.find( "input[name='" + name +"']" );
        $input.val( record[ name ] );
        $input
            .trigger( 'change' )
            .trigger( 'blur' );
    };
    
    var getRowInputVal = function( $row, name ){
        return $row.find( "input[name='" + name +"']" ).val();
    };
    
    var fill = function( record, $row ){
        
        if ( record.id !== undefined ){
            setRowInputVal( $row, record, 'id' );
        }
        if ( record.name !== undefined ){
            setRowInputVal( $row, record, 'name' );
        }
        if ( record.description !== undefined ){
            setRowInputVal( $row, record, 'description' );
        }
        if ( record.date !== undefined ){
            setRowInputVal( $row, record, 'date' );
        }
        if ( record.time !== undefined ){
            setRowInputVal( $row, record, 'time' );
        }
        if ( record.datetime !== undefined ){
            setRowInputVal( $row, record, 'datetime' );
        }
        if ( record.phoneType !== undefined ){
            $( 'input:radio[name=zcrud-phoneType]' ).filter( '[value=' + record.phoneType + ']' ).prop( 'checked', true );
        }
        if ( record.province !== undefined ){
            setRowInputVal( $row, record, 'province' );
        }
        if ( record.city !== undefined ){
            setRowInputVal( $row, record, 'city' );
        }
        if ( record.browser !== undefined ){
            setRowInputVal( $row, record, 'browser' );
        }
        if ( record.important !== undefined ){
            $( '#zcrud-important' ).prop( 'checked', record.important );
        }
        if ( record.number !== undefined ){
            setRowInputVal( $row, record, 'number' );
        }
    };
    
    var fillNewRowEditableList = function( record ){
        fill( record, getLastRow() );
    };
    
    var fillEditableList = function( record, id ){
        fill( record, getRow( id ) );
    };
    
    var checkEditableListForm = function( assert, id, record ){
        
        var $row = getRow( id );
        
        if ( record.id !== undefined ){
            assert.equal( getRowInputVal( $row, 'id' ), record.id );
        }
        if ( record.name !== undefined ){
            assert.equal( getRowInputVal( $row, 'name' ), record.name );
        }
        if ( record.description !== undefined ){
            assert.equal( getRowInputVal( $row, 'description' ).val(), record.description );
        }
        if ( record.date !== undefined ){
            assert.equal( getRowInputVal( $row, 'date' ), record.date );
        }
        if ( record.time !== undefined ){
            assert.equal( getRowInputVal( $row, 'time' ), record.time );
        }
        if ( record.datetime !== undefined ){
            assert.equal( getRowInputVal( $row, 'datetime' ).val(), record.datetime );
        }
        if ( record.phoneType !== undefined ){
            //assert.equal( $( 'input:radio[name=zcrud-phoneType]' ).filter( '[value=' + record.phoneType + ']' ).prop( 'checked' ), true );
        }
        if ( record.province !== undefined ){
            assert.equal( getRowInputVal( $row, 'province' ), record.province );
        }
        if ( record.city !== undefined ){
            assert.equal( getRowInputVal( $row, 'city' ), record.city );
        }
        if ( record.browser !== undefined ){
            assert.equal( getRowInputVal( $row, 'browser' ), record.browser );
        }
        if ( record.important !== undefined ){
            //assert.equal( $( '#zcrud-important' ).prop( 'checked' ), record.important );
        }
        if ( record.number !== undefined ){
            assert.equal( getRowInputVal( $row, 'number' ), record.number );
        }
    };
    
    var assertHistory = function( assert, expectedUndoActions, expectedRedoActions, expectedSaveEnabled ){
        assert.equal( getNumberOfUndoActions(), expectedUndoActions );
        assert.equal( getNumberOfRedoActions(), expectedRedoActions );
        assert.equal( saveEnabled(), expectedSaveEnabled );
    };
    
    return {
        countVisibleRows: countVisibleRows,
        pagingInfo: pagingInfo,
        getColumnValues: getColumnValues,
        //getPageListInfo: getPageListInfo,
        checkPageListInfo: checkPageListInfo,
        goToPage: goToPage,
        pagingTest: pagingTest,
        multiplePagingTest: multiplePagingTest,
        //buildIdsList: buildIdsList,
        //buildServicesList: buildServicesList,
        buildValuesList: buildValuesList,
        buildCustomValuesList: buildCustomValuesList,
        getCurrentList: getCurrentList,
        keyDown: keyDown,
        keyUp: keyUp,
        checkRecord: checkRecord,
        checkNoRecord: checkNoRecord,
        clickDeleteListButton: clickDeleteListButton,
        clickDeleteRowListButton: clickDeleteRowListButton,
        clickLastDeleteRowListButton: clickLastDeleteRowListButton,
        clickUpdateListButton: clickUpdateListButton,
        clickCreateListButton: clickCreateListButton,
        clickCreateRowListButton: clickCreateRowListButton,
        clickFormCancelButton: clickFormCancelButton,
        clickFormSubmitButton: clickFormSubmitButton,
        fillForm: fillForm,
        checkForm: checkForm,
        fillEditableList: fillEditableList,
        fillNewRowEditableList: fillNewRowEditableList,
        checkEditableListForm: checkEditableListForm,
        clickEditableListSubmitButton: clickEditableListSubmitButton,
        clickUndoButton: clickUndoButton,
        clickRedoButton: clickRedoButton,
        assertHistory: assertHistory
    };
})();
