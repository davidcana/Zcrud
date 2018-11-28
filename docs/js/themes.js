// Change stylesheet of theme when themeSelector changes

$( '#themeSelector' ).change(
    function () {
        var $this = $( this );
        var theme = $this.val();
        var prefix = location.pathname.startsWith( '/Zcrud' )? '/Zcrud': '';
        $( '#stylesheet' ).attr( 'href', prefix + '/themes/' + theme + '/theme.css' );
    }
);
