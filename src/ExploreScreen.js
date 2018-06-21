import $ from 'jquery';
import {Screen} from './Screen';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager} from './Manager';

function ExploreScreen(game) {
  Screen.call(this, game);
  this.elapsedTime = 0;
  this.player = new Player(this);
  this.dialogueBox = new DialogueBox(this);
  this.chestManager = new ChestManager(this);
  this.state = "explore";
  this.battleProgress = 0;
}
ExploreScreen.prototype = Object.create(Screen.prototype);
ExploreScreen.prototype.constructor = ExploreScreen;
ExploreScreen.prototype.load = function() {
  Screen.prototype.load.call(this);
  this.state = "explore";
  this.chestManager.load();
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
  if(this.battleProgress >= 2000) {
    this.loadRandomBattle();
  }
}
ExploreScreen.prototype.draw = function(ctx) {
  Screen.prototype.draw.call(this, ctx);
  this.dialogueBox.draw(ctx);
  this.chestManager.draw(ctx);
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
  this.loadMap();
}
ExploreScreenEnvironmentManager.prototype.loadMap = function() {
  this.map = [];
  //first push empty arrays to this.map
  for(let i = 0 ; i < 40 ; i++) {
    let emptyArray = [];
    this.map.push(emptyArray);
  }
  for(let i = 0 ; i < 40 ; i++) {
    for(let j = 0 ; j < 30 ; j++) {
      if(i == 0 || i == 39 || j == 0 || j == 29){
        this.map[i].push(1);
      }
      else {
        this.map[i].push(0);
      }
    }
  }
}
ExploreScreenEnvironmentManager.prototype.draw = function(ctx) {
  for (let i = 0 ; i < this.map.length ; i++) {
    for(let j = 0 ; j < this.map[0].length ; j++) {
      if(this.map[i][j] == 0) {
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
//          ctx.fillStyle = "rgb(125, 50, 125)";

        }
        ctx.fillRect(16*i, 16*j, 16, 16);
      }
    }
  }
  //draw the player position
  ctx.fillStyle = "rgb(0, 0, 250)";
  ctx.fillRect(this.playerPosition.x, this.playerPosition.y, 16, 16);
  ctx.fillStyle = "rgba(100, 0, 100, 0.25)";
  ctx.fillRect(this.screen.player.focus.x, this.screen.player.focus.y, this.screen.player.focus.length, this.screen.player.focus.length);
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
    if(collidingMapTiles[i] != 0) {
      isValidPosition = false;
    }
  }
  return isValidPosition;
}

function ChestManager(screen) {
  Manager.call(this, screen);
}
ChestManager.prototype = Object.create(Manager.prototype);
ChestManager.prototype.constructor = ChestManager;
ChestManager.prototype.load = function() {
  //console.log("loading chests in chest manager");
  let chest = new Chest(this.screen);
  chest.setPosition(16*29, 16*25);
  let contents = [];
  contents.push("Steel Sword");
  /*
  for(let j = 2 ; j < line.length ; j++) {
    contents.push(line[j]);
  }
  */
  chest.setContents(contents);
  this.assetList.push(chest);
  /*
  //read chest info from file and fille the chest list accordingly
  var csvDirectory = "../chest/chests" + this.screen.game.playerArea + ".csv";
  $.get(csvDirectory, function(data) {
    console.log("file read");
    this.chests = []
    var allText = data;
    var allTextLines = data.split(/\r\n|\n/);
    for(let i = 0 ; i < allTextLines.length ; i++) {
      let line = allTextLines.split(/,/);
      let chest = new Chest(this.screen);
      chest.setPosition(16*line[0], 16*line[1]);
      let contents = [];
      for(let j = 2 ; j < line.length ; j++) {
        contents.push(line[j]);
      }
      chest.setContents(contents);
      this.chests.push(chest);
    }
  });
  */
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
