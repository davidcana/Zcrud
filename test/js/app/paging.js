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
                    testHelper.pagingTest({
                        pageId: false,
                        options: options,
                        assert: assert,
                        visibleRows: 10,
                        pagingInfo: 'Showing 1-10 of 129',
                        ids: '1/2/3/4/5/6/7/8/9/10',
                        names: 'Service 1/Service 2/Service 3/Service 4/Service 5/Service 6/Service 7/Service 8/Service 9/Service 10',
                        pageListNotActive: [ '<<', '<', '1' ],
                        pageListActive: [ '2', '3', '4', '5', '13', '>', '>>' ]
                    });
                    /*
                    testHelper.pagingTest({
                        pageId: '2',
                        options: options,
                        assert: assert,
                        visibleRows: 10,
                        pagingInfo: 'Showing 11-20 of 129',
                        ids: '11/12/13/14/15/16/17/18/19/20',
                        names: 'Service 11/Service 12/Service 13/Service 14/Service 15/Service 16/Service 17/Service 18/Service 19/Service 20',
                        pageListNotActive: [ '2' ],
                        pageListActive: [ '<<', '<', '1', '3', '4', '5', '13', '>', '>>' ]
                    });*/
                });
            });
    }
);
