"use strict";

var $ = require( 'jquery' );
var zcrud = require( './main.js' );

(function ( $ ) {
 
    $.fn.zcrud = function( action ) {
        "use strict";

        switch ( action ){
            case 'addRecord':
                zcrud.addRecord( arguments[1], arguments[2], arguments[3] );
                break;
            case 'deleteRecord':
                zcrud.deleteRecord( arguments[1], arguments[2], arguments[3] );
                break;
            case 'destroy':
                zcrud.destroy( arguments[1] );
                break;
            case 'getRecordByKey':
                return zcrud.getRecordByKey( arguments[1], arguments[2] );
            case 'init':
                arguments[1].target = this;
                zcrud.init( arguments[1], arguments[2] );
                break;
            case 'load':
                zcrud.load( arguments[1], arguments[2], arguments[3] );
                break;
            case 'reload':
                zcrud.reload( arguments[1], arguments[2] );
                break;
            case 'showCreateForm':
                zcrud.showCreateForm( arguments[1] );
                break;
            case 'updateRecord':
                zcrud.updateRecord( arguments[1], arguments[2], arguments[3] );
                break;
            default:
                alert( 'Unknown action: ' + action );
                return false;
        }

        return this;
    };
 
}( $ )); 
