$(document).ready(function () {
    $("<audio></audio>").attr({
        'src':'assets/javascript/hello.wav',
        'autoplay':'autoplay'
    }).appendTo("body");

    let playerName = "";
    let playerNameFormatted = "";

    $("#nameEnter").keypress(function (e) {
        if (e.keyCode == "13") {
            playerName = $("#nameEnter").val().trim();
            // $("#nameEnter").html("");   
            playerNameFormatted = playerName.charAt(0).toUpperCase() + playerName.slice(1);
            $("#yourName").html(playerNameFormatted);
        }
    });

    $("start").on("click", function (e) {
        e.preventDefault();
        playerName = $("#nameEnter").val().trim();
        // $("#nameEnter").text("");
        playerNameFormatted = playerName.charAt(0).toUpperCase() + playerName.slice(1);
        $("#yourName").html(playerNameFormatted);
            
    });


    ("#robotU").on("click", function () {
        ("#xBorder").removeClass(".borders");
        ("#xBorder").css({
            "border": "8px double rgb(0, 255, 251)",
            "border-radius": "20px",
            "padding-top": "1%",
            "display": "block",
            "animation": "none"});
    });
    
});