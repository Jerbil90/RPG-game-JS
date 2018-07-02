import $ from 'jquery';
import {Screen} from './Screen';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager} from './Manager';
import {NPCManager, ChestManager, Player} from './EnvironmentalObject';

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
  this.camera = new Camera(this);
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
  this.camera.update(gameTime, elapsedTime);
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
  if(this.screen.game.worldAreaID == 0) {
    var map = require("./maps/openingPlains.json");
    this.screen.mapObject = map;
  }
  else if(this.screen.game.worldAreaID == 1) {
    var map = require("./maps/middlePlains.json");
    this.screen.mapObject = map;
  }
  else if(this.screen.game.worldAreaID == 2) {
    var map = require("./maps/largeField.json");
    this.screen.mapObject = map;
  }
};
ExploreScreenEnvironmentManager.prototype.draw = function(ctx) {
  for (let i = 0 ; i < this.map.length ; i++) {
    for(let j = 0 ; j < this.map[0].length ; j++) {
      if(this.map[i][j] == 3) {
        ctx.fillStyle = "rgb(0, 250, 0)";
        let worldPos = {x: 16*i, y: 16 * j};
        let screenPos = this.screen.camera.getScreenPosition(worldPos);
        ctx.fillRect(screenPos.x, screenPos.y, 16, 16);
      }
      else if (this.map[i][j] == 1) {
        ctx.fillStyle = "rgb(250, 0, 0)";
        let worldPos = {x: 16*i, y: 16 * j};
        let screenPos = this.screen.camera.getScreenPosition(worldPos);
        ctx.fillRect(screenPos.x, screenPos.y, 16, 16);
      }
      else if (this.map[i][j] == 2) {
        if(this.isChestOpened[0]) {
          ctx.fillStyle = "rgb(125, 50, 125)";
        }
        else {
          ctx.fillStyle = "rgb(50, 125, 125)";
          //ctx.fillStyle = "rgb(125, 50, 125)";

        }
        let worldPos = {x: 16*i, y: 16 * j};
        let screenPos = this.screen.camera.getScreenPosition(worldPos);
        ctx.fillRect(screenPos.x, screenPos.y, 16, 16);
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

  //Also check to see if if is colliding with the player
  {
    let player = this.screen.player;
    if(!player.isCurrentlyBeingCheckedForCollisions) {
      //First check the unit's top left corner
      if(potentialPosition.x > player.position.x && potentialPosition.x < player.position.x + player.length && potentialPosition.y > player.position.y && potentialPosition.y < player.position.y + player.height) {
        isValidPosition = false;
        console.log("player collision top left");
      }
      //Next check the unit's top right corner
      if(potentialPosition.x + unitSize.x > player.position.x && potentialPosition.x + unitSize.x < player.position.x + player.length && potentialPosition.y > player.position.y && potentialPosition.y < player.position.y + player.height) {
        isValidPosition = false;
        console.log("player collision top right");
      }
      //Then check the unit's bottom right corner
      if(potentialPosition.x + unitSize.x > player.position.x && potentialPosition.x + unitSize.x < player.position.x + player.length && potentialPosition.y + unitSize.y > player.position.y && potentialPosition.y + unitSize.y < player.position.y + player.height) {
        isValidPosition = false;
        console.log("player collision bottom right");
      }
      //Finally check the unit's bottom left corner
      if(potentialPosition.x > player.position.x && potentialPosition.x < player.position.x + player.length && potentialPosition.y + unitSize.y > player.position.y && potentialPosition.y + unitSize.x < player.position.y + player.height) {
        isValidPosition = false;
        console.log("player collision bottom left");
      }
      //then check if the player is colliding with the units
    }
  }

  //Next check if there are any environmental objects(chests, NPCs) to collide with;
  //First NPCs
  for(let i = 0 ; i < this.screen.nPCManager.assetList.length ; i++) {
    let nPC = this.screen.nPCManager.assetList[i];
    if(!nPC.isCurrentlyBeingCheckedForCollisions) {
      //First check the unit's top left corner
      if (potentialPosition.x < nPC.position.x + nPC.length && potentialPosition.x > nPC.position.x && potentialPosition.y < nPC.position.y + nPC.height && potentialPosition.y > nPC.position.y) {
        isValidPosition = false;
        console.log("npc collision top left");
      }
      //Next check the unit's top right corner
      if (potentialPosition.x + unitSize.x < nPC.position.x + nPC.length && potentialPosition.x + unitSize.x > nPC.position.x && potentialPosition.y < nPC.position.y + nPC.height && potentialPosition.y > nPC.position.y) {
        isValidPosition = false;
        console.log("npc collision top right");
      }
      //Then check the unit's bottom right corner
      if (potentialPosition.x + unitSize.x < nPC.position.x + nPC.length && potentialPosition.x + unitSize.x > nPC.position.x && potentialPosition.y + unitSize.y < nPC.position.y + nPC.height && potentialPosition.y + unitSize.y > nPC.position.y) {
        isValidPosition = false;
        console.log("npc collision bottom right");
      }
      //Finally check the unit's bottom left corner
      if (potentialPosition.x < nPC.position.x + nPC.length && potentialPosition.x > nPC.position.x && potentialPosition.y + unitSize.y < nPC.position.y + nPC.height && potentialPosition.y + unitSize.y > nPC.position.y) {
        isValidPosition = false;
        console.log("npc collision bottom left");
      }
      //now check the other way wroundin case of a complete envolpment
      if (potentialPosition.x > nPC.position.x + nPC.length && potentialPosition.x < nPC.position.x && potentialPosition.y > nPC.position.y + nPC.height && potentialPosition.y < nPC.position.y) {
        isValidPosition = false;
        console.log("npc collision top left");
      }
      //Next check the unit's top right corner
      if (potentialPosition.x + unitSize.x > nPC.position.x + nPC.length && potentialPosition.x + unitSize.x < nPC.position.x && potentialPosition.y > nPC.position.y + nPC.height && potentialPosition.y < nPC.position.y) {
        isValidPosition = false;
        console.log("npc collision top right");
      }
      //Then check the unit's bottom right corner
      if (potentialPosition.x + unitSize.x > nPC.position.x + nPC.length && potentialPosition.x + unitSize.x < nPC.position.x && potentialPosition.y + unitSize.y > nPC.position.y + nPC.height && potentialPosition.y + unitSize.y < nPC.position.y) {
        isValidPosition = false;
        console.log("npc collision bottom right");
      }
      //Finally check the unit's bottom left corner
      if (potentialPosition.x > nPC.position.x + nPC.length && potentialPosition.x < nPC.position.x && potentialPosition.y + unitSize.y > nPC.position.y + nPC.height && potentialPosition.y + unitSize.y < nPC.position.y) {
        isValidPosition = false;
        console.log("npc collision bottom left");
      }
    }
  }
  //Next chestStatusList
  for(let i = 0 ; i < this.screen.chestManager.assetList.length ; i++) {
    let chest = this.screen.chestManager.assetList[i];
    //First check the unit's top left corner
    if (potentialPosition.x < chest.position.x + chest.length && potentialPosition.x > chest.position.x && potentialPosition.y < chest.position.y + chest.height && potentialPosition.y > chest.position.y) {
      isValidPosition = false;
      console.log("chest collision top left");
    }
    //Next check the unit's top right corner
    if (potentialPosition.x + unitSize.x < chest.position.x + chest.length && potentialPosition.x + unitSize.x > chest.position.x && potentialPosition.y < chest.position.y + chest.height && potentialPosition.y > chest.position.y) {
      isValidPosition = false;
      console.log("chest collision top right");
    }
    //Then check the unit's bottom right corner
    if (potentialPosition.x + unitSize.x < chest.position.x + chest.length && potentialPosition.x + unitSize.x > chest.position.x && potentialPosition.y + unitSize.y < chest.position.y + chest.height && potentialPosition.y + unitSize.y > chest.position.y) {
      isValidPosition = false;
      console.log("chest collision bottom right");
    }
    //Finally check the unit's bottom left corner
    if (potentialPosition.x < chest.position.x + chest.length && potentialPosition.x > chest.position.x && potentialPosition.y + unitSize.y < chest.position.y + chest.height && potentialPosition.y + unitSize.y > chest.position.y) {
      isValidPosition = false;
      console.log("chest collision bottom left");
    }
  }

  return isValidPosition;
}


//This class is resposible for doing the calculations for drawing relative to the current camera position, it is also capable of chasing the player
function Camera(screen) {
  this.screen = screen;
  this.scale = 1;
  this.position = {x: 0, y: 0};
  this.isCameraChasingPlayer = true;
}
Camera.prototype.setScreenPosition = function(worldPosition) {
  var position = this.position;

  var cameraPosition = {x: worldPosition.x - position.x, y: worldPosition.y - position.y};
}
Camera.prototype.update = function(gameTime, elapsedTime) {
  if(this.isCameraChasingPlayer) {
    let playerPosition = this.screen.player.position;

    this.position = {x: playerPosition.x - 310 * this.scale, y: playerPosition.y - 240 * this.scale};
    if(this.position.x < 0) {
      this.position.x = 0;
    }
    if(this.position.x > this.screen.mapObject.tilewidth * this.screen.mapObject.layers[0].width - 640) {
      this.position.x = this.screen.mapObject.tilewidth * this.screen.mapObject.layers[0].width - 640;
    }
    if(this.position.y < 0) {
      this.position.y = 0;
    }
    if(this.position.y > this.screen.mapObject.tileheight * this.screen.mapObject.layers[0].height - 480) {
      this.position.y = this.screen.mapObject.tileheight * this.screen.mapObject.layers[0].height - 480;
    }
  }
}
Camera.prototype.getScreenPosition = function (worldPosition) {
  var screenPosition = {x: 0, y: 0};
  screenPosition.x = worldPosition.x - this.position.x;
  screenPosition.y = worldPosition.y - this.position.y;
  return screenPosition;
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
