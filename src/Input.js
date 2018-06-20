
function Input(game) {
  this.game = game;
  this.inputArray = [];
}
//This method is called when a keydown event is triggered
Input.prototype.handleKeyDown = function(event) {
  //First make sure that the key is not already down to avoid repeated keypresses
  var isAlreadyPressed = false;
  for(let i = 0 ; i < this.inputArray.length ; i++) {
    if(this.inputArray[i] == event.code) {
      isAlreadyPressed = true;
    }
  }

  if(!isAlreadyPressed) {
    if(event.code == "ArrowDown") {
      this.inputArray.push(event.code);
    }
    if(event.code == "ArrowUp") {
      this.inputArray.push(event.code);
    }
    if(event.code == "ArrowLeft") {
      this.inputArray.push(event.code);
    }
    if(event.code == "ArrowRight") {
      this.inputArray.push(event.code);
    }
    if(event.code == "Space") {
      if(this.game.state == "explore") {
        this.game.exploreScreen.player.interact();
      }
      this.inputArray.push(event.code);
    }
    if(event.code == "Enter") {
      if(this.game.state == "explore") {
        this.game.openMainMenu();
      }
      this.inputArray.push(event.code);
    }
  }
}
Input.prototype.handleKeyUp = function(event) {
  if(event.code == "ArrowDown") {
    for(let i = this.inputArray.length - 1 ; i >= 0 ; i--) {
      if(event.code == this.inputArray[i]) {
        this.inputArray.splice(i, 1);
      }
    }
  }
  if(event.code == "ArrowUp") {
    for(let i = this.inputArray.length - 1 ; i >= 0 ; i--) {
      if(event.code == this.inputArray[i]) {
        this.inputArray.splice(i, 1);
      }
    }
  }
  if(event.code == "ArrowLeft") {
    for(let i = this.inputArray.length - 1 ; i >= 0 ; i--) {
      if(event.code == this.inputArray[i]) {
        this.inputArray.splice(i, 1);
      }
    }
  }
  if(event.code == "ArrowRight") {
    for(let i = this.inputArray.length - 1 ; i >= 0 ; i--) {
      if(event.code == this.inputArray[i]) {
        this.inputArray.splice(i, 1);
      }
    }
  }
  if(event.code == "Space") {
    for(let i = this.inputArray.length - 1 ; i >= 0 ; i--) {
      if(event.code == this.inputArray[i]) {
        this.inputArray.splice(i, 1);
      }
    }
  }
  if(event.code == "Enter") {
    for(let i = this.inputArray.length - 1 ; i >= 0 ; i--) {
      if(event.code == this.inputArray[i]) {
        this.inputArray.splice(i, 1);
      }
    }
  }
}

export {Input};
