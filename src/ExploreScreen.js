import $ from 'jquery';
import {Screen} from './Screen';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager} from './Manager';
import {NPCManager, ChestManager} from './EnvironmentalObject';

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
  if(this.battleProgress >= 10000) {
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
  if(this.focus != null) {
    ctx.fillStyle = "rgba(100, 0, 100, 0.25)";
    ctx.fillRect(this.focus.x, this.focus.y, this.focus.length, this.focus.length);
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
/*
    if((playerEdge.x > currentTransitionAreas[i].x || this.position.x < currentTransitionAreas[i].x + currentTransitionAreas[i].width) && (playerEdge.y > currentTransitionAreas[i].y || this.position.y < currentTransitionAreas[i].y + currentTransitionAreas[i].height)) {
      this.screen.game.setArea(currentTransitionAreas[i].properties.destination);
      this.position.x = currentTransitionAreas[i].properties.destinationx;
      this.position.y = currentTransitionAreas[i].properties.destinationy;
      this.screen.game.loadExplore();
      break;
    }*/
  }
/*
  if(this.screen.worldAreaID == 0){
    if(playerCentre.x > 620) {
      console.log("yeah");
      this.screen.game.worldAreaID = 1;
      this.position.x = 30;
      this.screen.game.loadExplore();
    }
  }
  else if(this.screen.worldAreaID == 1) {
    if(playerCentre.x < 15) {
      this.screen.game.worldAreaID = 0;
      this.position.x = 610;
      this.screen.game.loadExplore();
    }
  }*/
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
  //first check to see if the solid map tiles are potentially colliding with it
  for(let i = 0 ; i < collidingMapTiles.length ; i++) {
    if(collidingMapTiles[i] != 3) {
      isValidPosition = false;
    }
  }

  //Next check if there are any environmental objects(chests, NPCs) to collide with;
  //First NPCs
  for(let i = 0 ; i < this.screen.nPCManager.assetList.length ; i++) {
    let nPC = this.screen.nPCManager.assetList[i];
    //First check the player's top left corner
    if (potentialPosition.x < nPC.position.x + nPC.length && potentialPosition.x > nPC.position.x && potentialPosition.y < nPC.position.y + nPC.height && potentialPosition.y > nPC.position.y) {
      isValidPosition = false;
    }
    //Next check the player's top right corner
    if (potentialPosition.x + unitSize.x < nPC.position.x + unitSize.x + nPC.length && potentialPosition.x > nPC.position.x && potentialPosition.y < nPC.position.y + nPC.height && potentialPosition.y > nPC.position.y) {
      isValidPosition = false;
    }
    //Then check the player's bottom right corner
    if (potentialPosition.x + unitSize.x < nPC.position.x + nPC.length && potentialPosition.x + unitSize.x > nPC.position.x && potentialPosition.y + unitSize.y < nPC.position.y + nPC.height && potentialPosition.y + unitSize.y > nPC.position.y) {
      isValidPosition = false;
    }
    //Finally check the player's bottom left corner
    if (potentialPosition.x < nPC.position.x + nPC.length && potentialPosition.x > nPC.position.x && potentialPosition.y + unitSize.y < nPC.position.y + nPC.height && potentialPosition.y + unitSize.y > nPC.position.y) {
      isValidPosition = false;
    }
  }
  //Next chestStatusList
  for(let i = 0 ; i < this.screen.chestManager.assetList.length ; i++) {
    let chest = this.screen.chestManager.assetList[i];
    //First check the player's top left corner
    if (potentialPosition.x < chest.position.x + chest.length && potentialPosition.x > chest.position.x && potentialPosition.y < chest.position.y + chest.height && potentialPosition.y > chest.position.y) {
      isValidPosition = false;
    }
    //Next check the player's top right corner
    if (potentialPosition.x + unitSize.x < chest.position.x + unitSize.x + chest.length && potentialPosition.x > chest.position.x && potentialPosition.y < chest.position.y + chest.height && potentialPosition.y > chest.position.y) {
      isValidPosition = false;
    }
    //Then check the player's bottom right corner
    if (potentialPosition.x + unitSize.x < chest.position.x + chest.length && potentialPosition.x + unitSize.x > chest.position.x && potentialPosition.y + unitSize.y < chest.position.y + chest.height && potentialPosition.y + unitSize.y > chest.position.y) {
      isValidPosition = false;
    }
    //Finally check the player's bottom left corner
    if (potentialPosition.x < chest.position.x + chest.length && potentialPosition.x > chest.position.x && potentialPosition.y + unitSize.y < chest.position.y + chest.height && potentialPosition.y + unitSize.y > chest.position.y) {
      isValidPosition = false;
    }
  }

  return isValidPosition;
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
