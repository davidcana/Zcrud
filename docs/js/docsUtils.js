// docsUtils

import { zpt, $ } from '../lib/zcrud-esm.js';
import { zcrudServerSide } from './zcrudServerSide.js'; 
import { people, skills } from './data.js';

export const docsUtils = {};

// Add people and skills data to zcrudServerSide
docsUtils.addData = function(){
    zcrudServerSide.addPeople( people );
    zcrudServerSide.addSubformsData( 'skills', skills );
};

// Configure options
docsUtils.run = function( options, callback ){

    docsUtils.addData();

    // This is needed to make the git pages work
    if ( options ){
        options.filesPathPrefix = location.pathname.startsWith( '/Zcrud' )? '/Zcrud': '';
        zpt.context.getConf().externalMacroPrefixURL = options.filesPathPrefix + '/';
    } else {
        zpt.context.getConf().externalMacroPrefixURL = location.pathname.startsWith( '/Zcrud' )? '/Zcrud/': '/';
    }

    // Run ZPT
    zpt.run(
        {
            command: 'preload',
            root: [ 
                document.getElementById( 'commonHeader' ), 
                document.getElementById( 'commonFooter' )
            ],
            dictionary: {},
            declaredRemotePageUrls: [ 'templates.html' ],
            callback: function(){
                zpt.run();
                if ( options ){
                    $( '#container' ).zcrud( 'init', options, callback );
                }
            }
        }
    );
};
