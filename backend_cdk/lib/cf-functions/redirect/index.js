function handler(event) {
    var request = event.request;

    request.uri = request.uri.replace(/^(.*?)(\/?[^.\/]*\.[^.\/]*)?\/?$/, function($0, $1, $2) {
        return $1 + ($2 ? $2 : "/index.html");
    });

    return request;
};
