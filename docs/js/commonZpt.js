/* Common code
   Vars needed:
   - options
   - callback
*/
// A borrar!!!!!
// This is needed to make the git pages work
options.filesPathPrefix = location.pathname.startsWith( '/Zcrud' )? '/Zcrud': '';
zpt.context.getConf().externalMacroPrefixURL = options.filesPathPrefix + '/';

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
            $( '#container' ).zcrud( 'init', options, callback );
        }
    }
);
