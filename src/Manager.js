import {Unit, Hero, Monster, Fighter, Knight, Wolf, Snake, Highwayman, ZombieSailor, MrSnips, ZombiePirate, HealthBar, Equipment} from './Unit';

//This is the constructor function for the Manager class, this class is the parent for all manager classes and is responsible fore grouping together and managing different game assets (ie: HeroManager, MonsterManager, ParticleManager);
function Manager(screen) {
  this.screen = screen;
  this.assetList = [];
}
//This method is resposible for populating the surManager property with the instance of the surManager, enabling the managers to be able to talk to each other via the surmanager
Manager.prototype.setCurrentScreen = function(screen) {
  this.screen = screen;
}
//This is the Manager's main load method
Manager.prototype.load = function() {

}
//This is the Manager's main update method, it is responsible for calling the update method for each of its assigned assets
Manager.prototype.update = function(gameTime, elapsedTime) {
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].update(gameTime, elapsedTime);
  }
}
//This is the Manager's main draw method
Manager.prototype.draw = function(ctx) {
  for(let i = 0 ; i< this.assetList.length; i++) {
    this.assetList[i].draw(ctx);
  }
}

//This is the constructor function for the HeroManager class, this class is responsible for managing lists of Heros in either the ManorExplore or the Battle scenes
function HeroManager(screen) {
  Manager.call(this, screen);
}
HeroManager.prototype = Object.create(Manager.prototype)
HeroManager.prototype.constructor = HeroManager;
//This is the HeroManager's main load method, it is responsible for assigning the given heroes to the manager's assetList
HeroManager.prototype.load = function(heroes) {
  this.assetList = heroes;
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].setCurrentScreen(this.screen);
  }
}
//This method is called on the battleScreen and resets all the heros ready for a new turn
HeroManager.prototype.newRound = function() {
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].combatReset();
    for(let j = 0 ; j < this.assetList[i].statusEffectList.length ; j++) {
      this.assetList[i].statusEffectList[j].duration--;
    }
    for(let j = this.assetList[i].statusEffectList.length - 1 ; j >= 0 ; j--) {
      if(this.assetList[i].statusEffectList[j].duration <= 0) {
        this.assetList[i].statusEffectList.splice(j, 1);
      }
    }
  }
}
HeroManager.prototype.setPassiveBattleSpritePosition = function() {
  console.log("position set");
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].battleSprite.setPassivePosition();
  }
}
HeroManager.prototype.endBattle = function() {
  var gainedXP = this.calculateGainedXP();
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].endBattle();
    this.assetList[i].experienceBar.gainedXP = gainedXP;
  }
}
HeroManager.prototype.calculateGainedXP = function() {
  var totalXP = 0;
  for(let i = 0 ; i < this.screen.monsterManager.assetList.length ; i++) {
    totalXP += this.screen.monsterManager.assetList[i].currentXP;
  }
  var unitXP = Math.floor(totalXP/this.assetList.length);
  for(let i = 0 ; i < this.assetList.length ; i++) {
  }
  return unitXP;
}

//This is the constructor function for the MonsterManager class, this class is responsible for listing Monsters in a manorExplore(bestiary) or a battle(active enemies) scene
function MonsterManager(screen) {
  Manager.call(this, screen);
}
MonsterManager.prototype = Object.create(Manager.prototype);
MonsterManager.prototype.constructor = MonsterManager;
//This is the MonsterManager's battleLoad method that accepts a battleID and then populates the assetList with the relevant monsters
//This monster laoder will rename monsters if they have the same name(wolf 1 wolf 2 etc.)
MonsterManager.prototype.battleLoad = function(battleID) {
  this.assetList = [];
  switch(battleID) {
    case -1:
    this.assetList.push(new Snake());
    this.assetList.push(new Snake());
    break;
    case 0:
    this.assetList.push(new Snake());
    this.assetList.push(new Snake());
    break;
    case 1:
    this.assetList.push(new Wolf());
    this.assetList.push(new Wolf());
    break;
    case 2:
    this.assetList.push(new Wolf());
    this.assetList.push(new Wolf());
    this.assetList.push(new Snake());
    break;
    case 3:
    this.assetList.push(new Wolf());
    this.assetList.push(new Highwayman());
    break;
    case 4:
    this.assetList.push(new Wolf());
    this.assetList.push(new Highwayman());
    this.assetList.push(new Wolf());
    break;
    case 5:
    this.assetList.push(new Wolf());
    this.assetList.push(new Highwayman());
    this.assetList.push(new Highwayman());
    break;
    case 6:
    this.assetList.push(new Wolf());
    this.assetList.push(new Snake());
    this.assetList.push(new Highwayman);
    break;
    case 7:
    this.assetList.push(new ZombieSailor);
    break;
    case 8:
    this.assetList.push(new ZombieSailor);
    this.assetList.push(new ZombieSailor);
    break;
    case 9:
    this.assetList.push(new ZombieSailor);
    this.assetList.push(new MrSnips);
    break;
    case 10:
    this.assetList.push(new ZombiePirate);
    break;
    case 11:
    this.assetList.push(new ZombiePirate);
    this.assetList.push(new ZombieSailor);
    break;
    case 12:
    this.assetList.push(new ZombiePirate);
    this.assetList.push(new MrSnips);
    break;
    case 13:
    this.assetList.push(new ZombiePirate);
    this.assetList.push(new ZombiePirate);
    break;
    case 14:
    this.assetList.push(new ZombiePirate);
    this.assetList.push(new ZombieSailor);
    this.assetList.push(new MrSnips);
    break;
    default:
    this.assetList.push(new Wolf());
    this.assetList.push(new Wolf());
    break;
  }


  //this code numbers similarly named enemies
  let k = 1;
  let i = 0;
  for(i = 0; i<this.assetList.length;i++){
    this.assetList[i].setPartyPosition(i);
    let name = this.assetList[i].name;
    let match = false;
	let j = 0;
    for(j = 0 ; j<this.assetList.length;j++) {
      if (i!=j) {
        if(name == this.assetList[j].name) {
          k++;
          match = true;
          this.assetList[j].name += " " + k;
        }
      }
    }
    if(match) {
      this.assetList[i].name += " " + 1;
    }
    match = false;
  }
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].setCurrentScreen(this.screen);
  }
}
MonsterManager.prototype.newRound = function() {
	let  i = 0;
  for(i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].combatReset();
  }
}
MonsterManager.prototype.setPassiveBattleSpritePosition = function() {
  let i = 0 ;
  for(i=0;i<this.assetList.length ; i++) {
    this.assetList[i].battleSprite.setPassivePosition();
  }
}

