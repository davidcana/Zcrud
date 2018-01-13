"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {
    pages: {
        list: {
            components: {
                selecting: {
                    isOn: true,
                    multiple: true,
                    mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                }
            }
        }
    }
};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );
        
// Run tests
QUnit.test( "selecting test", function( assert ) {

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            var $departmentsContainer = $( '#departmentsContainer' );
            var getSelected = function(){
                return $departmentsContainer.zcrud( 'selectedRecords' );
            };

            var $tbody = $( '#zcrud-list-tbody-department' );
            var select = function(){
                for ( var c = 0; c < arguments.length; c++ ){
                    var id = arguments[ c ];
                    $tbody.find( "[data-record-key='" + id + "'] input.zcrud-select-row" ).trigger( 'click' );
                }
            };

            var toggleSelect = function(){
                $departmentsContainer.find( "input.zcrud-select-all-rows" ).trigger( 'click' );
            };

            var buildSelectedRange = function( start, end ){
                var result = [];
                for ( var c = start; c <= end; ++c ){
                    var entry = {
                        id: c,
                        name: 'Service ' + c
                    };
                    result.push( entry );
                }
                return result;
            };

            var values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 1, 10 ) );
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
            });
            assert.equal( getSelected().length, 0 );

            // Select
            select( '3', '5', '7' );
            assert.deepEqual( 
                getSelected(), 
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "7",
                        "name": "Service 7"
                    }
                ] );

            // Deselect
            select( '3', '5', '7' );
            assert.equal( getSelected().length, 0 );

            // Select again
            select( '3', '5', '7' );
            assert.deepEqual( 
                getSelected(), 
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "7",
                        "name": "Service 7"
                    }
                ] );

            // Test ranges
            testHelper.keyDown( 16 );
            select( '9' );
            assert.deepEqual( 
                getSelected(), 
                [ 
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "7",
                        "name": "Service 7"
                    },
                    {
                        "id": "8",
                        "name": "Service 8"
                    },
                    {
                        "id": "9",
                        "name": "Service 9"
                    }
                ] );
            testHelper.keyUp( 16 );

            // Select all being some selected
            toggleSelect();
            assert.deepEqual( 
                getSelected(), 
                [ 
                    {
                        "id": "1",
                        "name": "Service 1"
                    },
                    {
                        "id": "2",
                        "name": "Service 2"
                    },
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "4",
                        "name": "Service 4"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "6",
                        "name": "Service 6"
                    },
                    {
                        "id": "7",
                        "name": "Service 7"
                    },
                    {
                        "id": "8",
                        "name": "Service 8"
                    },
                    {
                        "id": "9",
                        "name": "Service 9"
                    },
                    {
                        "id": "10",
                        "name": "Service 10"
                    }
                ] );

            // Deselect all
            toggleSelect();
            assert.equal( getSelected().length, 0 );

            // Select all being no selected
            toggleSelect();
            assert.deepEqual( 
                getSelected(), 
                [ 
                    {
                        "id": "1",
                        "name": "Service 1"
                    },
                    {
                        "id": "2",
                        "name": "Service 2"
                    },
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "4",
                        "name": "Service 4"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "6",
                        "name": "Service 6"
                    },
                    {
                        "id": "7",
                        "name": "Service 7"
                    },
                    {
                        "id": "8",
                        "name": "Service 8"
                    },
                    {
                        "id": "9",
                        "name": "Service 9"
                    },
                    {
                        "id": "10",
                        "name": "Service 10"
                    }
                ] );

            // Deselect some
            select( '1', '4', '7' );
            assert.deepEqual( 
                getSelected(), 
                [ 
                    {
                        "id": "2",
                        "name": "Service 2"
                    },
                    {
                        "id": "3",
                        "name": "Service 3"
                    },
                    {
                        "id": "5",
                        "name": "Service 5"
                    },
                    {
                        "id": "6",
                        "name": "Service 6"
                    },
                    {
                        "id": "8",
                        "name": "Service 8"
                    },
                    {
                        "id": "9",
                        "name": "Service 9"
                    },
                    {
                        "id": "10",
                        "name": "Service 10"
                    }
                ] );

            // Move to next page, all selected must be deselected
            values = testHelper.buildCustomValuesList( testHelper.buildValuesList( 11, 20 ) );
            testHelper.pagingTest({
                action: { 
                    nextPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 11-20 of 129',
                ids:  values[ 0 ],
                names: values[ 1 ],
                pageListNotActive: [ '2' ],
                pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ]
            });
            assert.equal( getSelected().length, 0 );
            
            done();
        }
    );
});
