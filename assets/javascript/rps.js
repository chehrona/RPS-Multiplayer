import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'
import { getDatabase, ref, set, onValue, update, push, child, onDisconnect } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js"

const firebaseConfig = {
  apiKey: "AIzaSyCZrfcX2V7iJtWNDmyyU6lan6mmlS1o3Hw",
  authDomain: "multi-rps-cd56d.firebaseapp.com",
  projectId: "multi-rps-cd56d",
  databaseURL: "https://multi-rps-cd56d-default-rtdb.firebaseio.com/",
  storageBucket: "multi-rps-cd56d.appspot.com",
  messagingSenderId: "309281822897",
  appId: "1:309281822897:web:81aa3e8458154811f36a90",
  measurementId: "G-5L5YJBPDFD"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const playersRef = ref(db, "players");
const playerOneRef = ref(db, "players/1");
const playerTwoRef = ref(db, "players/2");


$(document).ready(function () {
    // Plays my dorky sound.
    // $("<audio></audio>").attr({
    //     'src':'assets/javascript/hello.wav',
    //     'autoplay':'autoplay'
    // }).appendTo("body");
    
    // Declaring global variables.
    let isPlayerOneConnected = false;
    let isPlayerTwoConnected = false;
    let playerName = "";
    let playerOneName = "";
    let playerTwoName = "";
    let playerId = "";
    let spinnerIcon = '<i class="fa-solid fa-spinner fa-spin-pulse biggerIcon" id="spinner"></i>';

    // Db values changed event listener.
    // This function is called everytime players data changes.
    onValue(playersRef, function (snapshot) {
        let dbData = snapshot.val();

        

        let firstPlayerId = "1" in dbData;
        let secondPlayerId = "2" in dbData;

        if (dbData === null) {
            isPlayerOneConnected = false;
            isPlayerTwoConnected = false;
            return;
        }
        
        if (firstPlayerId) {
            playerOneName = snapshot.val()["1"].name;
            $("#yourName").html(playerOneName);
            isPlayerOneConnected = true;
        }
        
        if (secondPlayerId) {
            playerTwoName = snapshot.val()["2"].name;
            isPlayerTwoConnected = true;
            $("#opponentName").html(playerTwoName);
        } 

    });

    // Player types name and presses enter key
    $("#nameEnter").keypress(function (e) {
        if (e.keyCode == "13") {
            playerName = $("#nameEnter").val().trim();
            if (playerName === "") {
                createsModals("Please enter your name");
                return;
            } 
            
            // Bounce icon to indicate select player
            $(".playerIcon").addClass("highlightPlayerIcon");

            $(this).val("");
            $(this).blur();

            // If the player 1 slot is occupied, immediately put the entered name to the opponent screen to prevent manual selection.
            if (isPlayerOneConnected) {
                $("#yourScreen").addClass("disabled");
                $("#opponentName").html(playerName);
                $("#robotX").removeClass("bots");
                $("#robotX").addClass("iconPicked");
                $("#xBorder").removeClass(".borders");
                $("#xBorder").addClass("inanimBorder");
                $("#robotU").addClass("inactiveIcon");
                $("#uBorder").removeClass(".borders");
                $("#uBorder").addClass("inactiveBorder");
                $(".playerIcon").removeClass("highlightPlayerIcon");
                
                set(playerTwoRef, {
                    name: playerName,
                    losses: 0,
                    wins: 0
                });

                onDisconnect(playerTwoRef).remove();

            } else if (isPlayerTwoConnected) {
                $("#opponentScreen").addClass("disabled");
                $("#yourName").html(playerName);
                $("#robotU").removeClass("bots");
                $("#robotU").addClass("iconPicked");
                $("#uBorder").removeClass(".borders");
                $("#uBorder").addClass("inanimBorder");
                $("#robotX").addClass("inactiveIcon");
                $("#xBorder").removeClass(".borders");
                $("#xBorder").addClass("inactiveBorder");
                $(".playerIcon").removeClass("highlightPlayerIcon");
                
                set(playerOneRef, {
                    name: playerName,
                    losses: 0,
                    wins: 0
                });

                onDisconnect(playerOneRef).remove();
            }
           
            //  Prevents entering another name.
            $("#nameEnter").attr("disabled", true);  
        }
    });

    $(".playerIcon").on("click", function () {
        // Prevents user updates if either of the player is connected.
        if (isPlayerOneConnected || isPlayerTwoConnected) {
            return;
        }
        if (playerName == "") {
            createsModals("Please enter your name");
            return;
        }

        playerId = $(this).attr("data-id-player");

        // Save to db
        let playerRef = ref(db, "players/" + playerId);
        set(playerRef, {
            name: playerName,
            losses: 0,
            wins: 0
        });

        onDisconnect(playerRef).remove();

        // Update UI
        if (isPlayerOneConnected) {
            $("#opponentScreen").addClass("disabled");
            $("#robotU").removeClass("bots");
            $("#robotU").addClass("iconPicked");
            $("#uBorder").removeClass(".borders");
            $("#uBorder").addClass("inanimBorder");
            $("#robotX").addClass("inactiveIcon");
            $("#xBorder").removeClass(".borders");
            $("#xBorder").addClass("inactiveBorder");
        }  else if (isPlayerTwoConnected) {
            $("#yourScreen").addClass("disabled");
            $("#robotX").removeClass("bots");
            $("#robotX").addClass("iconPicked");
            $("#xBorder").removeClass(".borders");
            $("#xBorder").addClass("inanimBorder");
            $("#robotU").addClass("inactiveIcon");
            $("#uBorder").removeClass(".borders");
            $("#uBorder").addClass("inactiveBorder");         
        }      

        $(".playerIcon").removeClass("highlightPlayerIcon");
        
    });
    
    $(".rock").on("click", function () {
        if (isPlayerOneConnected && isPlayerTwoConnected) {
            $(".playerIcon").addClass("disable");
        } else if (isPlayerOneConnected) {
            createsModals("Wait for player 2 to join");
            $("#playZone").addClass("disabled");
            return;
        } else if (isPlayerTwoConnected) {
            createsModals("Wait for player 1 to join");
            $("#playZone").addClass("disabled");
            return;
        }  
        if ((playerName == "") || (!isPlayerOneConnected) || (!isPlayerTwoConnected)) {
            createsModals("Please enter your name");
            return;
        }

        playerId = $(this).attr("data-id-player");

        if (isPlayerOneConnected) {
            $("#opponentName").html("Waiting...");
            $("#xIconContainer").append(spinnerIcon);

            $("#uRock").addClass("biggerIcon");
            $("#uPaper").addClass("inactive");
            $("#uScissor").addClass("inactive");
            $("#xPaper").addClass("inactive");
            $("#xScissor").addClass("inactive");
            $("#xRock").addClass("inactive");

            update(playerOneRef, {
                choice: "rock"
            });

            onDisconnect(playersRef).remove();
        } else {
            $("#opponentName").html(playerTwoName);
            $("#yourName").html("Waiting...");
            $("#xRock").addClass("biggerIcon");
            $("#uIconContainer").append(spinnerIcon);

            $("#xPaper").addClass("inactive");
            $("#xScissor").addClass("inactive");
            $("#uPaper").addClass("inactive");
            $("#uScissor").addClass("inactive");
            $("#uRock").addClass("inactive");

            update(playerTwoRef, {
                choice: "rock"
            });

            onDisconnect(playersRef).remove();
        } 
    });


    // Creates modals based on the message passed to the function.
    let createsModals = function (message) {
        $("#playZone").addClass("inactiveBackground");
        $(".popup").removeClass("inactive");
        $(".popup").addClass("active");
        $("#popupContent").text(message);
        $(".xMark").on("click", function() {
            $(".popup").removeClass("active");
            $(".popup").addClass("inactive");
            $("#playZone").removeClass("inactiveBackground");
        });
    }
});