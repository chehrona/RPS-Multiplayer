import {
  db,
  playerOneRef,
  playerTwoRef,
  turnRef,
  chatRef,
  playersRef,
} from "./firebase.js";

import {
  onValue,
  set,
  update,
  ref,
  onDisconnect,
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";

$(document).ready(function () {
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
  let playerTwoLosses = 0;
  let spinnerIcon =
    '<i class="fa-solid fa-spinner fa-spin-pulse biggerIcon" id="spinner"></i>';
  let checkMark = '<i class="fa-solid fa-check biggerIcon" id="checkMark"></i>';

  $(".closeButton").on("click", function () {
    $(".infoContainer").addClass("close-infoContainer");
    $("#playerName").removeClass("disabled");
  });

  $(".infoIcon").on("click", function () {
    $(".infoContainer").removeClass("close-infoContainer");
  });

  // Db values changed event listener.
  // This function is called everytime players data changes.
  onValue(playersRef, function (snapshot) {
    let dbData = snapshot.val();

    if (dbData === null) {
      isPlayerOneConnected = false;
      isPlayerTwoConnected = false;
      $("#messageBoard").empty();
      return;
    }

    // Check to see if players have joined/nodes have been created
    let firstPlayerId = snapshot.child("1").exists();
    let secondPlayerId = snapshot.child("2").exists();

    if (firstPlayerId) {
      playerOneName = snapshot.val()["1"].name;
      isPlayerOneConnected = true;
      $("#yourName").html(playerOneName);

      if (!isPlayerTwoConnected) {
        $("#opponentName").html("Waiting...");
      }
    }

    if (secondPlayerId) {
      playerTwoName = dbData["2"].name;
      isPlayerTwoConnected = true;
      $("#opponentName").html(playerTwoName);

      if (!isPlayerOneConnected) {
        $("#yourName").html("Waiting...");
      }
    }

    if (isPlayerOneConnected && isPlayerTwoConnected) {
      // Activates the chat
      $("#messageBox").addClass("messageBoxBorder");
      $("#messageBox").removeAttr("disabled");
      $("#messageBox").attr("placeholder", "Type a message");
      $("#paperPlane").removeClass("disabled");
      $("#paperPlane").addClass("flickerPlane");
    }

    // Retrieves choice data for each player
    let firstPlayerChoice = snapshot.child("1/choice").exists();
    let secondPlayerChoice = snapshot.child("2/choice").exists();

    if (firstPlayerChoice) {
      playerOneChoice = dbData["1"].choice;
      hasPlayerOneChosen = true;
    } else {
      hasPlayerOneChosen = false;
    }

    if (secondPlayerChoice) {
      playerTwoChoice = dbData["2"].choice;
      hasPlayerTwoChosen = true;
    } else {
      hasPlayerTwoChosen = false;
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

    $("#uBorder").removeClass("bordersAnim");
    $("#xBorder").removeClass("bordersAnim");

    if (playerTurn == "1") {
      // Removes highlights from the player 2 and adds it to player 1
      $("#xBorder").removeClass("currentPlayer");
      $("#uBorder").addClass("currentPlayer");

      $(".xHands").addClass("disabled");
      if (playerTurn === playerId) {
        // Highlight player 1 and enable buttons
        $(".uHands").removeClass("disabled");
      } else {
        // Highlight player 1 and disable buttons
        $(".uHands").addClass("disabled");
      }
    } else if (playerTurn == "2") {
      // Removes highlights from the player 1 and adds it to player 2
      $("#uBorder").removeClass("currentPlayer");
      $("#xBorder").addClass("currentPlayer");

      $(".uHands").addClass("disabled");
      if (playerTurn === playerId) {
        $(".xHands").removeClass("disabled");
      } else {
        $(".xHands").addClass("disabled");
      }
    }

    // If player 1 has made a choice and 2 hasn't. Add loading sign and update the UI
    if (hasPlayerOneChosen && !hasPlayerTwoChosen) {
      if (playerId == "1") {
        // Removes two other non-clicked icons
        $(".uHands").addClass("inactive");
        $(".xHands").addClass("inactive");
        if ($("#spinnerIcon").length === 0) {
          $("#xIconContainer").append(spinnerIcon);
        }
      } else {
        $(".uHands").addClass("inactive");
        if ($("#checkMark").length === 0) {
          $("#uIconContainer").append(checkMark);
        }
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
        setTimeout(resetGame, 4000);
      }
    }
  });

  const onNameEntered = () => {
    playerName = $("#nameEnter").val().trim();
    playerName = playerName.charAt(0).toUpperCase() + playerName.slice(1);
    if (playerName === "") {
      createsModals("Please enter your name");
      return;
    }

    // If the player 1 slot is occupied, immediately put the entered name to the opponent screen to prevent manual selection.
    if (!isPlayerOneConnected && !isPlayerTwoConnected) {
      $("#yourName").html(playerName);

      playerId = "1";
    } else if (isPlayerOneConnected) {
      $("#opponentName").html(playerName);

      playerId = "2";
    }

    joinGame();

    if (isPlayerOneConnected && isPlayerTwoConnected) {
      // Activates the chat
      $("#messageBox").addClass("messageBoxBorder");
      $("#messageBox").removeAttr("disabled");
      $("#paperPlane").removeClass("disabled");
      $("#paperPlane").addClass("flickerPlane");

      // Player 1 always starts first
      update(ref(db), {
        turn: "1",
      });

      // Remove turn and chat history when a player disconnects
      onDisconnect(turnRef).remove();
      onDisconnect(chatRef).remove();
    }

    // Prevents entering another name.
    $("#playerName").addClass("disabled");
    $("#nameEnter").attr("disabled", true);
    $("#nameEnter").val("");
  };

  // Player types name and presses enter key
  $("#nameEnter").keypress(function (e) {
    // Only accept 'enter' key
    if (e.keyCode === "13") {
      onNameEntered();
    }
  });

  $("#start").on("click", function (e) {
    e.preventDefault();
    onNameEntered();
  });

  let joinGame = function () {
    // Save to db
    let playerRef = ref(db, "players/" + playerId);
    set(playerRef, {
      name: playerName,
      losses: 0,
      wins: 0,
    });

    onDisconnect(playerRef).remove();
    onDisconnect(chatRef).remove();
  };

  $(".playerIcon").on("click", function () {
    $(".playerIcon").removeClass("highlightPlayerIcon");

    // Prevents user updates if either of the player is connected.
    if (isPlayerOneConnected || isPlayerTwoConnected) {
      return;
    }
    if (playerName == "") {
      createsModals("Please enter your name");
      return;
    }

    playerId = $(this).attr("data-id-player");

    joinGame();
  });

  $(".playerChoice").on("click", function () {
    let choice = $(this).attr("data-choice");

    $(this).addClass("biggerIcon");

    // Player 1 always makes first choice
    if (playerTurn == "1") {
      update(playerOneRef, {
        choice: choice,
      });

      update(ref(db), {
        turn: "2",
      });
    } else if (playerTurn == "2") {
      update(playerTwoRef, {
        choice: choice,
      });
      // Turn 3 means game finished
      update(ref(db), {
        turn: "3",
      });
    }
  });

  let resetGame = function () {
    set(playerOneRef, {
      name: playerOneName,
      wins: playerOneWins,
      losses: playerOneLosses,
    });

    set(playerTwoRef, {
      name: playerTwoName,
      wins: playerTwoWins,
      losses: playerTwoLosses,
    });

    $(".playerChoice").removeClass("biggerIcon");
    $(".playerChoice").removeClass("inactive");

    update(ref(db), {
      turn: "1",
    });

    $("#checkMark").remove();
    $("#spinner").remove();
  };

  // Creates modals based on the message passed to the function.
  let createsModals = function (message) {
    $("#playZone").addClass("disabled");
    $(".popup").addClass("active");
    $("#popupContent").text(message);

    setTimeout(function () {
      $(".popup").removeClass("active");
      $("#playZone").removeClass("disabled");
    }, 3000);
  };

  let gameRules = function () {
    if (playerOneChoice === playerTwoChoice) {
      createsModals("It is a tie");
    } else if (playerOneChoice === "rock" && playerTwoChoice === "paper") {
      createsModals(playerTwoName + " won");
      update(playerTwoRef, {
        wins: playerTwoWins + 1,
      });

      update(playerOneRef, {
        losses: playerOneLosses + 1,
      });
    } else if (playerOneChoice === "rock" && playerTwoChoice === "scissors") {
      createsModals(playerOneName + " won");
      update(playerOneRef, {
        wins: playerOneWins + 1,
      });

      update(playerTwoRef, {
        losses: playerTwoLosses + 1,
      });
    } else if (playerOneChoice === "paper" && playerTwoChoice === "rock") {
      createsModals(playerOneName + " won");
      update(playerOneRef, {
        wins: playerOneWins + 1,
      });

      update(playerTwoRef, {
        losses: playerTwoLosses + 1,
      });
    } else if (playerOneChoice === "paper" && playerTwoChoice === "scissors") {
      createsModals(playerTwoName + " won");
      update(playerTwoRef, {
        wins: playerTwoWins + 1,
      });

      update(playerOneRef, {
        losses: playerOneLosses + 1,
      });
    } else if (playerOneChoice === "scissors" && playerTwoChoice === "rock") {
      createsModals(playerTwoName + " won");
      update(playerTwoRef, {
        wins: playerTwoWins + 1,
      });

      update(playerOneRef, {
        losses: playerOneLosses + 1,
      });
    } else if (playerOneChoice === "scissors" && playerTwoChoice === "paper") {
      createsModals(playerOneName + " won");
      update(playerOneRef, {
        wins: playerOneWins + 1,
      });

      update(playerTwoRef, {
        losses: playerTwoLosses + 1,
      });
    }
  };

  let revealsChoices = function () {
    // Removes turn borders and add back the animated borders
    $("#xBorder").removeClass("currentPlayer");
    $("#uBorder").addClass("bordersAnim");
    $("#xBorder").addClass("bordersAnim");
    if (playerId == "2") {
      // Waits before removing the check mark and adding the player 1's choice
      setInterval(function () {}, 200);
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
  };

  // Chat functionality
  onValue(chatRef, function (snapshot) {
    $("#messageBoard").empty();
    let chatData = snapshot.val();
    for (let key in chatData) {
      if (chatData[key].playerId === "1") {
        $("#messageBoard").append(
          '<div class="iconTextWrap myIconTextWrap"><div class="iconBorder myIconBorder">' +
            '<i class="fa-solid fa-user userIcons"></i></div><div class="commentBox myComment"><p>' +
            chatData[key].message +
            "</p></div></div>"
        );
      } else {
        $("#messageBoard").append(
          '<div class="iconTextWrap botIconTextWrap"><div class="iconBorder botIconBorder">' +
            '<i class="fa-solid fa-robot userIcons"></i></div><div class="commentBox otherComment"><p>' +
            chatData[key].message +
            "</p></div></div>"
        );
      }
    }
  });

  $("#paperPlane").on("click", function (e) {
    e.preventDefault();

    let message = $("#messageBox").val();

    set(push(chatRef), {
      playerId: playerId,
      message: message,
    });

    $("#messageBox").val("");
    $("#messageBoard").scrollTop(1000000);
  });

  $("#messageBox").keypress(function (e) {
    if (e.keyCode != "13") {
      return;
    }

    let message = $(this).val();

    set(push(chatRef), {
      playerId: playerId,
      message: message,
    });

    $(this).val("");
    $("#messageBoard").scrollTop(1000000);
  });
});
