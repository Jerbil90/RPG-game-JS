import {SurManager} from './main';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager} from './Manager';

function BattleEndScreen(battle) {
  if(battle.battleSurManager.battleState == "victory") {
    this.surManager = new BattleEndSurManager(battle.battleSurManager);
    console.log("victory detected, making a real battleEndScreen")
  }
  else {
    this.surManager = new GameOverSurManager();
    console.log("defeat detected, making a minimalist battleEndScreen");
  }
}
BattleEndScreen.prototype.draw = function(ctx) {
  this.surManager.draw(ctx);

}
BattleEndScreen.prototype.update = function (gameTime, elapsedTime) {
  this.surManager.update(gameTime, elapsedTime);
}

function BattleEndSurManager(battleSurManager) {
  SurManager.call(this);
  this.heroManager = battleSurManager.heroManager;
  this.monsterManager = battleSurManager.monsterManager;
  this.logManager = battleSurManager.logManager;
  this.environmentManager = new BattleEndEnvironmentManager();
  this.environmentManager.setSurManager(this);
  this.environmentManager.load();
}
BattleEndSurManager.prototype = Object.create(SurManager.prototype);
BattleEndSurManager.prototype.constructor = BattleEndSurManager;


function GameOverSurManager() {
  this.environmentManager = new BattleEndEnvironmentManager();
  this.environmentManager.setSurManager(this);
  this.environmentManager.load();
}
GameOverSurManager.prototype = Object.create(SurManager.prototype);
GameOverSurManager.prototype.constructor = GameOverSurManager;
GameOverSurManager.prototype.draw = function(ctx) {
  this.environmentManager.draw(ctx);
  ctx.fillText("Game Over", 200, 200);
}

function BattleEndEnvironmentManager() {

}

BattleEndEnvironmentManager.prototype = Object.create(Manager.prototype);
BattleEndEnvironmentManager.prototype.constructor = BattleEndEnvironmentManager;
BattleEndEnvironmentManager.prototype.load = function() {
  console.log("load function successfully called");
  this.backgroundImage = new Image();
  this.backgroundImage.src = "../assets/myBattleEndBackground.png";
  console.log("image populated");
}
BattleEndEnvironmentManager.prototype.update = function(gameTime, elapsedTime) {

}
BattleEndEnvironmentManager.prototype.draw = function(ctx) {
  if(this.backgroundImage != null) {
    ctx.drawImage(this.backgroundImage, 0, 0);
    console.log("I just drewq the background");
  }
}


function ExperienceBar(owner) {
  this.owner = owner;
  this.calculateRequiredXP();
}
ExperienceBar.prototype.calcualateRequiredXP = function() {
switch(this.owner.currentLV){
  case 1:
  this.requiredXP = 5;
  break;
  case 2:
  this.requiredXP = 10;
  break;
  default:
  console.log("error in calculateRequiredXP, currentLV not valid");
  break;
}
  this.requiredXP
}

export {BattleEndScreen}
