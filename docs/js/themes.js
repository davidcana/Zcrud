// Change stylesheet of theme when themeSelector changes

$( '#themeSelector' ).on(
    'change',
    function () {
        var $this = $( this );
        var theme = $this.val();
        var prefix = location.pathname.startsWith( '/Zcrud' )? '/Zcrud': '';
        $( '#stylesheet' ).attr( 'href', prefix + '/themes/' + theme + '/theme.css' );
    }
);
