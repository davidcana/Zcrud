"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var subformTestOptions = require( './subformTestOptions.js' );
var editableListTestOptions = require( './editableListTestOptions.js' );
var options = undefined;

var runCounter1 = 0;
var clickEventFunction1 = function( event ){
    ++runCounter1;
};

var runCounter2 = 0;
var clickEventFunction2 = function( event ){
    ++runCounter2;
};

// Run tests
QUnit.test( "listToolbar test", function( assert ) {
    
    options = $.extend( true, {}, defaultTestOptions );
    options.pageConf.pages.list.buttons = {
        toolbar: [ 
            'list_showCreateForm',
            {
                type: 'generic',
                textsBundle: {
                    title: undefined,
                    content: {
                        translate: false,
                        text: 'Custom toolbar button'
                    }  
                }
            }
        ],
        byRow: [ 'list_showEditForm', 'list_showDeleteForm' ]
    };
            
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );


            
            done();
        }
    );
});
