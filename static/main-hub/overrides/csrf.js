Ext.onReady(function() {
    Ext.Ajax.on('beforerequest', function (conn, options) {
        if (!(/^http:.*/.test(options.url) || /^https:.*/.test(options.url))) {
            if (typeof(options.headers) == "undefined") {
                options.headers = {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')};
            } else {
                options.headers.extend({'X-CSRFToken': Ext.util.Cookies.get('csrftoken')});
            }
        }
    }, this);
});