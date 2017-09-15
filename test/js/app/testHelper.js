/* 
    testHelper singleton class
*/
var $ = require( 'jquery' );

module.exports = (function() {
    "use strict";
    
    var $currentList = undefined;
    var getCurrentList = function( options ){
        
        if ( ! $currentList ){
            $currentList = $( '#' + options.currentList.id );
        }
        return $currentList;
    };
    
    var countVisibleRows = function( options ){
        return getCurrentList( options ).find( '.zcrud-data-row' ).length;
        //return $( '#' + options.currentList.id ).find( '.zcrud-data-row' ).length;
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
        assert.deepEqual( info.active, expectedActiveArray, 'Active array list not equals!' );
        assert.deepEqual( info.notActive, expectedNotActiveArray, 'Not active array list not equals!' );
    };

    var goToPage = function( options, pageId ){
        
        var $page = getCurrentList( options ).find( '.zcrud-page-list' ).children().filter( 
            function() {
                return $( this ).text() == pageId;
            });
        $page.trigger( 'click' );
    };
    
    return {
        countVisibleRows: countVisibleRows,
        pagingInfo: pagingInfo,
        getColumnValues: getColumnValues,
        //getPageListInfo: getPageListInfo,
        checkPageListInfo: checkPageListInfo,
        goToPage: goToPage
    };
})();
