// docsUtils

import { zcrud, zpt, $ } from '../lib/zcrud-esm.js';
import { zcrudServerSide } from './zcrudServerSide.js'; 
import { people, skills } from './data.js';

export const docsUtils = {};

// Add people and skills data to zcrudServerSide
docsUtils.addData = function(){
    zcrudServerSide.addPeople( people );
    zcrudServerSide.addSubformsData( 'skills', skills );
};

// Build an array with all the elements to parse
docsUtils.buildRoot = function(){

    let root = [
        document.getElementById( 'commonHeader' ),
        document.getElementById( 'commonFooter' )
    ];
    const updatableBodyPart = document.getElementsByClassName( 'updatableBodyPart' );
    if ( updatableBodyPart.length ){
        const newArray = [ ...updatableBodyPart ];
        root = root.concat( newArray );
    }

    return root;
};

docsUtils.configureOptions = function( options ){
    
    // This is needed to make the git pages work
    if ( options ){
        options.filesPathPrefix = location.pathname.startsWith( '/Zcrud' )? '/Zcrud': '';
        zpt.context.getConf().externalMacroPrefixURL = options.filesPathPrefix + '/';
    } else {
        zpt.context.getConf().externalMacroPrefixURL = location.pathname.startsWith( '/Zcrud' )? '/Zcrud/': '/';
    }
};

// Build the dictionary
docsUtils.buildDictionary = function(){
    return {
        zcrud: zcrud
    }
};

// Configure options
docsUtils.run = function( options, callback ){

    // Add data from people, skills... to zcrudServerSide
    docsUtils.addData();

    // Configure some options: filesPathPrefix, externalMacroPrefixURL...
    docsUtils.configureOptions( options );

    // Run ZPT
    zpt.run(
        {
            command: 'preload',
            root: docsUtils.buildRoot(),
            dictionary: docsUtils.buildDictionary(),
            declaredRemotePageUrls: [ 'templates.html' ],
            maxFolderDictionaries: 5,
            callback: function(){
                zpt.run();
                if ( options ){
                    $( '#container' ).zcrud( 'init', options, callback );
                }
            }
        }
    );
};
