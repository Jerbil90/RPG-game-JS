import $ from 'jquery';
import {Screen} from './Screen';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager} from './Manager';

function ExploreScreen(game) {
  Screen.call(this, game);
  this.elapsedTime = 0;
  this.worldID = this.game.worldID;
  this.worldAreaID = this.game.worldAreaID;
  this.worldLength = 2;
  this.player = new Player(this);
  this.dialogueBox = new DialogueBox(this);
  this.chestManager = new ChestManager(this);
  this.nPCManager = new NPCManager(this);
  this.state = "explore";
  this.battleProgress = 0;
}
ExploreScreen.prototype = Object.create(Screen.prototype);
ExploreScreen.prototype.constructor = ExploreScreen;
ExploreScreen.prototype.load = function() {
  this.worldID = this.game.worldID;
  this.worldAreaID = this.game.worldAreaID;
  Screen.prototype.load.call(this);
  this.state = "explore";
  this.chestManager.load();
  this.nPCManager.load();
}
ExploreScreen.prototype.instantiateEnvironmentManager = function() {
  this.environmentManager = new ExploreScreenEnvironmentManager(this);
}
ExploreScreen.prototype.loadRandomBattle = function() {
  this.battleProgress = 0;
  this.isScreenOver = true;
  this.isActive = false;
  this.state = "inactive";
  this.game.battleID = 0;
  this.game.startBattle();
}
ExploreScreen.prototype.update = function(gameTime, elapsedTime) {
  this.elapsedTime = elapsedTime;
  Screen.prototype.update.call(this, gameTime, elapsedTime);
  this.player.update(gameTime, elapsedTime);
  this.dialogueBox.update(gameTime, elapsedTime);
  this.chestManager.update(gameTime, elapsedTime);
  this.nPCManager.update(gameTime, elapsedTime);
  if(this.battleProgress >= 2000) {
    this.loadRandomBattle();
  }
}
ExploreScreen.prototype.draw = function(ctx) {
  Screen.prototype.draw.call(this, ctx);
  this.chestManager.draw(ctx);
  this.nPCManager.draw(ctx);
  this.player.draw(ctx);
  this.dialogueBox.draw(ctx);
}

function Player(screen) {
  this.screen = screen;
  this.position = this.screen.game.playerPosition;
  this.speed = 250;
  this.orientation = {x: 0, y: 1};
  this.focus = null;
}
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
            console.log("target detected in focus");
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
  console.log("interact!");
}
Player.prototype.draw = function(ctx) {
  //draw the player position
  ctx.fillStyle = "rgb(0, 0, 250)";
  ctx.fillRect(this.position.x, this.position.y, 16, 16);
  ctx.fillStyle = "rgba(100, 0, 100, 0.25)";
  ctx.fillRect(this.focus.x, this.focus.y, this.focus.length, this.focus.length);
}
//This method is responsible for checking if the player has gone off the edge of the screen or into an area transition and loads the appropriate new area
Player.prototype.areaTransitionCheck = function() {
  var self = this;
  var playerCentre = {x: self.position.x + 8, y: self.position.y + 8};
  if(this.screen.worldAreaID == 0){
    if(playerCentre.x > 600) {
      console.log("yeah");
      this.screen.game.worldAreaID = 1;
      this.position.x = 25;
      this.screen.game.loadExplore();
    }
  }
  else if(this.screen.worldAreaID == 1) {
    if(playerCentre.x < 9) {
      this.screen.game.worldAreaID = 0;
      this.position.x = 615;
      this.screen.game.loadExplore();
    }
  }
}

function ExploreScreenEnvironmentManager(screen) {
  EnvironmentManager.call(this, screen);
  this.playerPosition = this.screen.game.playerPosition;
  this.playerArea = this.screen.game.playerArea;
  //determine who is aparty leader to determine which sprite to use to represent the player character
  this.partyLeader = null;
  for(let i = 0 ; i < screen.game.userHeroList.length ; i++) {
    if (screen.game.userHeroList[i].partyPosition == 1) {
      this.partyLeader = screen.game.userHeroList[i];
    }
  }
}
ExploreScreenEnvironmentManager.prototype = Object.create(EnvironmentManager.prototype);
ExploreScreenEnvironmentManager.prototype.constructor = ExploreScreenEnvironmentManager;
ExploreScreenEnvironmentManager.prototype.load = function() {
  this.loadMapObject();
  this.loadMap();
}
ExploreScreenEnvironmentManager.prototype.loadMap = function() {
  this.map = [];
  var mapObject = this.screen.mapObject.layers[0];


  for(let i = 0 ; i < mapObject.width ; i++) {
    let column = [];
    for(let j = 0 ; j < mapObject.height ; j++) {
      column.push(mapObject.data[i + mapObject.width * j]);
    }
    this.map.push(column);

  }

}

