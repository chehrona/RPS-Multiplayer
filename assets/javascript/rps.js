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
const turnRef = ref(db, "turn");


$(document).ready(function () {
    // Plays my dorky sound.
    // $("<audio></audio>").attr({
    //     'src':'assets/javascript/hello.wav',
    //     'autoplay':'autoplay'
    // }).appendTo("body");
    
    // Declaring global variables.
    let isPlayerOneConnected = false;
    let isPlayerTwoConnected = false;
    let playerTurn = null;
    let playerName = "";
    let playerOneName = "";
    let playerTwoName = "";
    let playerId = "";
    let spinnerIcon = '<i class="fa-solid fa-spinner fa-spin-pulse biggerIcon" id="spinner"></i>';
    let checkMark = '<i class="fa-solid fa-check biggerIcon" id="checkMark"></i>'
    let hasPlayerOneChosen = false;
    let hasPlayerTwoChosen = false;
    let playerOneChoice = "";
    let playerTwoChoice = "";
    let playerOneWins = 0;
    let playerTwoWins = 0;
    let playerOneLosses = 0;
    let playerTwoLosses= 0;


    // Db values changed event listener.
    // This function is called everytime players data changes.
    onValue(playersRef, function (snapshot) {
        let dbData = snapshot.val();
        let playerOneScreen = null;
        let playerTwoScreen = null;

        if (dbData === null) {
            isPlayerOneConnected = false;
            isPlayerTwoConnected = false;
            return;
        }

        let firstPlayerId = snapshot.child("1").exists();
        let secondPlayerId = snapshot.child("2").exists();


        if (firstPlayerId) {
            playerOneScreen = true;
            playerOneName = snapshot.val()["1"].name;
            isPlayerOneConnected = true;
            $("#yourName").html(playerOneName);
            $("#opponentName").html("Joining...");
            $("#robotX").addClass("disabled");
            if (!isPlayerTwoConnected) {
                $("#opponentName").html("Joining...");
            }
        }
        
        if (secondPlayerId) {
            playerTwoScreen = true;
            playerTwoName = dbData["2"].name;
            isPlayerTwoConnected = true;
            $("#opponentName").html(playerTwoName);
            $("#robotU").addClass("disabled");
            if (!isPlayerOneConnected) {
                $("#yourName").html("Joining...");
            }
        } 

        if (isPlayerOneConnected && isPlayerTwoConnected) {
            $(".xIcons").removeClass("disabled");
            $(".uIcons").removeClass("disabled");
        } 
        else {
            $(".xIcons").addClass("disabled");
            $(".uIcons").addClass("disabled")
        }
        $(".playerIcon").removeClass("highlightPlayerIcon");

        // Retrieves choice data for each player
        let firstPlayerChoice = snapshot.child("1/choice").exists();
        let secondPlayerChoice = snapshot.child("2/choice").exists();

        if (firstPlayerChoice) {
            playerOneChoice = dbData["1"].choice;
            hasPlayerOneChosen = true;
            // $("#uBorder").removeClass("currentPlayer");
            // $("#robotU").removeClass("iconPicked");
        }

        if (secondPlayerChoice) {
            playerTwoChoice = dbData["2"].choice;
            hasPlayerTwoChosen = true;
            // $("#xBorder").removeClass("currentPlayer");
            // $("#robotX").removeClass("iconPicked");
        }

        // Retrieves wins and losses
        playerOneWins = dbData["1"].wins;
        playerTwoWins = dbData["2"].wins;
        playerOneLosses = dbData["1"].losses;
        playerTwoLosses = dbData["2"].losses;

        $("#uWinCount").html(playerOneWins);
        $("#uLossCount").html(playerOneLosses);
        $("#xWinCount").html(playerTwoWins);
        $("#xLossCount").html(playerTwoLosses);

    });

    onValue(turnRef, function (snapshot) {
        playerTurn = snapshot.val();

        if (playerTurn == "1") {
            $(".playerIcon").css({"pointer-events": "none"});
            // Removes highlights from the player 2 and adds it to player 1
            $("#xBorder").removeClass("currentPlayer");
            $("#robotX").removeClass("iconPicked");
            $("#uBorder").addClass("currentPlayer");
            $("#robotU").addClass("iconPicked");
            $("#uBorder").removeClass("bordersAnim");
            if (playerTurn === playerId) {
                // Highlight player 1 and enable buttons
                $(".uIcons").removeClass("removeEvent");
                $("#xBorder").removeClass("bordersAnim");
                $(".xIcons").addClass("inactiveIcon");
            } else {
                // Highlight player 1 and disable buttons
                $(".xIcons").addClass("removeEvent");
                $(".uIcons").addClass("inactiveIcon");
            }
        } else if (playerTurn == "2") {
            $(".playerIcon").css({"pointer-events": "none"});
            // Removes highlights from the player 1 and adds it to player 2
            $("#uBorder").removeClass("currentPlayer");
            $("#robotU").removeClass("iconPicked");
            $("#xBorder").addClass("currentPlayer");
            $("#robotX").addClass("iconPicked");
            $("#xBorder").removeClass("bordersAnim");
            if (playerTurn === playerId) {
                $(".xIcons").removeClass("removeEvent");
                $("#uBorder").removeClass("bordersAnim");
                $(".uIcons").addClass("inactiveIcon");
            } else {
                $(".uIcons").addClass("removeEvent");
                $("#xBorder").addClass("currentPlayer");
            }
        }

        if (hasPlayerOneChosen && hasPlayerTwoChosen) {
            gameRules();
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
                $("#opponentName").html(playerName);
                $("#xBorder").removeClass("bordersAnim");
                
                set(playerTwoRef, {
                    name: playerName,
                    losses: 0,
                    wins: 0
                });

                onDisconnect(playerTwoRef).remove();
                playerId = "2";

            } else if (isPlayerTwoConnected) {
                $("#yourName").html(playerName);
                $("#uBorder").removeClass("bordersAnim");
                set(playerOneRef, {
                    name: playerName,
                    losses: 0,
                    wins: 0
                });

                onDisconnect(playerOneRef).remove();
                playerId = "1";
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
        console.log("Updating turn...");
        
        update(ref(db), {
            turn: playerId
        });

        if (!isPlayerOneConnected && !isPlayerTwoConnected) {
            onDisconnect(turnRef).remove();
        }

        // Save to db
        let playerRef = ref(db, "players/" + playerId);
        set(playerRef, {
            name: playerName,
            losses: 0,
            wins: 0
        });

        onDisconnect(playerRef).remove();

        
    });
    
    $(".playerChoice").on("click", function () {
        let choice = $(this).attr("data-choice");

        if (playerTurn == "1") {

            update(playerOneRef, {
                choice: choice
            });
            
            update(ref(db), {
                turn: "2"
            });            
        } else {
            update(playerTwoRef, {
                choice: choice
            });
            
            update(ref(db), {
                turn: "1"
            });    
        }
    });
    //     if (playerId == "1") {
    //         $("#xIconContainer").append(spinnerIcon);
    //         pla
    //         $("#uScissor").addClass("inactive");
    //         $("#xPaper").addClass("inactive");
    //         $("#xScissor").addClass("inactive");
    //         $("#xRock").addClass("inactive");

    //         update(playerOneRef, {
    //             choice: "rock"
    //         });

    //         onDisconnect(playersRef).remove();

    //         update(ref(db), {
    //             turn: "2"
    //         });
    //     } else if (playerId == "2") {
    //         if (hasPlayerOneChosen) {
    //             $("#uIconContainer").append(checkMark);
    //         } else {
    //             $("#IconContainer").append(spinnerIcon);
    //         }
            
    //         $("#xRock").addClass("biggerIcon");
    //         $("#xPaper").addClass("inactive");
    //         $("#xScissor").addClass("inactive");
    //         $("#uPaper").addClass("inactive");
    //         $("#uScissor").addClass("inactive");
    //         $("#uRock").addClass("inactive");

    //         update(playerOneRef, {
    //             choice: "rock"
    //         });

    //         onDisconnect(playersRef).remove();

    //         update(ref(db), {
    //             turn: "2"
    //         });
    //     }

        



            
        // } else {
        //     $("#opponentName").html(playerTwoName);
        //     $("#yourName").html("Waiting...");
        //     $("#xRock").addClass("biggerIcon");
        //     $("#uIconContainer").append(spinnerIcon);

        //     $("#xPaper").addClass("inactive");
        //     $("#xScissor").addClass("inactive");
        //     $("#uPaper").addClass("inactive");
        //     $("#uScissor").addClass("inactive");
        //     $("#uRock").addClass("inactive");

        //     update(playerTwoRef, {
        //         choice: "rock"
        //     });

        //     onDisconnect(playersRef).remove();
        // } 
    


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
    };

    let gameRules = function() {
        if (playerOneChoice === playerTwoChoice) {
            console.log("Play again. Tie");
        } else if (playerOneChoice === "rock" && playerTwoChoice === "paper") {
            update(playerTwoRef, {
                wins: playerTwoWins + 1
            });

            update(playerOneRef, {
                losses: playerOneLosses + 1
            });

        } else if (playerOneChoice === "rock" && playerTwoChoice === "scissors") {
            update(playerOneRef, {
                wins: playerOneWins + 1
            });

            update(playerTwoRef, {
                losses: playerTwoLosses + 1
            });
        } else if (playerOneChoice === "paper" && playerTwoChoice === "rock") {
            update(playerOneRef, {
                wins: playerOneWins + 1
            });

            update(playerTwoRef, {
                losses: playerTwoLosses + 1
            });
        } else if (playerOneChoice === "paper" && playerTwoChoice === "scissors") {
            update(playerTwoRef, {
                wins: playerTwoWins + 1
            });

            update(playerOneRef, {
                losses: playerOneLosses + 1
            });
        } else if (playerOneChoice === "scissors" && playerTwoChoice === "rock") {
            update(playerTwoRef, {
                wins: playerTwoWins + 1
            });

            update(playerOneRef, {
                losses: playerOneLosses + 1
            });

            playerTwoWins++;
        } else if (playerOneChoice === "scissors" && playerTwoChoice === "paper") {
            update(playerOneRef, {
                wins: playerOneWins + 1
            });

            update(playerTwoRef, {
                losses: playerTwoLosses + 1
            });
        }

        hasPlayerOneChosen = false;
        hasPlayerTwoChosen = false;

        // Update turn
        

        // onDisconnect(playersRef).remove();     
    }
});