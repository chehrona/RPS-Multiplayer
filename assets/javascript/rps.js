$(document).ready(function () {
    $("<audio></audio>").attr({
        'src':'assets/javascript/hello.wav',
        'autoplay':'autoplay'
    }).appendTo("body");

    let createsModals = function (message) {
        let modalBox = $("<div class='popup active'></div>");
        modalBox.append($("<p id='popupContent' class='active'>"+ message + "</p>"));
        modalBox.append($("<button class='close'>X</button>"));
        modalBox.appendTo($("playZone"));
        $(".close").on("click", function() {
            $(".popup-overlay, p").removeClass("active");
        });
    }

    let playerName = "";
    let playerNameFormatted = "";

    $("#nameEnter").keypress(function (e) {
        if (e.keyCode == "13") {
            playerName = $("#nameEnter").val().trim();
            $(this).val("");
            $(this).blur();
            playerNameFormatted = playerName.charAt(0).toUpperCase() + playerName.slice(1);
        }
    });

    $("start").on("click", function (e) {
        e.preventDefault();
        playerName = $("#nameEnter").val().trim();
        $("#nameEnter").val("");
        $("#nameEnter").blur();
        playerNameFormatted = playerName.charAt(0).toUpperCase() + playerName.slice(1);
    });

    $("#robotU").on("click", function () {
        if (playerName !== "") {
            $("#yourName").html(playerNameFormatted);
        } else {
            createsModals("Please enter your name");
        }

        $("#robotU").removeClass("bots");
        $("#robotU").addClass("iconPicked");
        $("#uBorder").removeClass(".borders");
        $("#uBorder").addClass("inanimBorder");
        $("#robotX").addClass("inactiveIcon");
        $("#xBorder").removeClass(".borders");
        $("#xBorder").addClass("inactiveBorder");
    });
    

    $("#robotX").on("click", function () {
        if (playerNameFormatted !== "") {
            $("#opponentName").html(playerNameFormatted);
        } else {
            let modalBox = $("<div id='nameModal' class='modal'>"+
            "<p>Please enter your name</p></div>");
            $("playerZone").append(modalBox);
        }
        $("#robotX").removeClass("bots");
        $("#robotX").addClass("iconPicked");
        $("#xBorder").removeClass(".borders");
        $("#xBorder").addClass("inanimBorder");
        $("#robotU").addClass("inactiveIcon");
        $("#uBorder").removeClass(".borders");
        $("#uBorder").addClass("inactiveBorder");
        if (playerNameFormatted !== "") {
            $("#opponentName").html(playerNameFormatted);
        }
    });

});