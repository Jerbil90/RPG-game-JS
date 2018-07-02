import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager} from './Manager'

function EnvironmentalObject(screen) {
  this.screen = screen;
  this.position = {x: 0, y: 0};
  this.height = 0;
  this.length = 0;
  this.isCurrentlyBeingCheckedForCollisions = false;
}
EnvironmentalObject.prototype.setPosition = function (a, b) {
    this.position = {x: a, y: b};
};
EnvironmentalObject.prototype.setCollisionBoxSize = function (length, height) {
  this.length = length;
  this.height = height;
};
EnvironmentalObject.prototype.load = function () {
  this.setCollisionBoxSize(16, 16);
};
EnvironmentalObject.prototype.update = function(gameTime, elapsedTime) {

}
EnvironmentalObject.prototype.draw = function(ctx) {

}

function NPCManager(screen) {
  Manager.call(this, screen);
}
NPCManager.prototype = Object.create(Manager.prototype);
NPCManager.prototype.constructor = NPCManager;
//Thismethod populates the assetList with the appropriate NPCs
NPCManager.prototype.load = function() {
  this.assetList = [];
  var npcList = this.screen.mapObject.layers[2].objects;
  for(let i = 0 ;i < npcList.length ; i++) {
    var nPC = new NPC(this.screen);
    nPC.setPosition(npcList[i].x, npcList[i].y);
    nPC.setMessage(npcList[i].properties.dialogue);
    console.log(npcList[i].name);
    this.assetList.push(nPC);
  }
}
NPCManager.prototype.update = function(gameTime, elapsedTime) {
  if (this.screen.state == "explore") {
    Manager.prototype.update.call(this, gameTime, elapsedTime);
  }
}

function NPC(screen) {
  this.screen = screen;
  EnvironmentalObject.call(this, screen);
  this.focus = null;
  this.idleTime = null;
  this.lastMovementTime = null;
  this.orientation = {x: 0, y: 1};
  this.movementDuration = null;
  this.speed = 50;
  this.nPCDialogue = "Do you know the way?";
  this.load();
}
NPC.prototype = Object.create(EnvironmentalObject.prototype);
NPC.prototype.constructor = NPC;
NPC.prototype.update = function(gameTime, elapsedTime) {
  if(this.lastMovementTime == null) {
    this.lastMovementTime = gameTime;
    this.idleTime = 2000 + Math.random()*3000;
  }
  else {
    if(gameTime >= this.lastMovementTime + this.idleTime) {
      this.startRandomMovement();
      this.lastMovementTime = gameTime;
    }
    if(this.movementDuration != null) {
      if(gameTime >= this.lastMovementTime + this.movementDuration) {
        this.movementDuration = null;
      }
      else {
        let self = this;
        let velocity = {x: self.orientation.x * self.speed*elapsedTime/1000, y: self.orientation.y * self.speed*elapsedTime/1000};
        let potentialPosition = {x: 0, y: 0};
        potentialPosition.x = this.position.x + velocity.x;
        potentialPosition.y = this.position.y + velocity.y;
        this.isCurrentlyBeingCheckedForCollisions = true;
        if(this.screen.environmentManager.checkPotentialPosition(potentialPosition)) {
          this.position.x = potentialPosition.x;
          this.position.y = potentialPosition.y;
        }
        //else check if they canmove in the x OR the y direction
        else {
          potentialPosition.y -= velocity.y;
          if(this.screen.environmentManager.checkPotentialPosition(potentialPosition)) {
            this.position.x = potentialPosition.x;
          }
          else {
            potentialPosition.y += velocity.y;
            potentialPosition.x -= velocity.x;
            if(this.screen.environmentManager.checkPotentialPosition(potentialPosition)) {
              this.position.y = potentialPosition.y;
            }
          }
        }
      }
    }
  }
  this.isCurrentlyBeingCheckedForCollisions = false;
  this.focus = {x: this.position.x + (this.orientation.x * 16), y: this.position.y + (this.orientation.y * 16), length: 16};
}
NPC.prototype.startRandomMovement = function() {
  var result = Math.floor(Math.random() * 4);
  this.movementDuration = 1000 + Math.random() * 1000;
  switch(result) {
    case 0:
      this.orientation.x = 1;
      this.orientation.y = 0;
    break;
    case 1:
    this.orientation.x = -1;
    this.orientation.y = 0;
    break;
    case 2:
    this.orientation.x = 0;
    this.orientation.y = 1;
    break;
    case 3:
    this.orientation.x = 0;
    this.orientation.y = -1;
    break;
    default:
    console.log("error in NPC.startRandomBattle, invalid result");
    break;
  }
}
NPC.prototype.draw = function(ctx) {
  ctx.fillStyle = "rgb(250, 200, 100)";
  var screenPos = this.screen.camera.getScreenPosition(this.position);
  ctx.fillRect(screenPos.x, screenPos.y, 16, 16);
  if(this.focus != null) {
    ctx.fillStyle = "rgba(250, 200, 100, 0.2)";
    screenPos = this.screen.camera.getScreenPosition(worldPos);
    ctx.fillRect(screenPos.x, screenPos.y, 16, 16);
  }
}
NPC.prototype.interact = function() {
  this.screen.dialogueBox.openDialogueBox(this.nPCDialogue);
}
NPC.prototype.setMessage = function(message) {
  this.nPCDialogue = message;
}

