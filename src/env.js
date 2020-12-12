// Expose navigater properties here

function Environment() {
    var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

    this.isIOS = function() { return iOS; }
};