//This is the constructor function for the LogManager class, this class is resposible for handling the text log that will describe the events that occur in game
function LogManager() {
  Manager.call(this);
}
LogManager.prototype = Object.create(Manager.prototype);
LogManager.prototype.constructor = LogManager;
//This is the logManager's main update method
LogManager.prototype.update = function(gameTime, elapsedTime) {

}
//This is the LogManager's main draw method
LogManager.prototype.draw = function(ctx) {

}

//This is the constructor function for the EnvironmentManager class, this class is responsible for managing the background
function EnvironmentManager(screen) {
  Manager.call(this, screen);
}
EnvironmentManager.prototype = Object.create(Manager.prototype);
EnvironmentManager.prototype.constructor = EnvironmentManager;
EnvironmentManager.prototype.load = function() {
  var gameState = this.screen.game.state;
  if(gameState == "battle") {

    let battleID = this.screen.game.battleID;

    if (battleID>=0 && battleID < 7) {
      this.backgroundImageSource = require('../assets/myGrasslandBattleScene.png');
    }
    else if(battleID >= 7 && battleID < 15) {
      this.backgroundImageSource = require('../assets/myBeachBattleScene.png');
    }
    else {
      this.backgroundImageSource = "../assets/mySecretRoom.png";
    }
  }
  else {
    this.backgroundImageSource = "../assets/myMenuBackground.png";
  }


  this.backgroundImage = new Image();
  this.backgroundImage.src = this.backgroundImageSource;
}
EnvironmentManager.prototype.update = function(gameTime, elapsedTime) {

}
EnvironmentManager.prototype.draw = function(ctx) {
  ctx.drawImage(this.backgroundImage, 0, 0);
}

function MenuManager(screen) {
  Manager.call(this, screen);
}
MenuManager.prototype = Object.create(Manager.prototype);
MenuManager.prototype.constructor = MenuManager;
//Load is going to overridden by the specific type of MenuManager
MenuManager.prototype.load = function() {

}
MenuManager.prototype.update = function(gameTime, elapsedTime) {
  if(this.screen.state == "waiting for input") {
    for(let i = 0 ; i < this.assetList.length ; i++) {
      this.assetList[i].update(gameTime, elapsedTime);
    }
    this.cursorHoverCheck();
  }
}
MenuManager.prototype.cursorHoverCheck = function() {
  let cursorHover = false;
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].hoverCheck();
    if (this.assetList[i].cursorHover) {
      cursorHover = true;
      break;
    }
  }
  if(cursorHover) {
    this.screen.enableHandPointer();
  }
  else {
    this.screen.disableHandPointer();
  }
}
//This huge method is goning to be cut down now :)
MenuManager.prototype.handleClick = function(){
  //heroSelectionMenu (i=0); ActionMenu(i=1); Special Move Menu (i=2); Item  Menu(i=3); MonsterTargetMenu (i=4); HeroTargetMenu(i=5); ConfirmTurn Button (i=6);
  for(let i = 0 ; i < this.assetList.length ; i++) {

    for(let j = 0 ; j < this.assetList[i].menuButtonList.length ; j++) {
      if(this.assetList[i].menuButtonList[j].cursorHover) {
        this.assetList[i].select(j);
        this.select(i, j);
      } // end of if(this.assetList[i].menuButtonList[j].cursorHover)
    }// end of for(let j = 0 ; j< this.assetList[i].menuButtonList.length; j++)
  }// end of for(let i =0 ; i< this.assetList.length; i++)
}
MenuManager.prototype.select = function(i, j) {

}

export {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager}
