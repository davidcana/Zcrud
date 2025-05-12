/* Standalone version of ZCrud */

//global.window.$ = require( 'jquery' );
//var zzDOM = require( '../../lib/zzDOM-closures-full.js' );
var zzDOM = require( 'zzdom' );
global.window.$ = zzDOM.zz;
global.window.zpt = require( 'zpt' );
global.window.zcrud = require( './main.js' );
require( './zzDOMPlugin.js' );
