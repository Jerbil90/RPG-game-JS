import {SurManager} from './main';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager} from './Manager';
import {Sprite, InitiativeSprite, BattleSprite, PoisonEffectSprite} from './Sprite';
import {Menu, HeroSelectionMenu, ActionMenu, SpecialMenu, ItemMenu, MonsterTargetMenu, HeroTargetMenu, TurnConfirmButton, BattleSelectMenu} from './Menu'

function BattleEndScreen(battle) {
  this.endScreenStartTime = null;
  if(battle.battleSurManager.battleState == "victory") {
    this.surManager = new BattleEndSurManager(battle.battleSurManager);
  }
  else {
    this.surManager = new GameOverSurManager();
  }
}
BattleEndScreen.prototype.draw = function(ctx) {
  this.surManager.draw(ctx);

}
BattleEndScreen.prototype.update = function (gameTime, elapsedTime) {
  this.surManager.update(gameTime, elapsedTime);
  if(this.endScreenStartTime == null) {
    this.endScreenStartTime = gameTime;
  }
  else {
    if(gameTime > this.endScreenStartTime + 4000) {
      this.surManager.menuManager.assetList[0].isActive = true;
      this.surManager.menuManager.assetList[0].isVisible = true;
    }
  }
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
  this.menuManager = new BattleEndMenuManager();
  this.menuManager.setSurManager(this);
  this.menuManager.load();
}
BattleEndSurManager.prototype = Object.create(SurManager.prototype);
BattleEndSurManager.prototype.constructor = BattleEndSurManager;
BattleEndSurManager.prototype.update = function(gameTime, elapsedTime) {
  SurManager.prototype.update.call(this, gameTime, elapsedTime);
  this.menuManager.update(gameTime, elapsedTime);
}
BattleEndSurManager.prototype.draw = function(ctx) {
  SurManager.prototype.draw.call(this, ctx);
  this.menuManager.draw(ctx);
}

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

  this.hasLeveledUp = false;
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
    case 3:
    this.requiredXP = 20;
    break;
    case 4:
    this.requiredXP = 50;
    break;
    case 5:
    this.requiredXP = 100;
    break;
    case 6:
    this.requiredXP = 250;
    break;
    case 7:
    this.requiredXP = 450;
    break;
    case 8:
    this.requiredXP = 700;
    break;
    case 9:
    this.requiredXP = 1000;
    break;
    case 10:
    this.requiredXP = 1400;
    break;
    case 11:
    this.requiredXP = 1900;
    break;
    case 12:
    this.requiredXP = 2500;
    break;
    case 13:
    this.requiredXP = 3200;
    break;
    case 14:
    this.requiredXP = 4000;
    break;
    case 15:
    this.requiredXP = 5000;
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
    if(this.filledXP+this.oldXP>=this.requiredXP){
      this.hasLeveledUp = true;
      this.gainedXP -= (this.requiredXP-this.oldXP);
      this.owner.levelUp();
      this.oldXP = 0;
      this.fillTime -= (gameTime-this.stateStartTime);
      this.stateStartTime = gameTime;
      this.calculateRequiredXP();
      this.filledXP = 0;
    }
    if(this.filledXP >= this.gainedXP){
      this.stateStartTime = gameTime;
      this.state = "filled";
      this.owner.currentXP += this.gainedXP;
    }
  }
}
ExperienceBar.prototype.draw = function(ctx) {
  this.sprite.draw(ctx);
  //Draw the XPbar border
  if(this.hasLeveledUp) {
    ctx.fillStyle = "rgb(255, 215, 0)";
  }
  else {
    ctx.fillStyle = "rgb(150, 150, 150)";
  }
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

function BattleEndMenuManager() {
  Manager.call(this);
  this.isScreenOver = false;
}
BattleEndMenuManager.prototype = Object.create(Manager.prototype);
BattleEndMenuManager.prototype.constructor = BattleEndMenuManager;
BattleEndMenuManager.prototype.load = function() {
  let battleSelectMenu = new BattleSelectMenu();
  battleSelectMenu.setSurManager(this.surManager);
  battleSelectMenu.setPosition(0, 240);
  battleSelectMenu.load();
  battleSelectMenu.isActive = false;
  battleSelectMenu.isVisible = false;
  this.assetList.push(battleSelectMenu);
}
BattleEndMenuManager.prototype.update = function(gameTime, elapsedTime) {
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].update(gameTime, elapsedTime);
  }
  this.cursorHoverCheck();
}
BattleEndMenuManager.prototype.cursorHoverCheck = function() {
  let cursorHover = false;
  for(let i = 0; i<this.assetList.length; i++) {
    this.assetList[i].hoverCheck();
    if (this.assetList[i].cursorHover) {
      cursorHover = true;
      break;
    }
  }
  if(cursorHover) {
    this.surManager.enableHandPointer();
  }
  else {
    this.surManager.disableHandPointer();
  }
}
BattleEndMenuManager.prototype.handleClick = function() {
  this.newID = -1;
  for(let i = 0 ; i< this.assetList.length ; i++) {

    for(let j = 0 ; j < this.assetList[i].menuButtonList.length ; j++) {
      if(this.assetList[i].menuButtonList[j].cursorHover) {
        this.assetList[i].select(j);
        this.isScreenOver = true;
        if(j==0) {
          this.newID = Math.floor(Math.random()*2);
        }
        else if(j==1) {
          this.newID = 2 + Math.floor(Math.random()*2);
        }
        else if(j==2) {
          this.newID = 4 + Math.floor(Math.random()*3);
        }
        else if(j==3) {
          this.newID = 7 + Math.floor(Math.random()*3);
        }
        else if(j==4) {
          this.newID = 10 + Math.floor(Math.random()*3);
        }
        else if(j==5) {
          this.newID = 13 + Math.floor(Math.random()*2);
        }
      }
    }
  }
}

export {BattleEndScreen, ExperienceBar}
