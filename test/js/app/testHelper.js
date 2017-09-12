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
    
    return {
        countVisibleRows: countVisibleRows,
        pagingInfo: pagingInfo
    };
})();