function ChestManager(screen) {
  Manager.call(this, screen);
}
ChestManager.prototype = Object.create(Manager.prototype);
ChestManager.prototype.constructor = ChestManager;
ChestManager.prototype.load = function() {
  this.assetList = [];
  var indexid = 0;
  for(let i = 0 ; i < this.screen.mapObject.layers[1].objects.length ; i++) {
    let chest  = new Chest(this.screen);
    let chestObject = this.screen.mapObject.layers[1].objects[i];
    chest.setPosition(chestObject.x, chestObject.y);
    console.log("chest position set to x: " + chest.position.x + "\t Y: " + chest.position.y);
    let contents = [];
    let contentsString = chestObject.properties.contents
    contents = contentsString.split(',');
    chest.setContents(contents);
    chest.setID(indexid);
    indexid++;

    //perform a check to see if this chest has already been opened;
    if(!this.screen.game.areaStateManager.checkChest(chest.id)) {
      chest.isOpened = true;
      console.log("this chest is already open!");
    }
    this.assetList.push(chest);
  }
}

function Chest(screen) {
  this.screen = screen;
  EnvironmentalObject.call(this, screen);
  this.isOpened = false;
  this.load()
}
Chest.prototype = Object.create(EnvironmentalObject.prototype);
Chest.prototype.constructor = Chest;
Chest.prototype.setContents = function(contents) {
  this.contents = contents;
}
Chest.prototype.update = function(gameTime, elapsedTime) {

}
Chest.prototype.draw = function(ctx) {
  if(this.isOpened) {
    ctx.fillStyle = "rgb(200, 50, 150)";
  }
  else {
    ctx.fillStyle = "rgb(120, 15, 120)";
  }
  var screenPos = this.screen.camera.getScreenPosition(this.position)
  ctx.fillRect(screenPos.x, screenPos.y, 16, 16);
}
//This method is called when the player interacts with the chest, it sets the chest to open and bestows its contents upon the user's inventory and opens a dialogueBox
Chest.prototype.openChest = function() {
  console.log("chest opened");
  this.isOpened = true;
  this.screen.game.areaStateManager.openChest(this.id);
  var message = "Found a";
  for(let  i = 0 ; i < this.contents.length ; i++) {
    for(let j = 0 ; j < this.screen.game.inventory.itemList.length ; j++) {
      if(this.contents[i] == this.screen.game.inventory.itemList[j].name) {
        this.screen.game.inventory.itemList[j].quantity++;
      }
    }
    message += " " + this.contents[i];
  }
  message += "!";
  this.screen.dialogueBox.openDialogueBox(message);
}
Chest.prototype.interact = function() {
  console.log("chest interacted with");
  this.openChest();
}
Chest.prototype.setID = function(id) {
  this.id = id;
}

