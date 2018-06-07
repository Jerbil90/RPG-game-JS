import $ from 'jquery';
import {Sprite, InitiativeSprite, BattleSprite} from './Sprite';
import {Unit, Hero, Monster, Fighter, Knight, Wolf, Snake, HealthBar, Equipment} from './Unit';
import {Stats, CombatStats, EquippedStats} from './Stats';
import {DamageDisplay, InitiativeDisplay} from './UI';
import {Item, BattleItem, MinorHealthPotion, Antidote} from './Item';
import {Menu, HeroSelectionMenu, ActionMenu, SpecialMenu, ItemMenu, MonsterTargetMenu, HeroTargetMenu, TurnConfirmButton} from './Menu';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager} from './Manager';
import {Battle} from './Battle';

//Game class constructor, this is the main object that holds and manages the game
function Game() {
  this.userHeroList = [];
  this.userItemList = [];
  this.inventory = null;
  this.gameTime = 0;
  this.elapsedTime = 0;
  this.state = "battle";
  this.battle = null;
}
//This method is responsible for requesting the user's Heros from the server, atm it just provides default heros
Game.prototype.loadUserData = function() {
  //placeholder code for retrieveing player characters
  this.userHeroList.push(new Fighter("robbie"));
  let knight = new Knight("sammy");
  this.userHeroList.push(knight);

  this.inventory = new Inventory();
  this.inventory.load();
  this.userItemList = this.inventory.itemList;
}
//This method is responsible for creating an instance of a Battle
Game.prototype.startBattle = function () {
  this.state = "battle";
  this.battle = new Battle(0);
  let partyHeros = [];
  let battleItems = [];
  for(let i = 0;i < this.userHeroList.length;i++) {
    if(this.userHeroList[i].isInParty) {
      this.userHeroList[i].setPartyPosition(i);
      partyHeros.push(this.userHeroList[i]);
    }
  }
  for(let i = 0 ; i < this.userItemList.length; i++) {
    if(this.userItemList[i].isBattleItem && this.userItemList[i].quantity != 0) {
      battleItems.push(this.userItemList[i]);
    }
  }
  this.battle.loadBattle(partyHeros, battleItems);
}
//This is the game's main Update function it is responsible for determining gameTime and elapsedTime before calling the update functions of the appropriate managers
Game.prototype.update = function() {
  let currentDate = new Date();
  let currentTime = currentDate.getTime();
  this.elapsedTime = currentTime - this.gameTime;
  this.gameTime = currentTime;

  if(this.state=="battle") {
    this.battle.update(this.gameTime, this.elapsedTime);
  }
}
//This is the game's main draw function
Game.prototype.draw = function(ctx) {
  switch(this.state) {
    case "battle":
      this.battle.draw(ctx);
      break;
  }
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
  this.lastMouseX = 0;
  this.lastMouseY = 0;
  this.mousex = 0;
  this.mousey = 0;
}
SurManager.prototype.enableHandPointer = function() {
  $("#gameArea").addClass("handPointer");
}
SurManager.prototype.disableHandPointer = function() {
  $("#gameArea").removeClass("handPointer");
}
SurManager.prototype.setMouseDetails = function(x, y) {
  this.lastMouseY = this.mousey;
  this.lastMouseX = this.mousex;
  this.mousex = x;
  this.mousey = y;
}
//This is surManager's main load function
SurManager.prototype.load = function() {

}
//This is surManager's main update function, responsible for calling all the managers individual update functions
SurManager.prototype.update = function(gameTime, elapsedTime){
  this.heroManager.update(gameTime, elapsedTime);
  this.monsterManager.update(gameTime, elapsedTime);
  this.logManager.update(gameTime, elapsedTime);
  this.environmentManager.update(gameTime, elapsedTime);
  //this.menuManager.update(gameTime, elapsedTime);
}
//This is surManager's main draw function
SurManager.prototype.draw = function(ctx) {
  this.environmentManager.draw(ctx);
  this.heroManager.draw(ctx);
  this.monsterManager.draw(ctx);
  this.logManager.draw(ctx);
  //this.menuManager.draw(ctx);
}

$(document).ready(function() {
  var game = new Game();
  game.loadUserData();
  game.startBattle();
  var canvas = document.getElementById('gameArea');
  canvas.addEventListener("mousemove", function(event) {
    var rect = canvas.getBoundingClientRect();
    let mousex = event.clientX - rect.left;
    let mousey = event.clientY - rect.top;
    game.battle.battleSurManager.setMouseDetails(mousex, mousey);
  });
  canvas.addEventListener("click", function(event) {
    game.battle.battleSurManager.battleMenuManager.handleClick();
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
