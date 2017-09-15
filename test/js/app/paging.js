"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunitjs' );
var testHelper = require( './testHelper.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var thisTestOptions = {
    paging: {
        isOn: true,
        pagingComponentId: 'zcrud-paging',
        goToPageComboboxId: 'zcrud-go-to-page-combobox',
        defaultPageSize: 10,
        pageSizes: [10, 25, 50, 100, 250, 500],
        pageSizeChangeArea: true,
        pageSizeChangeComboboxId: 'zcrud-pageSizeChange',
        gotoPageArea: 'combobox', // possible values: 'textbox', 'combobox', 'none'
        maxNumberOfAllShownPages: 5,
        block1NumberOfPages: 1,
        block2NumberOfPages: 5,
        block3NumberOfPages: 1
    },

    selecting: {
        isOn: false
    },

    sorting: {
        isOn: false
    },

    filtering: {
        isOn: false
    }
};
var options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

$( '#departmentsContainer' ).zcrud( 
    'init',
    options,
    function( options ){
        $( '#departmentsContainer' ).zcrud( 
            'load',
            undefined,
            function(){
                // Run tests
                QUnit.test( "paging test", function( assert ) {
                    assert.equal( testHelper.countVisibleRows( options ), 10 );
                    assert.equal( testHelper.pagingInfo( options ), 'Showing 1-10 of 129' );
                    assert.equal( testHelper.getColumnValues( 'id' ), '1/2/3/4/5/6/7/8/9/10' );
                    assert.equal( testHelper.getColumnValues( 'name' ), 'Service 1/Service 2/Service 3/Service 4/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10' );
                    testHelper.checkPageListInfo( 
                        assert, 
                        options,
                        [ '<<', '<', '1' ],
                        [ '2', '3', '4', '5', '13', '>', '>>' ]);

                    testHelper.goToPage( options, '2' );
                    
                    //assert.equal( getAllValues( '.value' ) , 'tool A/tool B/tool C/tool D'  );
                });
            });
    }
);
