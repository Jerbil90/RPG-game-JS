import {SurManager} from './main';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager} from './Manager';
import {Sprite, InitiativeSprite, BattleSprite, PoisonEffectSprite, StunnedEffectSprite} from './Sprite';
import {Menu, HeroSelectionMenu, ActionMenu, SpecialMenu, ItemMenu, MonsterTargetMenu, HeroTargetMenu, TurnConfirmButton, BattleSelectMenu} from './Menu'
import {Screen} from './Screen';

function AftermathScreen(game) {
  this.game = game;
  this.heroManager = new HeroManager(this);
  this.monsterManager = new MonsterManager(this);
  this.menuManager = new AftermathMenuManager(this);
  Screen.call(this, game);
  this.endScreenStartTime = null;
}
AftermathScreen.prototype = Object.create(Screen.prototype);
AftermathScreen.prototype.constructor = AftermathScreen;
AftermathScreen.prototype.update = function (gameTime, elapsedTime) {
  Screen.prototype.update.call(this, gameTime, elapsedTime);
  if(this.endScreenStartTime == null) {
    this.endScreenStartTime = gameTime;
  }
  else {
    if(gameTime > this.endScreenStartTime + 4000) {
      this.menuManager.assetList[0].isActive = true;
      this.menuManager.assetList[0].isVisible = true;
    }
  }
}
AftermathScreen.prototype.setUpHeroManager = function () {
  this.heroManager = this.game.battleScreen.heroManager;
  this.heroManager.endBattle();
};
AftermathScreen.prototype.setUpMonsterManager = function () {
  this.monsterManager = this.game.battleScreen.monsterManager;
};
AftermathScreen.prototype.setUpMenuManager = function() {
  this.menuManager.load();
}
AftermathScreen.prototype.newEnd = function () {
  this.load();
};
AftermathScreen.prototype.endScreen = function () {
  this.menuManager.reset();
};

function GameOverSurManager() {
  this.environmentManager = new MenuEnvironmentManager();
  this.environmentManager.setSurManager(this);
  this.environmentManager.load();
}
GameOverSurManager.prototype = Object.create(SurManager.prototype);
GameOverSurManager.prototype.constructor = GameOverSurManager;
GameOverSurManager.prototype.draw = function(ctx) {
  this.environmentManager.draw(ctx);
  ctx.fillText("Game Over", 200, 200);
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

function AftermathMenuManager(screen) {
  MenuManager.call(this, screen);
  this.isScreenOver = false;
  let battleSelectMenu = new BattleSelectMenu(screen);
  battleSelectMenu.setPosition(0, 240);
  battleSelectMenu.load();
  battleSelectMenu.isActive = false;
  battleSelectMenu.isVisible = false;
  this.assetList.push(battleSelectMenu);
}
AftermathMenuManager.prototype = Object.create(MenuManager.prototype);
AftermathMenuManager.prototype.constructor = AftermathMenuManager;
AftermathMenuManager.prototype.load = function() {
  this.assetList[0].isVisible = true;
  this.assetList[0].isActive = true;
}
AftermathMenuManager.prototype.update = function(gameTime, elapsedTime) {
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].update(gameTime, elapsedTime);
  }
  this.cursorHoverCheck();
}

AftermathMenuManager.prototype.select = function(i, j) {
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
    else if(j==6) {
      this.newID = 100;
    }
  }
}
AftermathMenuManager.prototype.reset = function () {
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].resetMenu();
    this.isScreenOver = false;
  }
  this.assetList[0].isVisible = false;
  this.assetList[0].isActive = false;
};

export {AftermathScreen, ExperienceBar}
