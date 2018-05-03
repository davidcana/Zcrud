"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testUtils = require( './testUtils.js' );
var testHelper = require( './testHelper.js' );
var fieldListBuilder = require( '../../../js/app/fieldListBuilder.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var options = undefined;

var buildIdsArray = function( fieldsArray ){
    
    var result = [];
    
    for ( var c = 0; c < fieldsArray.length; ++c ){
        result.push( fieldsArray[ c ].id );
    }
    
    return result;
};

// Run tests
QUnit.test( "Field list from general fields builder test", function( assert ) {
    
    var done = assert.async();
    options = defaultTestOptions;
    
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
                    //"list": false,
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
            
            done();
        }
    );
});

QUnit.test( "Field list from page id builder test", function( assert ) {

    var done = assert.async();
    options = {
        entityId: 'department',
        saveUserPreferences: false,

        pages: {
            list: {
                url: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                fields: [ 'id', 'name' ],
            }, create: {
                fields: [
                    {
                        "type": "fieldSubset",
                        "source": "list"
                    },
                    'name2'
                ],
            }, update: {
                fields: [
                    {
                        "type": "fieldSubset",
                        "source": "list"
                    },
                    'name3'
                ],
            }, delete: {
                fields: [
                    {
                        "type": "fieldSubset",
                        "source": "update"
                    },
                    'name4'
                ],
            }
        },

        defaultPageConf: {
            url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department'
        },
        
        key : 'id',
        fields: {
            id: {
                //key: true,
                sorting: false
            },
            name: {
                width: '10%'
            },
            name2: {
                width: '20%'
            },
            name3: {
                width: '30%'
            },
            name4: {
                width: '40%'
            }
        },
        
        ajax: {
            ajaxFunction: testUtils.ajax    
        },
        
        i18n: {
            language: 'en',
            filesPath: 'i18n',
            i18nArrayVarName: 'i18nArray',
            files: { 
                en: [ 'en-common.json', 'en-services.json' ],
                es: [ 'es-common.json', 'es-services.json' ] 
            }
        }
    };
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            // A fieldSubset only (with all default fields)
            var items = [ 
                {
                    "type": "fieldSubset",
                    "source": "list"
                }
            ];
            var expected = [
                "id",
                "name"
            ];
            var fields = fieldListBuilder.build( items, options );
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only (with all default fields except name)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "list",
                    "except": [ "name" ]
                }
            ];
            expected = [
                "id"
            ];
            fields = fieldListBuilder.build( items, options );
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only already built
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "create"
                }
            ];
            expected = [
                "id",
                "name",
                "name2"
            ];
            fields = fieldListBuilder.build( items, options );
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only not built
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "delete"
                }
            ];
            expected = [
                "id",
                "name",
                "name3",
                "name4"
            ];
            fields = fieldListBuilder.build( items, options );
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            done();
        }
    );
});

QUnit.test( "Field list from page id builder with circular references test", function( assert ) {

    var done = assert.async();
    options = {
        entityId: 'department',
        saveUserPreferences: false,

        pages: {
            list: {
                url: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                fields: [ 'id', 'name' ],
            }, create: {
                fields: [
                    {
                        "type": "fieldSubset",
                        "source": "create"
                    }
                ],
            }, update: {
                fields: [
                    {
                        "type": "fieldSubset",
                        "source": "delete"
                    }
                ],
            }, delete: {
                fields: [
                    {
                        "type": "fieldSubset",
                        "source": "update"
                    }
                ],
            }
        },

        defaultPageConf: {
            url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department'
        },
        
        key : 'id',
        fields: {
            id: {
                //key: true,
                sorting: false
            },
            name: {
                width: '10%'
            },
            name2: {
                width: '20%'
            },
            name3: {
                width: '30%'
            },
            name4: {
                width: '40%'
            }
        },

        ajax: {
            ajaxFunction: testUtils.ajax    
        },

        i18n: {
            language: 'en',
            filesPath: 'i18n',
            i18nArrayVarName: 'i18nArray',
            files: { 
                en: [ 'en-common.json', 'en-services.json' ],
                es: [ 'es-common.json', 'es-services.json' ] 
            }
        }
    };

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            // A fieldSubset only (circular reference)
            var items = [ 
                {
                    "type": "fieldSubset",
                    "source": "create"
                }
            ];
            var errors = 0;
            try {
                var fields = fieldListBuilder.build( items, options );
            } catch ( e ) {
                ++errors;
            }
            assert.equal( errors, 1 );
            
            // A fieldSubset only (circular reference)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "update"
                }
            ];
            errors = 0;
            try {
                fields = fieldListBuilder.build( items, options );
            } catch ( e ) {
                ++errors;
            }
            assert.equal( errors, 1 );
            
            done();
        }
    );
});
