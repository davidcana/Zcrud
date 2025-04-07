"use strict";

//var $ = require( 'zzdom' );
var zzDOM = require( '../../lib/zzDOM-closures-full.js' );
//var $ = zzDOM.zz;
var context = require( './context.js' );
var zcrud = require( './main.js' );
    
var getOptions = function( jqueryObject ){
    return context.getOptions( jqueryObject )
};

zzDOM.SS.prototype.zcrud = function( action ){
    switch ( action ){
        case 'addRecord':
            zcrud.addRecord( getOptions( this ), arguments[1] );
            break;
        case 'deleteRecord':
            zcrud.deleteRecord( getOptions( this ), arguments[1] );
            break;
        case 'deselectRecords':
            zcrud.deselectRecords( getOptions( this ), arguments[1] );
            break;
        case 'deselectRows':
            zcrud.deselectRows( getOptions( this ), arguments[1] );
            break;
        case 'destroy':
            zcrud.destroy( getOptions( this ) );
            break;
        case 'getRecordByKey':
            return zcrud.getRecordByKey( getOptions( this ), arguments[1] );
        case 'getRecords':
            return zcrud.getRecords( getOptions( this ) );
        case 'getRowByKey':
            return zcrud.getRowByKey( getOptions( this ), arguments[1] );
        case 'getSelectedRecords':
            return zcrud.getSelectedRecords( getOptions( this ) );
        case 'getSelectedRows':
            return zcrud.getSelectedRows( getOptions( this ) );
        case 'init':
            var options = zcrud.init( arguments[1], arguments[2], arguments[3] );
            options.target = this;
            context.putOptions( this, options );
            break;
        case 'renderList':
            zcrud.renderList( getOptions( this ), arguments[1], arguments[2] );
            break;
        case 'renderForm':
            zcrud.renderForm( getOptions( this ), arguments[1], arguments[2] );
            break;
        case 'selectRecords':
            zcrud.selectRecords( getOptions( this ), arguments[1] );
            break;
        case 'selectRows':
            zcrud.selectRows( getOptions( this ), arguments[1] );
            break;
        case 'showCreateForm':
            zcrud.showCreateForm( getOptions( this ) );
            break;
        case 'showUpdateForm':
            zcrud.showUpdateForm( getOptions( this ), arguments[1] );
            break;
        case 'showDeleteForm':
            zcrud.showDeleteForm( getOptions( this ), arguments[1] );
            break;
        case 'updateRecord':
            zcrud.updateRecord( getOptions( this ), arguments[1] );
            break;
        case 'getListPage':
            return zcrud.getListPage( getOptions( this ) );
        case 'getFormPage':
            return zcrud.getFormPage( getOptions( this ) );
        default:
            alert( 'Unknown action: ' + action );
            return false;
    }

    return this;
};

zzDOM.MM.prototype.zcrud = function () {
    return zzDOM.MM.constructors.default( this, zzDOM.SS.prototype.zcrud, arguments );
};
    
module.exports = zzDOM;
