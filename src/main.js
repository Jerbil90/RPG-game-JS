import $ from 'jquery';
import {Sprite, InitiativeSprite, BattleSprite, PoisonEffectSprite, StunnedEffectSprite} from './Sprite';
import {Unit, Hero, Monster, Fighter, Knight, Wolf, Snake, HealthBar, Equipment} from './Unit';
import {Stats, CombatStats, EquippedStats} from './Stats';
import {DamageDisplay, PoisonedDisplayIndicator, InitiativeDisplay} from './UI';
import {Item, BattleItem, MinorHealthPotion, Antidote} from './Item';
import {Menu, HeroSelectionMenu, ActionMenu, SpecialMenu, ItemMenu, MonsterTargetMenu, HeroTargetMenu, TurnConfirmButton, BattleSelectMenu} from './Menu';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager} from './Manager';
import {BattleScreen} from './BattleScreen';
import {AftermathScreen, ExperienceBar} from './AftermathScreen';
import {MainMenuScreen} from './MainMenuScreen';

//Game class constructor, this is the main object that holds and manages the game
function Game() {
  this.userHeroList = [];
  this.userItemList = [];
  this.inventory = null;
  this.gameTime = 0;
  this.elapsedTime = 0;
  this.state = "none";
  this.targetScreen = null;
  this.currentScreen = null;
  this.battleID = -1;
  this.battleScreen = null;
  this.battleEndScreen = null;
  this.mainMenuScreen = null;
  this.fade = new Fade();
}
//the loadGame method instantiates the various screens that the game will scwitch between
Game.prototype.loadGame = function () {
  this.battleScreen = new BattleScreen(this);
  this.aftermathScreen = new AftermathScreen(this);
};
//This method is responsible for requesting the user's Heros from the server, atm it just provides default heros
Game.prototype.loadUserData = function() {
  //placeholder code for retrieveing player characters
  let fighter = new Fighter("robbie");
  this.userHeroList.push(fighter);
  let knight = new Knight("sammy");
  this.userHeroList.push(knight);

  this.inventory = new Inventory();
  this.inventory.load();
  this.userItemList = this.inventory.itemList;
}
//This method is responsible for creating an instance of a Battle
Game.prototype.startBattle = function () {
  this.targetScreen = this.battleScreen;
  this.targetState = "battle";
  this.battleScreen.loadBattle();
}
Game.prototype.endBattle = function() {
  if(this.targetScreen != this.aftermathScreen) {
    this.targetState = "aftermath";
    this.aftermathScreen.newEnd();
    this.targetScreen = this.aftermathScreen;
    this.fade.startFade();
  }
}
//This is the game's main Update function it is responsible for determining gameTime and elapsedTime before calling the update functions of the appropriate managers
Game.prototype.update = function() {
  var currentDate = new Date();
  var currentTime = currentDate.getTime();
  this.elapsedTime = currentTime - this.gameTime;
  this.gameTime = currentTime;
  if(this.state == "battle"){
    this.battleScreen.update(this.gameTime, this.elapsedTime);
  }
  if(this.state == "aftermath") {
    this.aftermathScreen.update(this.gameTime, this.elapsedTime);
  }
  //this.mainMenuScreen.update(this.gameTime, this.elapsedTime);

  if(this.fade.fadeState == "none") {
    if(this.state == "battle") {
      if(this.battleScreen.state == "victory" || this.battleScreen.state == "defeat") {
        this.endBattle();
      }
    }
    else if(this.state == "aftermath") {
      if(this.aftermathScreen.menuManager.isScreenOver) {
        this.aftermathScreen.endScreen();
        if(this.aftermathScreen.menuManager.newID != 100) {
          this.battleID = this.aftermathScreen.menuManager.newID;
          this.startBattle();
          this.fade.startFade();
        }
        else{
          this.openMainMenu();
        }

      }
    }/*
    else if(this.currentScreen == this.mainMenuScreen) {
    }*/
  }
  else {
    this.fade.update(this.gameTime, this.elapsedTime);
    if(this.fade.fadeState == "faded") {
      this.currentScreen = this.targetScreen;
      this.state = this.targetState;
    }
    else if(this.fade.hasFadeEnded) {
      this.fade.hasFadeEnded = false;
    }
  }
}
Game.prototype.openMainMenu = function() {
  this.mainMenuScreen = new MainMenuScreen(this.battleEndScreen);
  this.targetState = "mainMenuScreen";
  this.fade.startFade();
}

