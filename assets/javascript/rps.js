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
    let hasPlayerOneChosen = false;
    let hasPlayerTwoChosen = false;
    let playerOneChoice = "";
    let playerTwoChoice = "";
    let playerOneWins = 0;
    let playerTwoWins = 0;
    let playerOneLosses = 0;
    let playerTwoLosses= 0;
    let spinnerIcon = '<i class="fa-solid fa-spinner fa-spin-pulse biggerIcon" id="spinner"></i>';
    let checkMark = '<i class="fa-solid fa-check biggerIcon" id="checkMark"></i>';
    let rockIcon = '<i class="fa-solid fa-hand-fist rock biggerIcon id="rockIcon"></i>';
    let paperIcon = '<i class="fa-solid fa-hand paper biggerIcon id="paperIcon"></i>';
    let scissorsIcon = '<i class="fa-solid fa-hand-scissors scissor biggerIcon id="scissorsIcon"></i>';


    // Db values changed event listener.
    // This function is called everytime players data changes.
    onValue(playersRef, function (snapshot) {
        let dbData = snapshot.val();

        if (dbData === null) {
            isPlayerOneConnected = false;
            isPlayerTwoConnected = false;
            return;
        }

        // Check to see if players have joined/nodes have been created
        let firstPlayerId = snapshot.child("1").exists();
        let secondPlayerId = snapshot.child("2").exists();


        if (firstPlayerId) {
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
        }

        if (secondPlayerChoice) {
            playerTwoChoice = dbData["2"].choice;
            hasPlayerTwoChosen = true;
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

        // If player 1 has made a choice and 2 hasn't. Add loading sign and update the UI
        if (hasPlayerOneChosen && !hasPlayerTwoChosen) {
            if (playerId == "1") {
                $(".uHands").addClass("inactive");
                $(".xHands").addClass("inactive");
                $("#xIconContainer").append(spinnerIcon);
            } else {
                $(".uHands").addClass("inactive");
                $("#uIconContainer").append(checkMark);
            } 

        }

        // If both players have made a choice
        if (hasPlayerOneChosen && hasPlayerTwoChosen) {
        
            if (playerId == "2") {
                $(".xHands").addClass("inactive");
            } else {
                $(".uHands").addClass("inactive");
            }

            if (playerTurn == "3") {
                revealsChoices();
                gameRules();
                setTimeout(resetsUI, 2000);
                resetsDatabase();
                
            }
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

            if (isPlayerOneConnected && isPlayerTwoConnected) {
                update(ref(db), {
                    turn: "1"
                });
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

        
    });
    
    $(".playerChoice").on("click", function () {
        let choice = $(this).attr("data-choice");

        $(this).addClass("biggerIcon");

        if (playerTurn == "1") {

            update(playerOneRef, {
                choice: choice
            });
            
            if (hasPlayerTwoChosen) {
                update(ref(db), {
                    turn: "3"
                }); 
            } else {
                update(ref(db), {
                    turn: "2"
                }); 
            }
                       
        } else {
            update(playerTwoRef, {
                choice: choice
            });
            
            if (hasPlayerOneChosen) {
                update(ref(db), {
                    turn: "3"
                }); 
            } else {
                update(ref(db), {
                    turn: "1"
                }); 
            }    
        }
    });
    
    let resetsDatabase = function() {
        set(playerOneRef, {
            name: playerOneName,
            wins: playerOneWins,
            losses: playerOneLosses
        });

        set(playerTwoRef, {
            name: playerTwoName,
            wins: playerTwoWins,
            losses: playerTwoLosses
        });

    }


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
        } else if (playerOneChoice === "scissors" && playerTwoChoice === "paper") {
            update(playerOneRef, {
                wins: playerOneWins + 1
            });
            
            update(playerTwoRef, {
                losses: playerTwoLosses + 1
            });
        }   
        set(ref(db), {
            turn: "1"
        });
    }

    let revealsChoices = function () {
        // Removes turn borders and add back the animated borders
        $("#xBorder").removeClass("currentPlayer");
        $("#robotX").removeClass("iconPicked");
        $("#uBorder").addClass("bordersAnim");
        $("#xBorder").addClass("bordersAnim");
        if (playerId == "2") {
            // Waits before removing the check mark and adding the player 1's choice
            setInterval(function() {}, 200);
            $("#checkMark").remove();
            if (playerOneChoice === "rock") {
                $("#uRock").removeClass("inactive");
                $("#uRock").addClass("biggerIcon");
            } else if (playerOneChoice === "paper") {
                $("#uPaper").removeClass("inactive");
                $("#uPaper").addClass("biggerIcon");
            } else {
                $("#uScissor").removeClass("inactive");
                $("#uScissor").addClass("biggerIcon");
            }
        } else if (playerId == "1") {
            $("#spinner").remove();
            if (playerTwoChoice === "rock") {
                $("#xRock").removeClass("inactive");
                $("#xRock").addClass("biggerIcon");
            } else if (playerTwoChoice === "paper") {
                $("#xPaper").removeClass("inactive");
                $("#xPaper").addClass("biggerIcon");
            } else {
                $("#xScissor").removeClass("inactive");
                $("#xScissor").addClass("biggerIcon");
            }
        }
        
    }

    let resetsUI = function () {
        if (playerId === "1") {
            $(".uHands").removeClass("biggerIcon");
            $(".uHands").removeClass("inactive");
            $(".uHands").removeClass("removeEvent");
            $(".xHands").removeClass("biggerIcon");
            $(".xHands").removeClass("inactiveIcon");
            $(".xHands").removeClass("inactive");
            $("xIconContainer").addClass("disabled");
        } else {
            $(".xHands").removeClass("biggerIcon");
            $(".xHands").removeClass("inactive");
            $(".xHands").removeClass("removeEvent");
            $(".uHands").removeClass("biggerIcon");
            $(".uHands").removeClass("inactiveIcon");
            $(".uHands").removeClass("inactive");

        }
    }
});