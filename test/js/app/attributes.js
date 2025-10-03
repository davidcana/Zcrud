
import { utils } from '../../../js/app/utils.js';
import { testHelper } from './testHelper.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { defaultTestOptions } from './defaultTestOptions.js';

var thisTestOptions;
var options;

// Run tests
QUnit.test( 'field attributes test', function( assert ) {
    
    thisTestOptions = {
        fields: {
            description: {
                type: 'textarea',
                attributes: {
                    field: {
                        rows: 2,
                        cols: 40
                    }
                }
            }
        }
    };
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );
    
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 2 exists
            var key = 2;

            // Go to edit form and edit record
            testHelper.clickUpdateListButton( key );

            // Check attrs
            var $textarea = $( '[name="description"]' );
            assert.equal( '2', $textarea.attr( 'rows' ) );
            assert.equal( '40', $textarea.attr( 'cols' ) );
            
            done();
        }
    );
});

QUnit.test( 'rowHeader attributes test', function( assert ) {

    thisTestOptions = {
        fields: {
            name: {
                attributes:{
                    rowHeader: {
                        style: 'width:80%'
                    }
                }
            }
        }
    };
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Check attrs
            var $th = $( '.zcrud-column-header-name' );
            assert.equal( 'width: 80%;', $th.attr( 'style' ) );
            
            done();
        }
    );
});
