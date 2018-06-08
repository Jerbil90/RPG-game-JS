import {Unit, Hero, Monster, Fighter, Knight, Wolf, Snake, HealthBar, Equipment} from './Unit';

//This is the constructor function for the Manager class, this class is the parent for all manager classes and is responsible fore grouping together and managing different game assets (ie: HeroManager, MonsterManager, ParticleManager);
function Manager() {
  this.assetList = [];
}
//This method is resposible for populating the surManager property with the instance of the surManager, enabling the managers to be able to talk to each other via the surmanager
Manager.prototype.setSurManager = function(surManager) {
  this.surManager = surManager;
}
//This is the Manager's main load method
Manager.prototype.load = function() {

}
//This is the Manager's main update method, it is responsible for calling the update method for each of its assigned assets
Manager.prototype.update = function(gameTime, elapsedTime) {
	let  i = 0;
  for(i=0;i<this.assetList.length;i++) {
    this.assetList[i].update(gameTime, elapsedTime);
  }
}
//This is the Manager's main draw method
Manager.prototype.draw = function(ctx) {
	let i = 0;
  for(i = 0 ; i< this.assetList.length; i++) {
    this.assetList[i].draw(ctx);
  }
}

//This is the constructor function for the HeroManager class, this class is responsible for managing lists of Heros in either the ManorExplore or the Battle scenes
function HeroManager() {
  Manager.call(this);
}
HeroManager.prototype = Object.create(Manager.prototype)
HeroManager.prototype.constructor = HeroManager;
//This is the HeroManager's main load method, it is responsible for assigning the partyHero's to the manager's assetList
HeroManager.prototype.load = function(partyHeros) {
  this.assetList = partyHeros;
  let i = 0;
  for(i = 0; i < partyHeros.length ; i++) {
    partyHeros[i].setSurManager(this.surManager);
  }
}
HeroManager.prototype.newRound = function() {
  let i = 0;
  for(i = 0 ; i < this.assetList.length ; i++) {
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
  for(let i = 0 ; i < this.surManager.monsterManager.assetList.length ; i++) {
    totalXP += this.surManager.monsterManager.assetList[i].currentXP;
  }
  var unitXP = Math.floor(totalXP/this.assetList.length);
  for(let i = 0 ; i < this.assetList.length ; i++) {
  }
  return unitXP;
}

//This is the constructor function for the MonsterManager class, this class is responsible for listing Monsters in a manorExplore(bestiary) or a battle(active enemies) scene
function MonsterManager() {
  Manager.call(this);
}
MonsterManager.prototype = Object.create(Manager.prototype);
MonsterManager.prototype.constructor = MonsterManager;
//This is the MonsterManager's main load method, eventually it will accept a list of monsters loaded by from the battle of battlesurmanager class to use, atm though it uses a default set of enemies
//This monster laoder will rename monsters if they have the same name(wolf 1 wolf 2 etc.)
MonsterManager.prototype.load = function(battleID) {
  switch(battleID) {
    case 0:
    this.assetList.push(new Snake());
    break;
    case 1:
    this.assetList.push(new Wolf());
    break;
    case 2:
    this.assetList.push(new Wolf());
    this.assetList.push(new Wolf());
    break;
    case 3:
    this.assetList.push(new Wolf());
    this.assetList.push(new Snake());
    break;
    case 4:
    this.assetList.push(new Wolf());
    this.assetList.push(new Snake());
    this.assetList.push(new Wolf());
    break;
    case 5:
    this.assetList.push(new Wolf());
    this.assetList.push(new Snake());
    this.assetList.push(new Snake());
    break;
    case 6:
    this.assetList.push(new Wolf());
    this.assetList.push(new Snake());
    this.assetList.push(new Wolf());
    this.assetList.push(new Snake());
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
    this.assetList[i].setSurManager(this.surManager);
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
function EnvironmentManager() {
  Manager.call(this);
}
EnvironmentManager.prototype = Object.create(Manager.prototype);
EnvironmentManager.prototype.constructor = EnvironmentManager;
EnvironmentManager.prototype.load = function(battleID) {
  this.backgroundImageSource = "https://raw.githubusercontent.com/Jerbil90/Rpg-Game/master/RPG%20game2/bin/Debug/GrasslandBattle.png";
  this.backgroundImage = new Image();
  this.backgroundImage.src = this.backgroundImageSource;
}
EnvironmentManager.prototype.update = function(gameTime, elapsedTime) {

}
EnvironmentManager.prototype.draw = function(ctx) {
  ctx.drawImage(this.backgroundImage, 0, 0);
}

export {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager}
