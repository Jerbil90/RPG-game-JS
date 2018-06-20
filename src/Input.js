
function Input(game) {
  this.game = game;
  this.inputArray = [];
}
//This method is called when a keydown event is triggered
Input.prototype.handleKeyDown = function(event) {
  console.log(event.code);
  //First make sure that the key is not already down to avoid repeated keypresses
  var isAlreadyPressed = false;
  for(let i = 0 ; i < this.inputArray.length ; i++) {
    if(this.inputArray[i] == event.code) {
      isAlreadyPressed = true;
    }
  }

  if(!isAlreadyPressed) {
    if(event.code == "ArrowDown") {
      if(this.game.state == "explore") {
        this.game.exploreScreen.player.isMovingDown = true;
        this.game.exploreScreen.player.orientation.y = 1;
      }
      this.inputArray.push(event.code);
    }
    if(event.code == "ArrowUp") {
      if(this.game.state == "explore") {
        this.game.exploreScreen.player.isMovingDown = true;
        this.game.exploreScreen.player.orientation.y = -1;
      }
      this.inputArray.push(event.code);
    }
    if(event.code == "ArrowLeft") {
      if(this.game.state == "explore") {
        this.game.exploreScreen.player.isMovingDown = true;
        this.game.exploreScreen.player.orientation.x = -1;
      }
      this.inputArray.push(event.code);
    }
    if(event.code == "ArrowRight") {
      if(this.game.state == "explore") {
        this.game.exploreScreen.player.isMovingDown = true;
        this.game.exploreScreen.player.orientation.x = 1;
      }
      this.inputArray.push(event.code);
    }
    if(event.code == "Space") {
      if(this.game.state == "explore") {
        this.game.exploreScreen.player.interact();
      }
      this.inputArray.push(event.code);
    }
  }
}
Input.prototype.handleKeyUp = function(event) {
  console.log(event.code);
  if(event.code == "ArrowDown") {
    if(this.game.state == "explore") {
      this.game.exploreScreen.player.isMovingDown = false;
    }
    for(let i = this.inputArray.length - 1 ; i >= 0 ; i--) {
      if(event.code == this.inputArray[i]) {
        this.inputArray.splice(i, 1);
      }
    }
  }
  if(event.code == "ArrowUp") {
    if(this.game.state == "explore") {
      this.game.exploreScreen.player.isMovingDown = false;
    }
    for(let i = this.inputArray.length - 1 ; i >= 0 ; i--) {
      if(event.code == this.inputArray[i]) {
        this.inputArray.splice(i, 1);
      }
    }
  }
  if(event.code == "ArrowLeft") {
    if(this.game.state == "explore") {
      this.game.exploreScreen.player.isMovingDown = false;
    }
    for(let i = this.inputArray.length - 1 ; i >= 0 ; i--) {
      if(event.code == this.inputArray[i]) {
        this.inputArray.splice(i, 1);
      }
    }
  }
  if(event.code == "ArrowRight") {
    if(this.game.state == "explore") {
      this.game.exploreScreen.player.isMovingDown = false;
    }
    for(let i = this.inputArray.length - 1 ; i >= 0 ; i--) {
      if(event.code == this.inputArray[i]) {
        this.inputArray.splice(i, 1);
      }
    }
  }
  if(event.code == "Space") {
    if(this.game.state == "explore") {
      this.game.exploreScreen.player.isMovingDown = false;
    }
    for(let i = this.inputArray.length - 1 ; i >= 0 ; i--) {
      if(event.code == this.inputArray[i]) {
        this.inputArray.splice(i, 1);
      }
    }
  }
}

export {Input};
