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
  push,
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
    '<i class="fa-solid fa-spinner fa-spin-pulse selected-icon player-choice-icon feedback-icon" id="spinner"></i>';
  let checkMark =
    '<i class="fa-solid fa-check selected-icon player-choice-icon feedback-icon" id="checkMark"></i>';

  const wasInstructionShown = localStorage.getItem("repeat_user");

  if (!wasInstructionShown) {
    $(".instruction-container").removeClass("close-instruction-container");
  } else {
    $("#player-name-input-container").removeClass("disabled");
  }

  // Db values changed event listener.
  // This function is called everytime players data changes.
  onValue(ref(db), (snapshot) => {
    const dbData = snapshot.val();

    if (dbData === null) {
      reset();
    }

    console.log(dbData, "data is null");
  });

  onValue(playersRef, function (snapshot) {
    const dbData = snapshot.val();

    if (dbData === null) {
      reset();
      return;
    }

    // Check to see if players have joined/nodes have been created
    let firstPlayerId = snapshot.child("1").exists();
    let secondPlayerId = snapshot.child("2").exists();

    if (firstPlayerId) {
      playerOneName = dbData["1"].name;
      playerOneWins = dbData["1"].wins;
      playerOneLosses = dbData["1"].losses;

      isPlayerOneConnected = true;

      $("#self-player-name").html(playerOneName);
      $("#self-win-counter").html(playerOneWins);
      $("#self-loss-counter").html(playerOneLosses);

      if (!isPlayerTwoConnected) {
        $("#opponent-player-name").html("Waiting...");
      }
    }

    if (secondPlayerId) {
      playerTwoName = dbData["2"].name;
      playerTwoLosses = dbData["2"].losses;
      playerTwoWins = dbData["2"].wins;

      isPlayerTwoConnected = true;

      $("#opponent-player-name").html(playerTwoName);
      $("#opponent-win-counter").html(playerTwoWins);
      $("#opponent-loss-counter").html(playerTwoLosses);

      if (!isPlayerOneConnected) {
        $("#self-player-name").html("Waiting...");
      }
    }

    if (isPlayerOneConnected && isPlayerTwoConnected) {
      // Activates the chat
      $("#message-input-field").addClass("message-input-field-border");
      $("#message-input-field").removeAttr("disabled");
      $("#message-input-field").attr("placeholder", "Type a message");
      $("#message-plane-icon").removeClass("disabled");
      $("#message-plane-icon").addClass("flickerPlane");
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
  });

  onValue(turnRef, function (snapshot) {
    playerTurn = snapshot.val();

    $("#self-player-wrapper").removeClass("animated-border");
    $("#opponent-player-wrapper").removeClass("animated-border");

    if (playerTurn == "1") {
      // Removes highlights from the player 2 and adds it to player 1
      $("#opponent-player-wrapper").removeClass("current-player-wrapper");
      $("#self-player-wrapper").addClass("current-player-wrapper");

      $(".opponent-choice-icon").addClass("disabled");
      if (playerTurn === playerId) {
        // Highlight player 1 and enable buttons
        $(".self-choice-icon").removeClass("disabled");
      } else {
        // Highlight player 1 and disable buttons
        $(".self-choice-icon").addClass("disabled");
      }
    } else if (playerTurn == "2") {
      // Removes highlights from the player 1 and adds it to player 2
      $("#self-player-wrapper").removeClass("current-player-wrapper");
      $("#opponent-player-wrapper").addClass("current-player-wrapper");

      $(".self-choice-icon").addClass("disabled");
      if (playerTurn === playerId) {
        $(".opponent-choice-icon").removeClass("disabled");
      } else {
        $(".opponent-choice-icon").addClass("disabled");
      }
    }

    // If player 1 has made a choice and 2 hasn't. Add loading sign and update the UI
    if (hasPlayerOneChosen && !hasPlayerTwoChosen) {
      if (playerId == "1") {
        // Removes two other non-clicked icons
        $(".self-choice-icon").addClass("inactive");
        $(".opponent-choice-icon").addClass("inactive");
        if ($("#spinner-icon").length === 0) {
          $("#opponent-choice-icons-container").append(spinnerIcon);
        }
      } else {
        $(".self-choice-icon").addClass("inactive");
        if ($("#checkMark").length === 0) {
          $("#self-choice-icons-container").append(checkMark);
        }
      }
    }

    // If both players have made a choice
    if (hasPlayerOneChosen && hasPlayerTwoChosen) {
      if (playerId == "2") {
        $(".opponent-choice-icon").addClass("inactive");
      } else {
        $(".self-choice-icon").addClass("inactive");
      }

      if (playerTurn == "3") {
        revealsChoices();
        gameRules();
        setTimeout(resetTurn, 4000);
      }
    }
  });

  // Chat functionality
  onValue(chatRef, function (snapshot) {
    $("#messageBoard").empty();
    let chatData = snapshot.val();
    for (let key in chatData) {
      if (chatData[key].playerId === "1") {
        $("#messageBoard").append(
          '<div class="message-row-container self-message-row-container"><div class="message-icon-wrapper self-message-wrapper">' +
            '<i class="fa-solid fa-user message-user-icon"></i></div><div class="message-text-wrapper self-message-wrapper"><p>' +
            chatData[key].message +
            "</p></div></div>"
        );
      } else {
        $("#messageBoard").append(
          '<div class="message-row-container"><div class="message-icon-wrapper opponent-message-wrapper">' +
            '<i class="fa-solid fa-user-tie message-user-icon"></i></div><div class="message-text-wrapper opponent-message-wrapper"><p>' +
            chatData[key].message +
            "</p></div></div>"
        );
      }
    }
  });

  $(".closeButton").on("click", function () {
    localStorage.setItem("repeat_user", true);

    $(".instruction-container").addClass("close-instruction-container");
    $("#player-name-input-container").removeClass("disabled");
  });

  $(".information-icon").on("click", function () {
    $(".instruction-container").removeClass("close-instruction-container");
  });

  const onNameEntered = () => {
    playerName = $("#player-name-input-field").val().trim();
    playerName = playerName.charAt(0).toUpperCase() + playerName.slice(1);
    if (playerName === "") {
      createsModals("Please enter your name");
      return;
    }

    // If the player 1 slot is occupied, immediately put the entered name to the opponent screen to prevent manual selection.
    if (!isPlayerOneConnected && !isPlayerTwoConnected) {
      $("#self-player-name").html(playerName);

      playerId = "1";
    } else if (isPlayerOneConnected) {
      $("#opponent-player-name").html(playerName);

      playerId = "2";
    }

    joinGame();

    if (isPlayerOneConnected && isPlayerTwoConnected) {
      // Activates the chat
      $("#message-input-field").addClass("message-input-field-border");
      $("#message-input-field").removeAttr("disabled");
      $("#message-plane-icon").removeClass("disabled");
      $("#message-plane-icon").addClass("flickerPlane");

      // Player 1 always starts first
      update(ref(db), {
        turn: "1",
      });
    }

    // Prevents entering another name.
    $("#player-name-input-container").addClass("disabled");
    $("#player-name-input-field").attr("disabled", true);
    $("#player-name-input-field").val("");
  };

  // Player types name and presses enter key
  $("#player-name-input-field").keypress(function (e) {
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

    // Remove turn and chat history when a player disconnects
    onDisconnect(playersRef).remove();
    onDisconnect(turnRef).remove();
    onDisconnect(chatRef).remove();
  };

  $(".player-choice-icon").on("click", function () {
    let choice = $(this).attr("data-choice");

    $(this).addClass("selected-icon");

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

  let resetTurn = function () {
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

    $(".player-choice-icon").removeClass("selected-icon");
    $(".player-choice-icon").removeClass("inactive");

    update(ref(db), {
      turn: "1",
    });

    $("#checkMark").remove();
    $("#spinner").remove();
  };

  // Creates modals based on the message passed to the function.
  let createsModals = function (message) {
    $(".player-zone-container").addClass("disabled");
    $(".popup").addClass("active");
    $("#popupContent").text(message);

    setTimeout(function () {
      $(".popup").removeClass("active");
      $(".player-zone-container").removeClass("disabled");
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
    $("#opponent-player-wrapper").removeClass("current-player-wrapper");
    $("#self-player-wrapper").addClass("animated-border");
    $("#opponent-player-wrapper").addClass("animated-border");
    if (playerId == "2") {
      // Waits before removing the check mark and adding the player 1's choice
      setInterval(function () {}, 200);
      $("#checkMark").remove();
      if (playerOneChoice === "rock") {
        $("#uRock").removeClass("inactive");
        $("#uRock").addClass("selected-icon");
      } else if (playerOneChoice === "paper") {
        $("#uPaper").removeClass("inactive");
        $("#uPaper").addClass("selected-icon");
      } else {
        $("#uScissor").removeClass("inactive");
        $("#uScissor").addClass("selected-icon");
      }
    } else if (playerId == "1") {
      $("#spinner").remove();
      if (playerTwoChoice === "rock") {
        $("#xRock").removeClass("inactive");
        $("#xRock").addClass("selected-icon");
      } else if (playerTwoChoice === "paper") {
        $("#xPaper").removeClass("inactive");
        $("#xPaper").addClass("selected-icon");
      } else {
        $("#xScissor").removeClass("inactive");
        $("#xScissor").addClass("selected-icon");
      }
    }
  };

  const reset = () => {
    playerTurn = null;
    playerName = "";
    playerId = "";
    playerOneChoice = "";
    playerTwoChoice = "";
    playerOneWins = 0;
    playerTwoWins = 0;
    playerOneLosses = 0;
    playerTwoLosses = 0;
    isPlayerOneConnected = false;
    isPlayerTwoConnected = false;
    playerOneName = "";
    playerTwoName = "";
    hasPlayerOneChosen = false;
    hasPlayerTwoChosen = false;

    // Reset UI
    $("#self-player-name").html("Player 1");
    $("#self-win-counter").html(0);
    $("#self-loss-counter").html(0);
    $("#opponent-player-name").html("Player 2");
    $("#opponent-win-counter").html(0);
    $("#opponent-loss-counter").html(0);

    $("#player-name-input-container").removeClass("disabled");
    $("#player-name-input-field").attr("disabled", false);

    $("#checkMark").remove();
    $("#spinner").remove();

    $(".player-choice-icon").addClass("disabled");
    $(".player-choice-icon").removeClass("selected-icon");

    $("#opponent-player-wrapper").removeClass("current-player-wrapper");
    $("#self-player-wrapper").removeClass("current-player-wrapper");

    // Reset the chat
    $("#messageBoard").empty();

    // Disable the chat
    $("#message-input-field").removeClass("message-input-field-border");
    $("#message-input-field").attr("disabled", true);
    $("#message-input-field").attr("placeholder", "");
    $("#message-plane-icon").addClass("disabled");
    $("#message-plane-icon").removeClass("flickerPlane");

    $("#uRock").removeClass("inactive");
    $("#uPaper").removeClass("inactive");
    $("#uScissor").removeClass("inactive");
    $("#xRock").removeClass("inactive");
    $("#xPaper").removeClass("inactive");
    $("#xScissor").removeClass("inactive");

    $("#opponent-player-wrapper").removeClass("current-player-wrapper");
    $("#self-player-wrapper").removeClass("current-player-wrapper");
  };

  $("#message-plane-icon").on("click", function (e) {
    e.preventDefault();

    let message = $("#message-input-field").val();

    set(push(chatRef), {
      playerId: playerId,
      message: message,
    });

    $("#message-input-field").val("");
    $("#messageBoard").scrollTop(1000000);
  });

  $("#message-input-field").keypress(function (e) {
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
