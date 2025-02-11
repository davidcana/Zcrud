/* 
    utils singleton class
*/
"use strict";

var log4javascript = require( 'log4javascript' );
//var $ = require( 'jquery' );

module.exports = (function() {

    /* 
        Jquery's extend function
        MIT license
        https://github.com/jquery/jquery/blob/main/src/core.js
    */
    /*
    var extend = function( ...args ) {
        return $.extend( ...args );
    };
    */
    var hasOwn = {}.hasOwnProperty;
    var fnToString = hasOwn.toString;
    var ObjectFunctionString = fnToString.call( Object );
    var isPlainObject = function( obj ) {
        //return typeof x === 'object' && ! Array.isArray( x ) && x !== null;
        var proto, Ctor;

        // Detect obvious negatives

        // Use toString instead of jQuery.type to catch host objects

        if ( !obj || toString.call( obj ) !== "[object Object]" ) {
            return false;
        }

        proto = Object.getPrototypeOf( obj );

        // Objects with no prototype (e.g., `Object.create( null )`) are plain

        if ( !proto ) {
            return true;
        }

        // Objects with prototype are plain iff they were constructed by a global Object function
        Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
    };
    var extend = function() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[ 0 ] || {},
            i = 1,
            length = arguments.length,
            deep = false;
    
        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
    
            // Skip the boolean and the target
            target = arguments[ i ] || {};
            i++;
        }
    
        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && typeof target !== "function" ) {
            target = {};
        }
    
        // Extend jQuery itself if only one argument is passed
        if ( i === length ) {
            target = this;
            i--;
        }
        
        for ( ; i < length; i++ ) {
    
            // Only deal with non-null/undefined values
            if ( ( options = arguments[ i ] ) != null ) {
    
                // Extend the base object
                for ( name in options ) {
                    copy = options[ name ];
    
                    // Prevent Object.prototype pollution
                    // Prevent never-ending loop
                    if ( name === "__proto__" || target === copy ) {
                        continue;
                    }
    
                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( isPlainObject( copy ) ||
                        ( copyIsArray = Array.isArray( copy ) ) ) ) {
                        src = target[ name ];
    
                        // Ensure proper type for the source value
                        if ( copyIsArray && !Array.isArray( src ) ) {
                            clone = [];
                        } else if ( !copyIsArray && !isPlainObject( src ) ) {
                            clone = {};
                        } else {
                            clone = src;
                        }
                        copyIsArray = false;
    
                        // Never move original objects, clone them
                        target[ name ] = extend( deep, clone, copy );
    
                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }
    
        // Return the modified object
        return target;
    };
    
    var isFunction = function( x ) {

        // Support: Chrome <=57, Firefox <=52
        // In some browsers, typeof returns "function" for HTML <object> elements
        // (i.e., `typeof document.createElement( "object" ) === 'function'`).
        // We don't want to classify *any* DOM node as a function.
        return typeof x === 'function' && typeof x.nodeType !== 'number';
    };

    var isArray = function( x ) {
        return Array.isArray( x );
    };

    var isEmptyObject = function( x ) {
        return Object.keys( x ).length === 0;
    };

    var isString = function( x ) {
        return typeof x === 'string';
    };

    // Return a log4javascript Level object
    var levels = {
        'off'  : log4javascript.Level.OFF,
        'all'  : log4javascript.Level.ALL,
        'debug': log4javascript.Level.DEBUG,
        'info' : log4javascript.Level.INFO,
        'warn' : log4javascript.Level.WARN,
        'error': log4javascript.Level.ERROR,
        'fatal': log4javascript.Level.FATAL
    };
    var buildLoggingLevel = function( string ){
        return levels[ string ];
    };

    return {
        extend: extend,
        isFunction: isFunction,
        isArray: isArray,
        isPlainObject: isPlainObject,
        isEmptyObject: isEmptyObject,
        isString: isString,
        buildLoggingLevel: buildLoggingLevel
    };
})();
