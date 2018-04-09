"use strict";

var $ = require( 'jquery' );
var zcrud = require( './main.js' );
var context = require( './context.js' );

(function ( $ ) {
 
    var getOptions = function( jqueryObject ){
        /*var selectorString = context.getSelectorString( jqueryObject );
        return context.getOptions( selectorString );*/
        return context.getOptions( jqueryObject )
    };
    
    $.fn.zcrud = function( action ) {
        "use strict";

        switch ( action ){
            case 'addRecord':
                zcrud.addRecord( getOptions( this ), arguments[1], arguments[2] );
                break;
            case 'deleteRecord':
                zcrud.deleteRecord( getOptions( this ), arguments[1], arguments[2] );
                break;
            case 'destroy':
                zcrud.destroy( getOptions( this ) );
                break;
            case 'getRecordByKey':
                return zcrud.getRecordByKey( getOptions( this ), arguments[1] );
            case 'init':
                //arguments[1].target = this;
                var options = zcrud.init( arguments[1], arguments[2] );
                options.target = this;
                context.putOptions( this, options );
                /*context.putOptions( 
                    context.getSelectorString( this ), 
                    options );*/
                break;
            case 'load':
                zcrud.load( getOptions( this ), arguments[1], arguments[2] );
                break;
            case 'reload':
                zcrud.reload( getOptions( this ), arguments[1] );
                break;
            case 'selectedRecords':
                return zcrud.selectedRecords( getOptions( this ) );
                break;
            case 'selectedRows':
                return zcrud.selectedRows( getOptions( this ) );
                break;
            case 'selectRows':
                zcrud.selectRows( getOptions( this ), arguments[1] );
                break;
            case 'showCreateForm':
                zcrud.showCreateForm( getOptions( this ) );
                break;
            case 'updateRecord':
                zcrud.updateRecord( getOptions( this ), arguments[1], arguments[2] );
                break;
            default:
                alert( 'Unknown action: ' + action );
                return false;
        }

        return this;
    };
 
}( $ )); 
