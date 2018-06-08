import {SurManager} from './main';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager} from './Manager';
import {Sprite, InitiativeSprite, BattleSprite} from './Sprite';

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
  this.heroManager.endBattle();
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
  this.backgroundImage = new Image();
  this.backgroundImage.src = "../assets/myBattleEndBackground.png";
}
BattleEndEnvironmentManager.prototype.update = function(gameTime, elapsedTime) {

}
BattleEndEnvironmentManager.prototype.draw = function(ctx) {
  if(this.backgroundImage != null) {
    ctx.drawImage(this.backgroundImage, 0, 0);
  }
}


function ExperienceBar(owner) {
  this.owner = owner;
  this.calculateRequiredXP();
  this.gainedXP = null;
  this.oldXP = owner.currentXP;
  this.filledXP = 0;
  this.sprite = new Sprite();
  this.sprite.setOwner(owner);
  this.sprite.loadBattleSprite();
  this.position = {x:100, y: 100 + 65 * owner.partyPosition};
  this.sprite.setPosition(this.position.x, this.position.y);

  this.state = "waiting";
  this.stateStartTime = null;
  this.waitTime = 1500;
  this.fillTime = 1000;
}
ExperienceBar.prototype.calculateRequiredXP = function() {
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
}
ExperienceBar.prototype.update = function(gameTime, elapsedTime) {
  if(this.state == "waiting") {
    if(this.stateStartTime == null) {
      this.stateStartTime = gameTime;
    }
    else {
      if(gameTime > this.stateStartTime + this.waitTime) {
        this.stateStartTime = gameTime;
        this.state = "filling";
      }
    }
  }
  else if(this.state == "filling") {
    this.filledXP = this.gainedXP * ((gameTime - this.stateStartTime)/this.fillTime);
    if(this.filledXP >= this.gainedXP){
      this.stateStartTime = gameTime;
      this.state = "filled";
    }
  }
  
}
ExperienceBar.prototype.draw = function(ctx) {
  this.sprite.draw(ctx);
  //Draw the XPbar border
  ctx.fillStyle = "rgb(150, 150, 150)";
  ctx.fillRect(this.position.x+45, this.position.y-23, 210, 60);
  //Next draw the empty ExperienceBar
  ctx.fillStyle = "rgb(50, 50, 50)";
  ctx.fillRect(this.position.x + 50, this.position.y-18, 200, 50);
  //Now, draw the old value for XP
  ctx.fillStyle = "rgb(100, 150, 100)";
  ctx.fillRect(this.position.x + 50, this.position.y-18, Math.floor(200 * (this.oldXP/this.requiredXP)), 50);
  //Then, draw the filledXP
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.fillRect(this.position.x + 50 + Math.floor(200 * (this.oldXP/this.requiredXP)), this.position.y - 18, Math.floor(200 * (this.filledXP/this.requiredXP)), 50);
}

export {BattleEndScreen, ExperienceBar}
