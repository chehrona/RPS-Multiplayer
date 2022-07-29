$(document).ready(function () {
    $("<audio></audio>").attr({
        'src':'assets/javascript/hello.wav',
        // 'volume': 0.4,
        'autoplay':'autoplay'
    }).appendTo("body");
})