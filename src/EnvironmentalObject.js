import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager} from './Manager'

function EnvironmentalObject(screen) {
  this.screen = screen;
  this.position = {x: 0, y: 0};
  this.height = 0;
  this.length = 0;
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
  ctx.fillRect(this.position.x, this.position.y, 16, 16);
  if(this.focus != null) {
    ctx.fillStyle = "rgba(250, 200, 100, 0.2)";
    ctx.fillRect(this.focus.x, this.focus.y, this.focus.length, this.focus.length);
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
  ctx.fillRect(this.position.x, this.position.y, 16, 16);
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

export {NPCManager, ChestManager}