ExploreScreenEnvironmentManager.prototype.loadMapObject = function () {
  //var testObject = require("./testObject.json");
  //console.log(testObject.type);
  if(this.screen.game.worldAreaID == 0) {
    var map = require("./maps/openingPlains.json");
    this.screen.mapObject = map;
  }
  else if(this.screen.game.worldAreaID == 1) {
    var map = require("./maps/middlePlains.json");
    this.screen.mapObject = map;
  }
};
ExploreScreenEnvironmentManager.prototype.draw = function(ctx) {
  for (let i = 0 ; i < this.map.length ; i++) {
    for(let j = 0 ; j < this.map[0].length ; j++) {
      if(this.map[i][j] == 3) {
        ctx.fillStyle = "rgb(0, 250, 0)";
        ctx.fillRect(16*i, 16*j, 16, 16);
      }
      else if (this.map[i][j] == 1) {
        ctx.fillStyle = "rgb(250, 0, 0)";
        ctx.fillRect(16*i, 16*j, 16, 16);
      }
      else if (this.map[i][j] == 2) {
        if(this.isChestOpened[0]) {
          ctx.fillStyle = "rgb(125, 50, 125)";
        }
        else {
          ctx.fillStyle = "rgb(50, 125, 125)";
          //ctx.fillStyle = "rgb(125, 50, 125)";

        }
        ctx.fillRect(16*i, 16*j, 16, 16);
      }
    }
  }
}
ExploreScreenEnvironmentManager.prototype.checkPotentialPosition = function(potentialPosition) {
  var unitSize = {x: 16, y:16};
  var mapTileLength = 16;
  var collidingMapTiles = [];
  //populate the collidingMapTiles array with all the tiles that an entity of unitSize and potentialPosition will be colliding with
  //First get the tile the origin is in
  var x = Math.floor(potentialPosition.x/mapTileLength);
  var y = Math.floor(potentialPosition.y/mapTileLength);
  collidingMapTiles.push(this.map[x][y]);
  //Next check if they over lap the adjecenttiles
  if(potentialPosition.x%mapTileLength != 0) {
    collidingMapTiles.push(this.map[x+1][y]);
  }
  if(potentialPosition.y%mapTileLength != 0) {
    collidingMapTiles.push(this.map[x][y+1]);
  }
  if(potentialPosition.x%mapTileLength != 0 && potentialPosition.y%mapTileLength != 0) {
    collidingMapTiles.push(this.map[x+1][y+1]);
  }

  var isValidPosition = true;
  for(let i = 0 ; i < collidingMapTiles.length ; i++) {
    if(collidingMapTiles[i] != 3) {
      isValidPosition = false;
    }
  }
  return isValidPosition;
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
  this.position = {x: 0, y: 0};
  this.focus = null;
  this.idleTime = null;
  this.lastMovementTime = null;
  this.orientation = {x: 0, y: 1};
  this.movementDuration = null;
  this.speed = 50;
  this.nPCDialogue = "Do you know the way?";
}
NPC.prototype.setPosition = function(a, b) {
  this.position = {x: a, y: b};
}
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
  for(let i = 0 ; i < this.screen.mapObject.layers[1].objects.length ; i++) {
    let chest  = new Chest(this.screen);
    let chestObject = this.screen.mapObject.layers[1].objects[i];
    chest.setPosition(chestObject.x, chestObject.y);
    let contents = [];
    let contentsString = chestObject.properties.contents
    contents = contentsString.split(',');
    chest.setContents(contents);
    chest.setID(chestObject.id);

    //perform a check to see if this chest has already been opened;
    if(!this.screen.game.areaStateManager.checkChest(chestObject.id)) {
      chest.isOpened = true;
    }
    this.assetList.push(chest);
  }
}

function Chest(screen) {
  this.screen = screen;
  this.isOpened = false;
}
Chest.prototype.setPosition = function(a, b) {
  this.position = {x: a, y: b};
}
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
  this.openChest();
}
Chest.prototype.setID = function(id) {
  this.id = id;
}

function DialogueBox(screen) {
  this.screen = screen;
  this.isVisible = false;
  this.isActive = false;
  this.message = null;
  this.position = {x: 20, y: 0};
  this.height = 150;
  this.length = 600;
  this.borderLength = 5;
  this.dialogueStartTime = null
  this.inner = {x: 25, y: 5, l: 590, h: 140};
}
DialogueBox.prototype.openDialogueBox = function(message) {
  this.message = message;
  this.isActive = true;
  this.isVisible = true;
  this.screen.state = "inDialogue";
  this.dialogueStartTime = null;
}
DialogueBox.prototype.closeDialogueBox = function() {
  this.isActive = false;
  this.isVisible = false;
  this.screen.state = "explore";
  this.dialogueStartTime = null;
}
DialogueBox.prototype.advance = function () {
  this.closeDialogueBox();
};
DialogueBox.prototype.update = function (gameTime, elapsedTime) {
  if(this.isActive) {
    if(this.dialogueStartTime == null) {
      this.dialogueStartTime = gameTime;
    }
  }
};
DialogueBox.prototype.draw = function(ctx) {
  if(this.isVisible) {
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.fillRect(this.position.x, this.position.y, this.length, this.height);
    ctx.fillStyle = "rgb(10, 10, 10)";
    //ctx.fillRect((this.position.x + this.borderLength), (this.position.y + this.borderLength), (this.length - (2*this.borderlength)), (this.height - (2*this.borderlength)));
    ctx.fillRect(this.inner.x, this.inner.y, this.inner.l, this.inner.h);
    //console.log("drew, x: " + (this.position.x + this.borderLength) + "\ty: " + this.position.y + this.borderLength + "\tlength: " + this.length - (2*this.borderlength) + "\t height: " + this.height - (2*this.borderlength));
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "20px serif";
    ctx.fillText(this.message, this.position.x+20, this.position.y+20)

  }
}

export {ExploreScreen}
