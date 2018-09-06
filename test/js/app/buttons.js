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
var thisTestOptions = undefined;
var options = undefined;

var runCounter1 = 0;
var clickEventFunction1 = function( event ){
    ++runCounter1;
};

var runCounter2 = 0;
var clickEventFunction2 = function( event ){
    ++runCounter2;
};

var alertFunction = function( event ){
    alert( 'It worked!' );
};

// Run tests
QUnit.test( "listToolbar test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                list: {
                    buttons: {
                        toolbar: [ 
                            'list_showCreateForm',
                            {
                                type: 'generic',
                                cssClass: 'customButton1',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 1'
                                    }  
                                }
                            },
                            {
                                type: 'generic',
                                cssClass: 'customButton2',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 2'
                                    }  
                                }
                            }
                        ],
                        byRow: [ 'list_showEditForm', 'list_showDeleteForm' ]
                    }
                }
            },
        },
        events: {
            listCreated: function ( data ) {
                $( 'button.customButton1' ).click( clickEventFunction1 );
                $( 'button.customButton2' ).click( clickEventFunction2 );
            }
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );
            
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );
            
            $( 'button.customButton1' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );
            
            $( 'button.customButton2' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );
            
            done();
        }
    );
});
