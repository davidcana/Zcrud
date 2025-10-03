/* 
    pageUtils singleton class
*/

import { zpt } from '../../../node_modules/zpt/index.js';
import { zzDOM } from '../../../node_modules/zzdom/index.js';
var $ = zzDOM.zz;

export const pageUtils = (function() {
    
    var configureTemplate = function( options, templatePath ){
        
        options.target.html(
            `<div data-use-macro="${templatePath}"></div>`
        );
    };

    // Normalizes a number between given bounds or sets to a defaultValue if it is undefined
    var normalizeNumber = function ( number, min, max, defaultValue ) {
        
        if ( number == undefined || number == null || isNaN( number ) ) {
            return defaultValue;
        }

        if ( number < min ) {
            return min;
        }

        if ( number > max ) {
            return max;
        }

        return number;
    };
    
    // Finds index of an element in an array according to given comparision function
    var findIndexInArray = function ( value, array, compareFunc ) {

        // If not defined, use default comparision
        if ( ! compareFunc ) {
            compareFunc = function ( a, b ) {
                return a == b;
            };
        }
        
        for ( var i = 0; i < array.length; i++ ) {
            if ( compareFunc( value, array[i] ) ) {
                return i;
            }
        }
        return -1;
    };
    
    var ajaxError = function( request, status, error, options, context, userErrorFunction ){
        
        context.showError( 
            options, 
            false, 
            request && request.responseText? request.responseText: 'Undefined error'
        );
        
        if ( userErrorFunction ){
            userErrorFunction( 
                {
                    request: request,
                    status: status,
                    error: error,
                    options: options,
                    context: context
                }
            );
        }
    };
    
    var serverSideError = function( dataFromServer, options, context, userErrorFunction ){

        context.showError( 
            options, 
            false,
            dataFromServer && dataFromServer.message? dataFromServer.message: 'Undefined error', 
            dataFromServer && dataFromServer.translateMessage
        );

        if ( userErrorFunction ){
            userErrorFunction( 
                {
                    dataFromServer: dataFromServer,
                    options: options,
                    context: context
                }
            );
        }
    };
    
    var generateId = function ( len, charSet ) {
        
        // Init parameters
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        len = len || 6;
        
        // Generate id using these parameters
        var result = '';
        for ( var i = 0; i < len; i++ ) {
            var pos = Math.floor( Math.random() * charSet.length );
            result += charSet.substring( pos, pos + 1 );
        }
        return result;
    }
    
    var showStatusMessage = function( $this, dictionaryExtension ){

        zpt.run({
            root: $this.find( '.zcrud-status' )[0],
            dictionaryExtension: dictionaryExtension
        });
    };
    
    var getKeyFromButton = function( event ){

        if ( ! event ){
            return;
        }

        return $( event.target ).closest( '.zcrud-data-row' ).attr( 'data-record-key' );
    };
    /*
    var getPostTemplates = function( fields ){

        var result = [];

        for ( var c = 0; c < fields.length; ++c ){
            var field = fields[ c ];
            var postTemplates = field.getPostTemplates();
            if ( postTemplates ){
                result = result.concat( postTemplates );
            }
        }

        // Filter repeated items
        result = result.filter(
            function ( item, pos ) {
                return result.indexOf( item ) == pos;
            }
        );

        return result.length == 0? undefined: result;
    };*/
    
    return {
        configureTemplate: configureTemplate,
        normalizeNumber: normalizeNumber,
        findIndexInArray: findIndexInArray,
        ajaxError: ajaxError,
        serverSideError: serverSideError,
        generateId: generateId,
        showStatusMessage: showStatusMessage,
        getKeyFromButton: getKeyFromButton
        //getPostTemplates: getPostTemplates
    };
})();