//This is the game's main draw function
Game.prototype.draw = function(ctx) {
  this.currentScreen.draw(ctx);
  this.fade.draw(ctx);
}

function Fade() {
  this.alpha = 0;
  this.stateStartTime = null;
  this.fadeState = "none"
  this.fadeTime = 500;
  this.hasFadeEnded = false;
}
Fade.prototype.update = function(gameTime, elapsedTime) {
  switch(this.fadeState) {
    case "none":
    break;
    case "startingFade":
    this.fadeState = "fadingOut";
    this.stateStartTime = gameTime;
    break;
    case "fadingOut":
    if(gameTime > this.stateStartTime + this.fadeTime) {
      this.stateStartTime = gameTime;
      this.fadeState = "faded";
      this.alpha = 1;
    }
          this.alpha = ((gameTime-this.stateStartTime)/this.fadeTime);
    break;
    case "faded":
    if(gameTime > this.stateStartTime + this.fadeTime) {
      this.stateStartTime = gameTime;
      this.fadeState = "fadingIn";
    }
    this.alpha = 1;
    break;
    case "fadingIn" :
    if(gameTime > this.stateStartTime + this.fadeTime) {
      this.stateStartTime = null;
      this.fadeState = "none";
      this.hasFadeEnded = true;
    }
    this.alpha = 1 - ((gameTime-this.stateStartTime)/this.fadeTime);
    break;
    default:
    console.log("error in fade update method, invalid fadeState");
    break;
  }
}
Fade.prototype.draw = function(ctx) {
  if(this.fadeState != "none") {
    ctx.fillStyle = "rgba(0, 0, 0," + this.alpha + ")";
    ctx.fillRect(0, 0, 640, 480);
  }
}
Fade.prototype.startFade = function() {
  this.fadeState = "startingFade";
}

function Inventory() {
  this.itemList = [];
}
Inventory.prototype.load = function(){
  this.itemList = [];
  let minorHealthPotion = new MinorHealthPotion();
  minorHealthPotion.quantity = 1;
  this.itemList.push(minorHealthPotion);
  let antidote = new Antidote();
  antidote.quantity = 1;
  this.itemList.push(antidote);
}
Inventory.prototype.fetchBattleItems = function() {
  var battleItems = [];
  for(let  i = 0 ; i < this.itemList.length ; i ++) {
    if(this.itemList[i].isBattleItem && this.itemList[i].quantity > 0) {
      battleItems.push(this.itemList[i]);
    }
  }
  return battleItems;
}

//This class is responsible for managing the game while in the manorExploration phase
function ManorExplore() {
  this.heroList = [];
}



//This is the surManager's constructor function, the surManager holds and manages all the other managers
function SurManager() {
  this.heroManager = null;
  this.monsterManager = null;
  this.logManager = null;
  this.environmentManager = null;
  //this.menuManager = null;

}


$(document).ready(function() {
  var game = new Game();
  game.loadUserData();
  game.loadGame();
  game.state = "battle";
  game.currentScreen = game.battleScreen;
  game.startBattle();
  var canvas = document.getElementById('gameArea');
  canvas.addEventListener("mousemove", function(event) {
    var rect = canvas.getBoundingClientRect();
    let mousex = event.clientX - rect.left;
    let mousey = event.clientY - rect.top;
    game.currentScreen.setMouseDetails(mousex, mousey);
    if(game.aftermathScreen != null) {
      game.aftermathScreen.setMouseDetails(mousex, mousey);
    }/*
    if(game.mainMenuScreen != null) {
      game.mainMenuScreen.surManager.setMouseDetails(mousex, mousey);
    }*/
  });
  canvas.addEventListener("click", function(event) {
    if(game.currentScreen.menuManager != null) {
      game.currentScreen.menuManager.handleClick();
    }
  });

  var intervalFunction = setInterval(function() {
    game.update();

    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      game.draw(ctx);
    }
  }, 16.67);

});


export {SurManager}
