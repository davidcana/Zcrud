/* 
    testHelper singleton class
*/
var $ = require( 'jquery' );

module.exports = (function() {
    "use strict";

    var getCurrentList = function( options ){
        return  $( '#' + options.currentList.id );
    };
    
    var countVisibleRows = function( options ){
        return getCurrentList( options ).find( '.zcrud-data-row' ).length;
    };
    
    var pagingInfo = function( options ){
        return getCurrentList( options ).find( '.zcrud-page-info' ).html();
    };
    
    var getAllValues = function( selector ){
        return $( selector ).map( function( index, element ) {
            return this.innerHTML;
        } ).get().join( '/' );
    }
    
    var getColumnValues = function( fieldId ){
        return getAllValues( '.' + 'zcrud-column-data-' + fieldId );
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
        var $combobox = $( '#' + options.paging.goToPageComboboxId );
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
        var $combobox = $( '#' + options.paging.pageSizeChangeComboboxId );
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
        assert.equal( getColumnValues( 'id' ), testOptions.ids );
        assert.equal( getColumnValues( 'name' ), testOptions.names );
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
    
    var checkRecord = function( assert, key, expectedRecord ){
        
        // Check record from zCrud
        var record = $( '#departmentsContainer' ).zcrud( 'getRecordByKey', key );
        //alert( JSON.stringify( record ) );
        assert.deepEqual( record, expectedRecord );
        
        // Check record from table
        var row = $( '#zcrud-list-tbody-department' ).find( "[data-record-key='" + key + "']" );
        var id = row.find( "td.zcrud-column-data-id" ).text();
        var name = row.find( "td.zcrud-column-data-name" ).text();
        assert.equal( id, expectedRecord.id );
        assert.equal( name, expectedRecord.name );
    };
    
    var checkNoRecord = function( assert, key ){
        
        // Check record from zCrud
        var record = $( '#departmentsContainer' ).zcrud( 'getRecordByKey', key );
        assert.equal( record.length, undefined );

        // Check record from table
        var row = $( '#zcrud-list-tbody-department' ).find( "[data-record-key='" + key + "']" );
        assert.equal( row.length, 0 );
    };
    
    var clickListButton = function( key ){
        
        var row = $( '#zcrud-list-tbody-department' ).find( "[data-record-key='" + key + "']" );
        row.find( ".zcrud-delete-command-button" ).trigger( 'click' );
    };
    var clickFormCancelButton = function(){
        $( '#form-cancel-button' ).trigger( 'click' );
    };
    var clickFormDeleteButton = function(){
        $( '#form-submit-button' ).trigger( 'click' );
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
        clickListButton: clickListButton,
        clickFormCancelButton: clickFormCancelButton,
        clickFormDeleteButton: clickFormDeleteButton
    };
})();
