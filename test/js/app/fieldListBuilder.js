"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var fieldListBuilder = require( '../../../js/app/fieldListBuilder.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

var buildIdsArray = function( fieldsArray ){
    
    var result = [];
    
    for ( var c = 0; c < fieldsArray.length; ++c ){
        result.push( fieldsArray[ c ].id );
    }
    
    return result;
};

// Run tests
QUnit.test( "Field list builder test", function( assert ) {
    
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            // Empty array
            var items = [];
            var expected = [];
            var fields = fieldListBuilder.build( items, options );
            assert.deepEqual( fields, expected );
            
            // Strings only
            items = [ 'name', 'description' ];
            expected = [
                {
                    "id": "name",
                    "type": "text",
                    "width": "90%",
                    "customOptions": {},
                    "elementId": "zcrud-name",
                    "elementName": "name",
                    "formFieldAttributes": {},
                    "name": "name",
                    "sorting": true,
                    "template": "text@templates/fields/basic.html",
                    "viewTemplate": undefined
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "formFieldAttributes": {
                        "cols": 80,
                        "rows": 6
                    },
                    "customOptions": {},
                    "elementId": "zcrud-description",
                    "elementName": "description",
                    "list": false,
                    "name": "description",
                    "sorting": true,
                    "template": "textarea@templates/fields/basic.html",
                    "viewTemplate": undefined
                }
            ];
            fields = fieldListBuilder.build( items, options );
            assert.deepEqual( fields, expected );
            
            // Fields only
            items = [ 
                {
                    "id": "name",
                    "type": "text",
                    "width": "90%"
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "formFieldAttributes": {
                        "cols": 80,
                        "rows": 6
                    }
                }
            ];
            expected = [
                {
                    "id": "name",
                    "type": "text",
                    "width": "90%",
                    "customOptions": {},
                    "elementId": "zcrud-name",
                    "elementName": "name",
                    "formFieldAttributes": {},
                    "name": "name",
                    "sorting": true,
                    "template": "text@templates/fields/basic.html",
                    "viewTemplate": undefined
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "formFieldAttributes": {
                        "cols": 80,
                        "rows": 6
                    },
                    "customOptions": {},
                    "elementId": "zcrud-description",
                    "elementName": "description",
                    "name": "description",
                    "sorting": true,
                    "template": "textarea@templates/fields/basic.html",
                    "viewTemplate": undefined
                }
            ];
            fields = fieldListBuilder.build( items, options );
            assert.deepEqual( fields, expected );
            
            // A fieldSubset only (with all default fields)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "default"
                }
            ];
            expected = [
                "id",
                "name",
                "description",
                "date",
                "time",
                "datetime",
                "phoneType",
                "province",
                "city",
                "browser",
                "important",
                "number"
            ];
            fields = fieldListBuilder.build( items, options );
            assert.deepEqual( buildIdsArray( fields ), expected );

            // A fieldSubset only (starting with datetime)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "default",
                    "start": "datetime"
                }
            ];
            expected = [
                "datetime",
                "phoneType",
                "province",
                "city",
                "browser",
                "important",
                "number"
            ];
            fields = fieldListBuilder.build( items, options );
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only (ending with phoneType)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "default",
                    "end": "phoneType"
                }
            ];
            expected = [
                "id",
                "name",
                "description",
                "date",
                "time",
                "datetime",
                "phoneType"
            ];
            fields = fieldListBuilder.build( items, options );
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only (starting with description and ending with browser)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "default",
                    "start": "description",
                    "end": "browser"
                }
            ];
            expected = [
                "description",
                "date",
                "time",
                "datetime",
                "phoneType",
                "province",
                "city",
                "browser"
            ];
            fields = fieldListBuilder.build( items, options );
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only (starting with description and ending with browser except time and phoneType)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "default",
                    "start": "description",
                    "end": "browser",
                    "except": [ "time", "phoneType" ]
                }
            ];
            expected = [
                "description",
                "date",
                "datetime",
                "province",
                "city",
                "browser"
            ];
            fields = fieldListBuilder.build( items, options );
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // TODO Test "source": pageId
            
            done();
        }
    );
});