function Player(screen) {
  this.screen = screen;
  EnvironmentalObject.call(this, screen);
  this.position = this.screen.game.playerPosition;
  this.speed = 250;
  this.orientation = {x: 0, y: 1};
  this.focus = null;
  this.setCollisionBoxSize(16, 16);
}
Player.prototype = Object.create(EnvironmentalObject.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function(gameTime, elapsedTime) {
  if(this.screen.state == "explore") {
    var velocity = {x: 0, y: 0};
    var inputArray = this.screen.game.input.inputArray;
    var potentialPosition = {x: 0, y: 0};
    var orientationArray = [];
    var isMoving = false;
    for(let  i = 0 ; i < 4 ; i++) {
      orientationArray.push(false);
    }
    for(let i = 0 ; i < inputArray.length ; i++) {
      if(inputArray[i] == "ArrowUp") {
        velocity.y -= this.speed * elapsedTime/1000;
        orientationArray[0] = true;
      }
      if(inputArray[i] == "ArrowDown") {
        velocity.y += this.speed * elapsedTime/1000;
        orientationArray[1] = true;
      }
      if(inputArray[i] == "ArrowLeft") {
        velocity.x -= this.speed * elapsedTime/1000;
        orientationArray[2] = true;
      }
      if(inputArray[i] == "ArrowRight") {
        velocity.x += this.speed * elapsedTime/1000;
        orientationArray[3] = true;
      }
    }
    if(velocity.x != 0 || velocity.y != 0) {
      this.screen.battleProgress += elapsedTime;
    }
    //if not going up and not going down, if they are going from side to side then change the vertical orientation to 0;
    if(!orientationArray[0] && !orientationArray[1]) {
      if(orientationArray[2] || orientationArray[3]) {
        this.orientation.y = 0;
      }
    }
    //if not going from side to side, and is going up or down then set horizontal orientation to 0;
    else if (!orientationArray[2] && !orientationArray[3]) {
      if(orientationArray[0] || orientationArray[1]) {
        this.orientation.x = 0;
      }
    }
    if(orientationArray[0]) {
      this.orientation.y = -1;
    }
    if(orientationArray[1]) {
      this.orientation.y = 1;
    }
    if(orientationArray[2]) {
      this.orientation.x = -1;
    }
    if(orientationArray[3]) {
      this.orientation.x = 1;
    }

    potentialPosition.x = this.position.x + velocity.x;
    potentialPosition.y = this.position.y + velocity.y;
    this.isCurrentlyBeingCheckedForCollisions = true;
    if(this.screen.environmentManager.checkPotentialPosition(potentialPosition)) {
      this.position.x = potentialPosition.x;
      this.position.y = potentialPosition.y;
    }
    //else check if they canmove in the x OR the y direction
    else {
      potentialPosition.y -= velocity.y;
      if(this.screen.environmentManager.checkPotentialPosition(potentialPosition)) {
        this.position.x = potentialPosition.x;
      }
      else {
        potentialPosition.y += velocity.y;
        potentialPosition.x -= velocity.x;
        if(this.screen.environmentManager.checkPotentialPosition(potentialPosition)) {
          this.position.y = potentialPosition.y;
        }
      }
    }
    this.isCurrentlyBeingCheckedForCollisions = false;
    this.focus = {x: this.position.x + (this.orientation.x * 16), y: this.position.y + (this.orientation.y * 16), length: 16};
    this.areaTransitionCheck();
  }

}
//This method is called by input and will check the player's focus for anything interactable, if something is found it takes the appropriate action
Player.prototype.interact = function() {
  if(this.screen.state == "explore") {
    var target = null;
    var self = this;
    for(let i = 0 ; i < this.focus.length * this.focus.length ; i++) {
      let pixel = {x: self.focus.x + i%self.focus.length, y: self.focus.y + Math.floor(i/16)};
      for(let j = 0 ; j < this.screen.chestManager.assetList.length ; j++) {
        if(!this.screen.chestManager.assetList[j].isOpened) {
          let chestPos = this.screen.chestManager.assetList[j].position;
          if(pixel.x > chestPos.x && pixel.x < chestPos.x + 16 && pixel.y > chestPos.y && pixel.y < chestPos.y + 16) {
            target = this.screen.chestManager.assetList[j];
            break;
          }
        }
      }
      for(let j = 0 ; j < this.screen.nPCManager.assetList.length ; j++) {
        let nPCPos = this.screen.nPCManager.assetList[j].position;
        if(pixel.x > nPCPos.x && pixel.x < nPCPos.x + 16 && pixel.y > nPCPos.y && pixel.y < nPCPos.y + 16) {
          target = this.screen.nPCManager.assetList[j];
        }
      }
      if (target != null) {
        break;
      }
    }
    if (target != null) {
      target.interact();
    }
  }
  else if(this.screen.state == "inDialogue") {
    this.screen.dialogueBox.advance();
  }
}
Player.prototype.draw = function(ctx) {
  //draw the player position
  ctx.fillStyle = "rgb(0, 0, 250)";
  var screenPos = this.screen.camera.getScreenPosition(this.position);
  ctx.fillRect(screenPos.x, screenPos.y, 16, 16);
  if(this.focus != null) {
    ctx.fillStyle = "rgba(100, 0, 100, 0.25)";
    screenPos = this.screen.camera.getScreenPosition(this.position);
    ctx.fillRect(screenPos.x, screenPos.y, 16, 16);
  }
}
//This method is responsible for checking if the player hascollided with an area transition space and loads the appropriate new area
Player.prototype.areaTransitionCheck = function() {
  var self = this;
  var playerEdge = {x: self.position.x + 16, y: self.position.y + 16};
  var playerCentre = {x: self.position.x + 8, y: self.position.y + 8};
  var currentTransitionAreas = this.screen.mapObject.layers[3].objects;

  for(let  i = 0 ; i < currentTransitionAreas.length ; i++) {
    let obj = currentTransitionAreas[i];
    if(playerCentre.x > obj.x && playerCentre.y > obj.y && playerCentre.x < obj.x + obj.width && playerCentre.y < obj.y + obj.height) {
      this.screen.game.setArea(obj.properties.destination);
      this.position.x = obj.properties.destinationx;
      this.position.y = obj.properties.destinationy;
      this.screen.game.loadExplore();
      console.log("areaTransition detected! placing player in " + obj.properties.destination + " at x = " + obj.properties.destinationx + "\t y = " + obj.properties.destinationy);
      break;
    }
  }
}


export {NPCManager, ChestManager, Player}
