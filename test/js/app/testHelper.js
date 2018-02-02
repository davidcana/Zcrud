/* 
    testHelper singleton class
*/
var $ = require( 'jquery' );
var testUtils = require( './testUtils.js' );

module.exports = (function() {
    "use strict";

    var defaultOptionValue = '';
    
    var get$Container = function(){
        return $( '#departmentsContainer' );
    };
    var get$Tbody = function(){
        return $( '#zcrud-list-tbody-department' );
        //return get$Container().filter( 'tbody' );
    };
    var get$Filtering = function(){
        return $( '#zcrud-filtering' );
        //return get$Container().filter( '.zcrud-filtering' );
    };
    var get$Form = function(){
        return $( '#department-form' );
        //return get$Container().filter( '.zcrud-form' );
    };
    var get$FormFieldByNameClass = function( name ){
        return get$Form().find( ".zcrud-field-" + name );
    };
    var get$List = function(){
        return $( '#zcrud-list-department' );
        //return get$Container().filter( '.zcrud-list' );
    };  
    
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
        var filterName = 'name';
        get$Filtering().find( "[name='" + filterName +"']" ).val( filter );
        get$Filtering().find( '.zcrud-filter-submit-button' ).trigger( 'click' );
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
    
    var getRow = function( key ){
        
        if ( ! key ){
            alert( 'Error: null key in getRow method!' );
            return;
        }
        
        return get$Tbody().find( "[data-record-key='" + key + "']" );
    };
    var getLastRow = function(){
        return get$Tbody().find( 'tr:last' );
    };
    
    var getFieldValue = function( $selection ){
        return $selection.find( 'input' ).val();
    };
    
    var checkRecord = function( assert, key, expectedRecord, editable, checkOnlyStorage ){
        
        if ( ! checkOnlyStorage ){
        
            // Check record from zCrud
            var record = get$Container().zcrud( 'getRecordByKey', key );
            //alert( JSON.stringify( record ) );
            assert.deepEqual( record, expectedRecord );

            // Check record from table
            var row = get$Tbody().find( "[data-record-key='" + key + "']" );
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
        var record = get$Container().zcrud( 'getRecordByKey', key );
        assert.equal( record, undefined );

        // Check record from table
        var row = get$Tbody().find( "[data-record-key='" + key + "']" );
        assert.equal( row.length, 0 );
        
        // Check record from storage
        assert.equal( testUtils.getService( key ), undefined );
    };
    
    var clickRowButton = function( $row, cssClass ){
        $row.find( cssClass ).trigger( 'click' );
    };
    var clickListButton = function( key, cssClass ){

        clickRowButton(
            get$Tbody().find( "[data-record-key='" + key + "']" ),
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
        get$List().find( '.zcrud-new-row-command-button' ).trigger( 'click' );
    };
    var clickCreateListButton = function(){
        get$List().find( '.zcrud-new-command-button' ).trigger( 'click' );
    };
    var clickFormCancelButton = function(){
        get$Form().find( '.zcrud-form-cancel-command-button' ).trigger( 'click' );
    };
    var clickFormSubmitButton = function(){
        get$Form().find( '.zcrud-form-submit-command-button' ).trigger( 'click' );
    };
    var clickCreateSubformRowButton = function( subformName ){
        get$FormFieldByNameClass( subformName ).find( '.zcrud-subform-new-row-command-button' ).trigger( 'click' );
    };
    var clickDeleteSubformRowButton = function( subformName, subformIndex ){
        get$FormFieldByNameClass( subformName )
            .find( "[data-subform-record-index='" + subformIndex + "'] .zcrud-subform-delete-row-command-button"  )
            .trigger( 'click' );
    };
    
    var getSaveButton = function(){
        return get$Container().find( '.zcrud-save-command-button' );
    };
    var clickEditableListSubmitButton = function(){
        getSaveButton().trigger( 'click' );
    };
    var saveEnabled = function(){
        return ! getSaveButton().prop( "disabled" );
    };
    
    var getUndoButton = function(){
        return get$Container().find( '.zcrud-undo-command-button' );
    };
    var clickUndoButton = function(){
        getUndoButton().trigger( 'click' );
    };
    var getNumberOfUndoActions = function(){
        return Number( getUndoButton().text().replace( /[^0-9]/g, "" ) );
    };
    
    var getRedoButton = function(){
        return get$Container().find( '.zcrud-redo-command-button' );
    };
    var clickRedoButton = function(){
        getRedoButton().trigger( 'click' );
    };
    var getNumberOfRedoActions = function(){
        return Number( getRedoButton().text().replace( /[^0-9]/g, "" ) );
    };
    
    var fillForm = function( record ){

        setFormVal( record, 'id' );
        setFormVal( record, 'name' );
        setFormVal( record, 'description' );
        setFormVal( record, 'date' );
        setFormVal( record, 'time' );
        setFormDatetimeVal( record, 'datetime' );
        setFormRadioVal( record, 'phoneType' );
        setFormVal( record, 'province' );
        setFormVal( record, 'city' );
        setFormVal( record, 'browser' );  
        setFormCheckboxVal( record, 'important' );  
        setFormVal( record, 'number' );
        fillSubform( record, 'members' );
    };

    var fillSubform = function( record, name ){

        var subformRecords = record[ name ];

        if ( subformRecords == undefined ){
            return;
        }
        
        for ( var index in subformRecords ){
            
            var subformRecord = subformRecords[ index ];
            //var $row = get$Form().find( "[data-subform-record-index='" + index + "']" );
            var $row = get$FormFieldByNameClass( name ).find( "[data-subform-record-index='" + index + "']" );
            fillSubformRow( subformRecord, $row, name );
        }
    };
    
    var fillSubformRow = function( subformRecord, $row, subformName ){
        
        setFormVal( subformRecord, 'code', $row, subformName );
        setFormVal( subformRecord, 'name', $row, subformName );
        setFormVal( subformRecord, 'description', $row, subformName );
    };
    
    var fillSubformNewRow = function( subformRecord, subformName ){
        
        fillSubformRow( 
            subformRecord, 
            getSubformLastRow( subformName ), 
            subformName );
    };
    
    var getSubformLastRow = function( subformName ){
        return get$FormFieldByNameClass( subformName ).find( 'tr:last' );
    };
    
    var isVoid = function( value ){
        return value == undefined || value == '';
    };

    var areEquivalent = function( value1, value2 ){

        var value1IsVoid = isVoid( value1 );
        var value2IsVoid = isVoid( value2 );

        return value1IsVoid || value2IsVoid? value1IsVoid && value2IsVoid: value1 === value2;
    };
    
    var checkForm = function( assert, record ){

        assert.ok( 
            areEquivalent( 
                getFormVal( 'id' ), record.id ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'name' ), record.name ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'description' ), record.description ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'date' ), record.date ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'time' ), record.time ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'datetime' ), record.datetime ) );
        assert.ok( 
            areEquivalent( 
                getFormRadioVal( 'phoneType' ), record.phoneType ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'province' ), record.province ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'city' ), record.city ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'browser' ), record.browser ) );
        assert.ok( 
            areEquivalent( 
                getFormCheckboxVal( 'important' ), record.important ) );
        assert.ok( 
            areEquivalent( 
                getFormVal( 'number' ), record.number ) );
        assert.deepEqual( getSubformVal( 'members' ), record.members );
    };
    
    var setFormCheckboxVal = function( record, name, $row ){
        
        if ( record[ name ] === undefined ){
            return;
        }
        
        var $element = $row || get$Form();
        $element.find( "input:checkbox[name='" + name +"']" )
            .prop( 'checked', record[ name ] )
            .trigger( 'change' )
            .trigger( 'blur' );
    };
    
    var setFormRadioVal = function( record, name, $row ){
        
        if ( record[ name ] === undefined ){
            return;
        }
        
        var $element = $row || get$Form();
        var rowIndex = $row? $row.index() - 1: 0;
        var nameAttr = name + '[' + rowIndex + ']';
        $element.find( "input:radio[name='" + nameAttr +"']" ).filter( '[value=' + record[ name ] + ']' )
            .prop( 'checked', true )
            .trigger( 'change' )
            .trigger( 'blur' );
    };
    
    var setFormVal = function( record, name, $row, subformName ){
        
        if ( record[ name ] === undefined ){
            return;
        }
        
        var $element = $row || get$Form();
        var elementName = subformName? subformName + '/' + name: name;
        $element.find( "[name='" + elementName +"']" )
            .val( record[ name ] )
            .trigger( 'change' )
            .trigger( 'blur' );
    };
    
    var setFormDatetimeVal = function( record, name, $row ){
        
        if ( record[ name ] === undefined ){
            return;
        }
        
        var $element = $row || get$Form();
        $element.find( "[name='" + name +"']" )
            .val( record[ name ] )
            .trigger( 'change' );
    };
    
    var getFormVal = function( name, $row, subformName ){
        
        var $element = $row || get$Form();
        var elementName = subformName? subformName + '/' + name: name;
        return $element.find( "[name='" + elementName +"']" ).val();
    };
    
    var getFormRadioVal = function( name, $row ){

        var $element = $row || get$Form();
        var rowIndex = $row? $row.index() - 1: 0;
        var nameAttr = name + '[' + rowIndex + ']';
        var $selected = $element.find( "input:radio[name='" + nameAttr +"']:checked" );
        return $selected? $selected.val(): undefined;
    };
    
    var getFormCheckboxVal = function( name, $row ){

        var $element = $row || get$Form();
        return $element.find( "input:checkbox[name='" + name +"']" ).prop( 'checked' );
    };

    var getSelectOptions = function( name, $row ){

        var result = [];
        var $element = $row || get$Form();

        // Can not use :visible, it does not work in Chrome
        //$element.find( "[name='" + name +"'] option:visible" ).each( function() {
        $element.find( "[name='" + name +"'] option" ).each( function() {
            var value = $( this ).val();
            if ( value !== defaultOptionValue ){
                result.push( value );
            }
        });

        return result;
    };
    
    var getSubformVal = function( name, $row ){
        
        var $element = $row || get$Form();
        var $field = $element.find( ".zcrud-field-" + name );
        
        if ( $field.length === 0 ){
            return undefined;
        }
        
        var result = [];
        $field
            .find( ".zcrud-data-row:not(.zcrud-hidden)" )
            .each( function() {
            
                var $this = $( this );
                var row = {};
                result.push( row );

                row[ 'code' ] = getFormVal( 'code', $this, name );
                row[ 'name' ] = getFormVal( 'name', $this, name );
                row[ 'description' ] = getFormVal( 'description', $this, name );
        });
        
        return result;
    };
    
    var fill = function( record, $row ){
        
        setFormVal( record, 'id', $row );
        setFormVal( record, 'name', $row );
        setFormVal( record, 'description', $row );
        setFormVal( record, 'date', $row );
        setFormVal( record, 'time', $row );
        setFormDatetimeVal( record, 'datetime', $row );
        setFormRadioVal( record, 'phoneType', $row );
        setFormVal( record, 'province', $row );
        setFormVal( record, 'city', $row );
        setFormVal( record, 'browser', $row );
        setFormCheckboxVal( record, 'important', $row );
        setFormVal( record, 'number', $row );
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
            assert.equal( getFormVal( 'id', $row ), record.id );
        }
        if ( record.name !== undefined ){
            assert.equal( getFormVal( 'name', $row ), record.name );
        }
        if ( record.description !== undefined ){
            assert.equal( getFormVal( 'description', $row ), record.description );
        }
        if ( record.date !== undefined ){
            assert.equal( getFormVal( 'date', $row ), record.date );
        }
        if ( record.time !== undefined ){
            assert.equal( getFormVal( 'time', $row ), record.time );
        }
        if ( record.datetime !== undefined ){
            assert.equal( getFormVal( 'datetime', $row ), record.datetime );
        }
        if ( record.phoneType !== undefined ){
            assert.equal( getFormRadioVal( 'phoneType', $row ), record.phoneType );
        }
        if ( record.province !== undefined ){
            assert.equal( getFormVal( 'province', $row ), record.province );
        }
        if ( record.city !== undefined ){
            assert.equal( getFormVal( 'city', $row ), record.city );
        }
        if ( record.browser !== undefined ){
            assert.equal( getFormVal( 'browser', $row ), record.browser );
        }
        if ( record.important !== undefined ){
            assert.equal( getFormCheckboxVal( 'important', $row ), record.important );
        }
        if ( record.number !== undefined ){
            assert.equal( getFormVal( 'number', $row ), record.number );
        }
    };
    
    var assertHistory = function( assert, expectedUndoActions, expectedRedoActions, expectedSaveEnabled ){
        assert.equal( getNumberOfUndoActions(), expectedUndoActions );
        assert.equal( getNumberOfRedoActions(), expectedRedoActions );
        //assert.equal( saveEnabled(), expectedSaveEnabled );
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
        assertHistory: assertHistory,
        setFormVal: setFormVal,
        getRow: getRow,
        getSelectOptions: getSelectOptions,
        fillSubformNewRow: fillSubformNewRow,
        clickCreateSubformRowButton: clickCreateSubformRowButton,
        clickDeleteSubformRowButton: clickDeleteSubformRowButton
    };
})();
