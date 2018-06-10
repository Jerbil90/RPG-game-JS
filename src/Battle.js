import {SurManager} from './main';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager} from './Manager';
import {Menu, HeroSelectionMenu, ActionMenu, SpecialMenu, ItemMenu, MonsterTargetMenu, HeroTargetMenu, TurnConfirmButton, BattleSelectMenu} from './Menu';
import {DamageDisplay, PoisonedDisplayIndicator, InitiativeDisplay} from './UI';

//This class is responsible for managing the game while in the battle phase
function Battle(battleID) {
  this.battleState = "waiting for input";
  this.battleID = battleID;
  this.battleStartTime = new Date();
  this.battleSurManager = null;
}
//This is hte Battle's main load method
Battle.prototype.loadBattle = function(partyHeros, battleItems) {
  this.battleSurManager = new BattleSurManager();
  this.battleSurManager.load(partyHeros, battleItems, this.battleID);
}
//This is the Battle's main update method, responsible for calling the surManager's update function and determining the battleState
Battle.prototype.update = function(gameTime, elapsedTime) {
  this.battleSurManager.update(gameTime, elapsedTime);
  if(this.battleSurManager.battleState == "victory"|| this.battleSurManager.battleState == "defeat") {
    this.battleState = "battle over";
  }
  switch(this.battleState){
    case "waiting for input":
      let pass = true;
	  let  i = 0;
      for(i =0;i< this.battleSurManager.heroManager.assetList.length;i++){
        if(!this.battleSurManager.heroManager.assetList[i].isActionConfirmed) {
          pass = false;
        }
      }
      if(pass){
        this.battleState = "turn in progress";
      }
      break;
      case "turn in progress":
      break;
      case "battle over" :

      break;
    default:
      console.log("battleState error, not an acceptable value for battleState!");
      break;
  }
}
//This is battle's main draw function
Battle.prototype.draw = function(ctx) {
  this.battleSurManager.draw(ctx);
}

//This is the constructorfunction for the BattleSurManager class, this class is responsible for all the subManagers in a battleScene and has special duties such as passing the currently selected partyHeros to the heroManager
function BattleSurManager(){
  SurManager.call(this);
  this.battleState = "waiting for input";
  this.battleMenuManager = null;
  this.combat = null;
  this.initiativeDisplay = null;
}
BattleSurManager.prototype = Object.create(SurManager.prototype);
BattleSurManager.prototype.constructor = BattleSurManager;
//This is the battleSurManager's main load function
BattleSurManager.prototype.load = function(partyHeros, battleItems, battleID) {
  this.heroManager = new HeroManager();
  this.heroManager.setSurManager(this);
  this.heroManager.load(partyHeros);
  this.battleItems = battleItems;
  this.monsterManager = new MonsterManager();
  this.monsterManager.setSurManager(this);
  this.monsterManager.load(battleID);
  this.logManager = new LogManager();
  this.logManager.setSurManager(this);
  this.logManager.load();
  this.environmentManager = new EnvironmentManager();
  this.environmentManager.setSurManager(this);
  this.environmentManager.load(battleID);
  this.battleMenuManager = new BattleMenuManager();
  this.battleMenuManager.setSurManager(this);
  this.battleMenuManager.load();
  //Then load battleSprites
  this.heroManager.setPassiveBattleSpritePosition();
  this.monsterManager.setPassiveBattleSpritePosition();
  this.initiativeDisplay =  new InitiativeDisplay(this);
}
BattleSurManager.prototype.update = function(gameTime, elapsedTime) {
  SurManager.prototype.update.call(this, gameTime, elapsedTime);
  this.initiativeDisplay.update(gameTime, elapsedTime);
  if(this.battleState == "waiting for input") {
    this.battleMenuManager.update(gameTime, elapsedTime);
  }
  else if(this.battleState == "combat") {
    this.combat.update(gameTime, elapsedTime);
    if(this.combat.isCombatOver){
      //this.combat.poisonCheck();
      this.battleState = "waiting for input";
      this.battleMenuManager.newRound();
      this.heroManager.newRound();
      this.monsterManager.newRound();
    }
  }
  if(this.combat != null) {
    if(this.combat.isVictory) {
      this.battleState = "victory";
    }
    else if(this.combat.isDefeat) {
      this.battleState = "defeat";
    }
  }

}
BattleSurManager.prototype.draw = function(ctx) {
  SurManager.prototype.draw.call(this, ctx);
  this.battleMenuManager.draw(ctx);
  if(this.combat != null) {
    if(this.combat.isVictory) {
      ctx.font = "40px serif";
      ctx.fillStyle = "rgb(200, 0, 0)";
      ctx.fillText("VICTORY!", 200, 100);
    }
    else if (this.combat.isDefeat) {
      ctx.font = "40px serif";
      ctx.fillStyle = "rgb(0, 200, 0)";
      ctx.fillText("Defeat!", 200, 100);
    }
  }
}

function Combat(surManager) {
  this.surManager = surManager;
  this.combatStartTime = null
  this.isCombatOver = false;
  this.isVictory = false;
  this.isDefeat = false;
  this.turnOrder = [];
  this.currentTurn = 0;
  this.isCurrentTurnTargeted = false;
  this.isCurrentTurnAttacked = false;
  let applicableHeros = [];
  let i = 0;
  for(i = 0 ; i < this.surManager.heroManager.assetList.length; i++) {
    let currentHero = this.surManager.heroManager.assetList[i];
    if(currentHero.isAlive) {
      applicableHeros.push(currentHero);
    }
  }
  let applicableMonsters = [];
  for(i = 0 ; i < this.surManager.monsterManager.assetList.length; i++) {
    let currentMonster = this.surManager.monsterManager.assetList[i];
    if(currentMonster.isAlive) {
      applicableMonsters.push(currentMonster);
    }
  }
  this.applicableHeros = applicableHeros;
  this.applicableMonsters = applicableMonsters;
}
Combat.prototype.victoryCheck = function() {
  this.isVictory = true;
  let i = 0;
  for(i = 0 ; i < this.surManager.monsterManager.assetList.length ; i++) {
    if(this.surManager.monsterManager.assetList[i].isAlive) {
      this.isVictory = false;
    }
  }
  if(!this.isCombatOver) {
    if(this.isVictory) {
      this.isCombatOver = true;
      this.surManager.battleState = "victory";
    }
  }
}
Combat.prototype.defeatCheck = function() {
  this.isDefeat = true;
  let i  = 0;
  for(i = 0 ; i < this.surManager.heroManager.assetList.length ; i++) {
    if(this.surManager.heroManager.assetList[i].isAlive) {
      this.isDefeat = false;
    }
  }
  if(!this.isCombatOver) {
    if(this.isDefeat) {
      this.isCombatOver = true;
      this.surManager.battleState = "defeat";
    }
  }
}
Combat.prototype.update = function(gameTime, elapsedTime) {
  if (this.combatStartTime == null) {
    this.combatStartTime = gameTime;
    this.arbTime = gameTime;
    this.surManager.disableHandPointer();
    console.log("combat started@ combatstarttime: " + this.combatStartTime);
    this.setMonsterActions();
    this.setTurnOrder();
    this.turnOrder[0].combatStance.isCurrentTurn = true;
  }
  else if (this.currentTurn < this.turnOrder.length) {
    if(this.turnOrder[this.currentTurn].combatStance.isCurrentTurn) {
      switch(this.turnOrder[this.currentTurn].combatStance.currentStance) {
        case "slain":
          this.turnOrder[this.currentTurn].combatStance.isCurrentTurn  = false;
          break;
        case "passive":
          break;
        case "targeting":
          if(!this.isCurrentTurnTargeted){
            this.isCurrentTurnTargeted = true;
            this.checkTarget();
          }
          break;
        case "attacking":
          if(!this.isCurrentTurnAttacked) {
            this.isCurrentTurnAttacked = true;
            switch(this.turnOrder[this.currentTurn].currentlySelectedAction){
              case "Attack":
                this.turnOrder[this.currentTurn].attack(this.turnOrder[this.currentTurn].currentlySelectedTarget);
                break;
              case "Special":
                this.turnOrder[this.currentTurn].currentlySelectedSpecialOrItem.useMove(this.turnOrder[this.currentTurn], this.turnOrder[this.currentTurn].currentlySelectedTarget);
                break;
              case "Item":
this.turnOrder[this.currentTurn].currentlySelectedSpecialOrItem.effect(this.turnOrder[this.currentTurn].currentlySelectedTarget)
                break;
              default:
                console.log("currentlySelectedeAction Error combat.update()\ncurrentlySelectedAction: " + this.turnOrder[this.currentTurn].currentlySelectedAction);
                break;
            }
          }
          break;
        default:
          console.log("battlestanceError (combat)");
          break;
      }
    }
    else {
      this.victoryCheck();
      this.defeatCheck();
      if(this.isCombatOver) {

      }
      else {
        let test = true;
        while (test) {
          this.currentTurn++;
          console.log("currentTurn now = " + this.currentTurn);
          if(this.applicableHeros.length+this.applicableMonsters.length==this.currentTurn) {
            test = false;
            this.isCombatOver = true;
          }
          else {
            this.turnOrder[this.currentTurn].deathCheck();
            if(this.turnOrder[this.currentTurn].isAlive) {
              test = false;
              this.turnOrder[this.currentTurn].combatStance.isCurrentTurn = true;
              this.isCurrentTurnTargeted = false;
              this.isCurrentTurnAttacked = false;
            }
          }
        }
      }
    }
  }
  else {
    this.isCombatOver = true;
    console.log("Combat is over!");
  }
  if(this.isCombatOver) {
    this.poisonCheck();
  }
}
Combat.prototype.poisonCheck = function() {
  for(let i = 0 ; i < this.turnOrder.length ; i++) {
    console.log("performing poison check for " + this.turnOrder[i].name);
    if(this.turnOrder[i].isAlive) {
      if(this.turnOrder[i].isAfflictedWith("Poisoned")) {
        this.turnOrder[i].remainingHP -= Math.floor(this.turnOrder[i].maxHP/5);
        this.turnOrder[i].damageDisplay = new DamageDisplay(Math.floor(this.turnOrder[i].maxHP/5), this.turnOrder[i].battleSprite.position);
        console.log(this.turnOrder[i].name + " takes " + Math.floor(this.turnOrder[i].maxHP/5) + " poison damage!");
      }
    }
  }
}
//This method checks to see if the current unit has been blocked this combat, if so it replaces its target with a random blocker
Combat.prototype.blockCheck = function(i) {
  if(this.turnOrder[i].isAfflictedWith("Blocked")) {
    let blockedBy = [];
    let isBlocked = false;
    for(let j = 0 ; j < this.turnOrder[i].statusEffectList.length ; j++) {
      if(this.turnOrder[i].statusEffectList[j].name == "Blocked") {
        if(this.turnOrder[i].statusEffectList[j].blocker.isAlive) {
          blockedBy.push(this.turnOrder[i].statusEffectList[j].blocker);
          isBlocked = true;
        }
      }
    }
    if(isBlocked) {
      let rando = 0;
      rando = Math.floor(Math.random() * blockedBy.length);
      this.turnOrder[i].currentlySelectedTarget = blockedBy[rando];
    }
  }
}
Combat.prototype.guardCheck = function(i) {
  if(this.turnOrder[i].currentlySelectedTarget.isAfflictedWith("Guarded")) {
    let guardedBy = [];
    let isGuarded = false;
    for(let j = 0 ; j < this.turnOrder[i].currentlySelectedTarget.statusEffectList.length ; j++) {
      if(this.turnOrder[i].currentlySelectedTarget.statusEffectList[j].name == "Guarded"){
        if(this.turnOrder[i].currentlySelectedTarget.statusEffectList[j].guardian.isAlive) {
          guardedBy.push(this.turnOrder[i].currentlySelectedTarget.statusEffectList[j].guardian);
          isGuarded = true;
        }
      }
    }
    if(isGuarded) {
      let rando = Math.floor(Math.random()*guardedBy.length);
      this.turnOrder[i].currentlySelectedTarget = guardedBy[rando];
    }
  }
}
Combat.prototype.checkTarget = function() {
  let isUsedOnDead = false;
  if(this.turnOrder[this.currentTurn].currentlySelectedSpecialOrItem != null) {
    isUsedOnDead = this.turnOrder[this.currentTurn].currentlySelectedSpecialOrItem.isUsedOnDead;
    if(!this.turnOrder[this.currentTurn].currentlySelectedSpecialOrItem.isUsedOnOpponent) {

    }
    else {
      this.guardCheck(this.currentTurn);
      this.blockCheck(this.currentTurn);
    }
  }
  else {
    console.log("no special or item detected, performing guard/blockCheck");
    this.guardCheck(this.currentTurn);
    this.blockCheck(this.currentTurn);
  }
  let currentTarget = this.turnOrder[this.currentTurn].currentlySelectedTarget;
  let  i = 0;
  if(!currentTarget.isAlive){
    //skip to next random target of same type (heros/monsters);
    if(currentTarget.role == "monster") {
      let potentialTargetsNum = 0;
      let newlyApplicableMonsters = [];

      for(i = 0 ; i < this.applicableMonsters.length ; i++) {
        if(this.applicableMonsters[i].isAlive) {
          newlyApplicableMonsters.push(this.applicableMonsters[i]);
          potentialTargetsNum++;
        }
      }
      let rando = Math.floor(Math.random() * potentialTargetsNum);
      this.turnOrder[this.currentTurn].currentlySelectedTarget = newlyApplicableMonsters[rando];
    }
    else {
      let potentialTargetsNum = 0;
      let newlyApplicableHeros = [];
      for(i = 0 ; i < this.applicableHeros.length ; i++) {
        if(this.applicableHeros[i].isAlive) {
          newlyApplicableHeros.push(this.applicableHeros[i]);
          potentialTargetsNum++;
        }
      }
      let rando = Math.floor(Math.random() * potentialTargetsNum);
      this.turnOrder[this.currentTurn].currentlySelectedTarget = newlyApplicableHeros[rando];
    }
  }
}
Combat.prototype.setMonsterActions = function() {
	let i = 0;
  for(i = 0 ; i < this.applicableMonsters.length ; i++) {
    let currentMonster = this.applicableMonsters[i];
    currentMonster.isActionSelected = true;
    currentMonster.currentlySelectedAction = "Attack";
    currentMonster.currentlySelectedTarget = this.applicableHeros[Math.floor(Math.random() * this.applicableHeros.length)];
  }
}
Combat.prototype.setTurnOrder = function(){
  this.turnOrder = [];
  let maxSpeed = 0;
  let i = 0;
  for (i = 0 ; i < this.applicableMonsters.length ; i++) {
    if(this.applicableMonsters[i].combatStats.speed > maxSpeed) {
      maxSpeed = this.applicableMonsters[i].baseStats.speed;
    }
  }
  for (i = 0 ; i < this.applicableHeros.length ; i++) {
    if(this.applicableHeros[i].combatStats.speed > maxSpeed) {
      maxSpeed = this.applicableHeros[i].combatStats.speed;
    }
  }

  let allAssigned = false;

  while (!allAssigned) {
    if(Math.random()>0.5) {
      for (i = 0 ; i < this.applicableHeros.length ; i++) {
        if (this.applicableHeros[i].combatStats.speed == maxSpeed) {
          this.turnOrder.push(this.applicableHeros[i]);
        }
      }
      for (i = 0 ; i < this.applicableMonsters.length ; i++) {
        if (this.applicableMonsters[i].combatStats.speed == maxSpeed) {
          this.turnOrder.push(this.applicableMonsters[i]);
        }
      }
    }
    else {
      for (i = 0 ; i < this.applicableMonsters.length ; i++) {
        if (this.applicableMonsters[i].combatStats.speed == maxSpeed) {
          this.turnOrder.push(this.applicableMonsters[i]);
        }
      }
      for (i = 0 ; i < this.applicableHeros.length ; i++) {
        if (this.applicableHeros[i].combatStats.speed == maxSpeed) {
          this.turnOrder.push(this.applicableHeros[i]);
        }
      }
    }
    maxSpeed--;
    if(this.turnOrder.length == this.applicableHeros.length + this.applicableMonsters.length) {
      allAssigned = true;
    }
  }
}
Combat.prototype.resetUnits = function() {
  let i = 0;
  for(i = 0 ; i < this.surManager.heroManager.assetList.length ; i++) {
    this.surManager.heroManager.assetList[i].combatReset();
  }
  for(i = 0 ; i < this.surManager.monsterManager.assetList.length ; i++) {
    this.surManager.monsterManager.assetList[i].combatReset();
  }
}







//This si the constructor function for the Menu Manager class, this clas sis responsible for managing the various menus that the user will use to interact with the game
function BattleMenuManager() {
  Manager.call(this);
  this.currentlySelectedHero = -1;
  this.currentlySelectedAction = "none";
  this.currentlySelectedSpecialOrItem = "none";
  this.currentlySelectedTarget = null;
  this.combat = null;
}
BattleMenuManager.prototype = Object.create(Manager.prototype);
BattleMenuManager.prototype.constructor = BattleMenuManager;
BattleMenuManager.prototype.load = function(){
  let heroSelectionMenu = new HeroSelectionMenu();
  heroSelectionMenu.setSurManager(this.surManager);
  heroSelectionMenu.setPosition(0, 240);
  heroSelectionMenu.load(this.surManager.heroManager.assetList);
  this.assetList.push(heroSelectionMenu);
  let actionMenu = new ActionMenu();
  actionMenu.setSurManager(this.surManager);
  actionMenu.load();
  this.assetList.push(actionMenu);
  let specialMenu = new SpecialMenu();
  specialMenu.setSurManager(this.surManager);
  specialMenu.load();
  this.assetList.push(specialMenu);
  let itemMenu = new ItemMenu();
  itemMenu.setSurManager(this.surManager);
  itemMenu.load();
  this.assetList.push(itemMenu);
  let monsterTargetMenu = new MonsterTargetMenu();
  monsterTargetMenu.setSurManager(this.surManager);
  monsterTargetMenu.load();
  this.assetList.push(monsterTargetMenu);
  let heroTargetMenu = new HeroTargetMenu();
  heroTargetMenu.setSurManager(this.surManager);
  heroTargetMenu.load();
  this.assetList.push(heroTargetMenu);
  let confirmTurnButton = new TurnConfirmButton();
  confirmTurnButton.setSurManager(this.surManager);
  confirmTurnButton.load();
  this.assetList.push(confirmTurnButton);
}
BattleMenuManager.prototype.update = function(gameTime, elapsedTime) {
	let  i = 0;
  for(i=0;i<this.assetList.length;i++) {
    this.assetList[i].update(gameTime, elapsedTime);
  }
  this.cursorHoverCheck();
}
BattleMenuManager.prototype.cursorHoverCheck = function() {
  let cursorHover = false;
  let  i =0;
  for(i = 0; i<this.assetList.length; i++) {
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
BattleMenuManager.prototype.handleClick = function(){
  //heroSelectionMenu (i=0); ActionMenu(i=1); Special Move Menu (i=2); Item  Menu(i=3); MonsterTargetMenu (i=4); HeroTargetMenu(i=5); ConfirmTurn Button (i=6);
  let  i = 0;
  for(i = 0 ; i< this.assetList.length; i++) {

    for(let j = 0 ; j< this.assetList[i].menuButtonList.length; j++) {
      if(this.assetList[i].menuButtonList[j].cursorHover) {
        this.assetList[i].select(j);
        //If a different or new Hero is chosen from the the heroSelectionMenu, activate the action Menu, and set this.currentlySelectedHero, find the targets and currentlySelectedAction from the hero if they exist

        if(i==0 && this.currentlySelectedHero != j) {
          console.log("Different or new Hero selected, assigning...");
          this.currentlySelectedHero = j;
          this.assetList[1].isVisible = true;
          this.assetList[1].isActive = true;
          this.assetList[1].resetMenu();
          this.assetList[2].resetMenu();
          this.assetList[3].resetMenu();
          this.assetList[4].resetMenu();
          this.assetList[5].resetMenu();
          this.currentlySelectedAction = this.surManager.heroManager.assetList[j].currentlySelectedAction;
          this.currentlySelectedSpecialOrItem = this.surManager.heroManager.assetList[j].currentlySelectedSpecialOrItem;
          this.currentlySelectedTarget = this.surManager.heroManager.assetList[j].currentlySelectedTarget;
          if(this.currentlySelectedAction == "none") {
            this.assetList[2].isVisible = false;
            this.assetList[2].isActive = false;
            this.assetList[3].isVisible = false;
            this.assetList[3].isActive = false;
            this.assetList[4].isVisible = false;
            this.assetList[4].isActive = false;
            this.assetList[5].isVisible = false;
            this.assetList[5].isActive = false;
          }
          else if(this.currentlySelectedAction == "Attack") {
            this.assetList[1].setSelectionByIndex(0);
            this.assetList[2].isVisible = false;
            this.assetList[2].isActive = false;
            this.assetList[3].isVisible = false;
            this.assetList[3].isActive = false;
            this.assetList[4].isVisible = true;
            this.assetList[4].isActive = true;
            this.assetList[5].isVisible = false;
            this.assetList[5].isActive = false;
            if(this.surManager.heroManager.assetList[this.currentlySelectedHero].isTargetSelected) {
              this.assetList[4].setSelection(this.surManager.heroManager.assetList[this.currentlySelectedHero].currentlySelectedTarget);
              this.currentlySelectedTarget = this.surManager.heroManager.assetList[this.currentlySelectedHero].currentlySelectedTarget;
            }
          }
          else if(this.currentlySelectedAction == "Special"){
            this.assetList[2].setOptions(this.surManager.heroManager.assetList[this.currentlySelectedHero].specialMoveList);
            this.assetList[1].isVisible = false;
            this.assetList[1].isActive = false;
            this.assetList[2].isVisible = true;
            this.assetList[2].isActive = true;
            this.assetList[3].isVisible = false;
            this.assetList[3].isActive = false;
            this.assetList[4].isVisible = false;
            this.assetList[4].isActive = false;
            this.assetList[5].isVisible = false;
            this.assetList[5].isActive = false;
            if(this.currentlySelectedSpecialOrItem == null) {
              this.currentlySelectedTarget = null;
            }
            else {
              this.assetList[2].setSelectionByString(this.currentlySelectedSpecialOrItem.name);
              if(this.currentlySelectedSpecialOrItem.isUsedOnOpponent) {
                this.assetList[4].isVisible = true;
                this.assetList[4].isActive = true;
                this.assetList[4].setSelection(this.currentlySelectedTarget);
              }
              else {
                this.assetList[5].isVisible = true;
                this.assetList[5].isActive = true;
                this.assetList[5].setSelection = (this.currentlySelectedTarget);
              }
            }
          }
          else if(this.currentlySelectedAction == "Item"){
            this.assetList[1].isVisible - false;
            this.assetList[1].isActive = false;
            this.assetList[2].isVisible = false;
            this.assetList[2].isActive = false;
            this.assetList[3].checkRemainingItems(j);
            this.assetList[3].isVisible = true;
            this.assetList[3].isActive = true;
            this.assetList[4].isVisible = false;
            this.assetList[4].isActive = false;
            this.assetList[5].isVisible = false;
            this.assetList[5].isActive = false;
            if(this.currentlySelectedSpecialOrItem == null) {
              this.currentlySelectedTarget = null;

            }
            else {
              this.assetList[3].setSelection(this.currentlySelectedSpecialOrItem);
              if(this.currentlySelectedSpecialOrItem.isUsedOnOpponent) {
                this.assetList[4].isVisible = true;
                this.assetList[4].isActive = true;
                this.assetList[4].setSelection(this.currentlySelectedTarget);
              }
              else {
                this.assetList[5].isVisible = true;
                this.assetList[5].isActive = true;
                this.assetList[5].setSelection(this.currentlySelectedTarget);
              }
            }
          }
          else if(this.currentlySelectedAction == "Retreat") {
            this.assetList[1].setSelectionByIndex(3);
            this.assetList[2].isVisible = false;
            this.assetList[2].isActive = false;
            this.assetList[3].isVisible = false;
            this.assetList[3].isActive = false;
            this.assetList[4].isVisible = false;
            this.assetList[4].isActive = false;
            this.assetList[5].isVisible = false;
            this.assetList[5].isActive = false;
          }

        }
        else if(i==0 && this.currentlySelectedHero == j){
          console.log("Same Hero selected, unassigning...");
          this.currentlySelectedHero = -1;
          this.assetList[1].resetMenu();
          this.assetList[2].resetMenu();
          this.assetList[3].resetMenu();
          this.assetList[4].resetMenu();
          this.assetList[5].resetMenu();
          this.assetList[1].isVisible = false;
          this.assetList[1].isActive = false;
          this.assetList[2].isVisible = false;
          this.assetList[2].isActive = false;
          this.assetList[3].isVisible = false;
          this.assetList[3].isActive = false;
          this.assetList[4].isVisible = false;
          this.assetList[4].isActive = false;
          this.assetList[5].isVisible = false;
          this.assetList[5].isActive = false;
          this.currentlySelectedAction = "none";
          this.currentlySelectedSpecialOrItem = null;
          this.currentlySelectedTarget = null;
        }
        else if(i==1 && this.currentlySelectedAction != this.assetList[1].menuButtonList[j].label) {
          console.log("New or different action selected, assigning...");
          this.assetList[2].resetMenu();
          this.assetList[3].resetMenu();
          this.assetList[4].resetMenu();
          this.assetList[5].resetMenu();
          this.assetList[2].isActive = false;
          this.assetList[2].isVisible = false;
          this.assetList[3].isActive = false;
          this.assetList[3].isVisible = false;
          this.assetList[4].isActive = false;
          this.assetList[4].isVisible = false;
          this.assetList[5].isActive = false;
          this.assetList[5].isVisible = false;
          this.assetList[6].isActive = false;
          this.assetList[6].isVisible = false;
          this.currentlySelectedAction = this.assetList[1].menuButtonList[j].label;
          this.currentlySelectedTarget = null;
          this.currentlySelectedSpecialOrItem = null;
          let currentHero = this.surManager.heroManager.assetList[this.currentlySelectedHero];
          currentHero.currentlySelectedAction = this.assetList[1].menuButtonList[j].label;
          currentHero.isActionSelected = true;
          currentHero.isTargetSelected = false;
          currentHero.currentlySelectedTarget = null;
          currentHero.isSpecialOrItemSelected = false;
          currentHero.currentlySelectedSpecialOrItem = null;

          if(currentHero.currentlySelectedAction == "Attack" || currentHero.currentlySelectedAction == "Retreat") {
            //No specific item or move needs to be selected
            currentHero.isSpecialOrItemSelected = true;
            this.currentlySelectedSpecialOrItem = null;
            //Set a hidden target, if hero is to attempt a retreat
            if (currentHero.currentlySelectedAction == "Retreat") {
              currentHero.currentlySelectedTarget = {name: "RetreatTarget"};
              this.currentlySelectedTarget = currentHero.currentlySelectedTarget;
              currentHero.isTargetSelected = true;
            }
            if(currentHero.currentlySelectedAction == "Attack") {
              this.assetList[4].isVisible = true;
              this.assetList[4].isActive = true;
            }
          }
          else {
            this.assetList[1].isVisible = false;
            this.assetList[1].isActive = false;
            this.assetList[1].resetMenu();
            //Activate Special Move menu
            if(currentHero.currentlySelectedAction == "Special") {
              this.assetList[2].setOptions(currentHero.specialMoveList);
              this.assetList[2].isVisible = true;
              this.assetList[2].isActive = true;
            }
            //Activate Item Menu
            else if(currentHero.currentlySelectedAction == "Item") {
              this.assetList[3].checkRemainingItems(this.currentlySelectedHero);
              this.assetList[3].isVisible = true;
              this.assetList[3].isActive = true;
            }
          }
          if(this.areAllHerosReady()){
            this.assetList[6].isActive = true;
            this.assetList[6].isVisible = true;
          }
        }
        else if(i==1 && this.currentlySelectedAction == this.assetList[1].menuButtonList[j].label) {
          console.log("Same action selected, unassigning...");
          let currentHero = this.surManager.heroManager.assetList[this.currentlySelectedHero];
          this.currentlySelectedAction = "none";
          this.currentlySelectedTarget = null;
          this.currentlySelectedSpecialOrItem = null;
          currentHero.currentlySelectedAction = "none";
          currentHero.isActionSelected = false;
          currentHero.isSpecialOrItemSelected = false;
          currentHero.currentlySelectedSpecialOrItem = null;
          currentHero.currentlySelectedTarget = null;
          currentHero.isTargetSelected = false;
          this.assetList[4].isVisible = false;
          this.assetList[4].isActive = false;
          this.assetList[5].isVisible = false;
          this.assetList[5].isActive = false;
          this.assetList[6].isActive = false;
          this.assetList[6].isVisible = false;
          ///////
          this.assetList[1].resetMenu();
          ///////
          this.assetList[2].resetMenu();
          this.assetList[3].resetMenu();
          this.assetList[4].resetMenu();
          this.assetList[5].resetMenu();
        }
        else if(i==2 && this.surManager.heroManager.assetList[this.currentlySelectedHero].currentlySelectedSpecialOrItem != this.assetList[2].menuButtonList[j].target) {
          let currentHero = this.surManager.heroManager.assetList[this.currentlySelectedHero];
          if(j==0) {
            console.log("Back (special) button hit...");
            this.currentlySelectedAction = "none";
            this.currentlySelectedTarget = null;
            this.currentlySelectedSpecialOrItem = null;
            currentHero.isTargetSlected = false;
            currentHero.currentlySelectedTarget = null;
            currentHero.currentlySelectedAction = "none";
            currentHero.currentlySelectedSpecialOrItem = null;
            this.assetList[1].isVisible = true;
            this.assetList[1].isActive = true;
            this.assetList[2].isVisible = false;
            this.assetList[2].isActive = false;
            this.assetList[3].isActive = false;
            this.assetList[3].isVisible = false;
            this.assetList[4].isVisible = false;
            this.assetList[4].isActive = false;
            this.assetList[5].isVisible = false;
            this.assetList[5].isActive = false;
            this.assetList[6].isActive = false;
            this.assetList[6].isVisible = false;
            this.assetList[1].resetMenu();
            this.assetList[2].resetMenu();
            this.assetList[3].resetMenu();
            this.assetList[4].resetMenu();
            this.assetList[5].resetMenu();
          }
          else {
            console.log("New Special selected, assigning...");
            this.currentlySelectedSpecialOrItem = this.assetList[2].menuButtonList[j].target;
            currentHero.currentlySelectedSpecialOrItem = this.currentlySelectedSpecialOrItem;
            currentHero.isSpecialOrItemSelected = true;
            this.currentlySelectedTarget = null
            this.assetList[4].resetMenu();
            this.assetList[5].resetMenu();
            currentHero.currentlySelectedTarget = null;
            currentHero.isTargetSelected = false;
            this.assetList[4].isVisible = false;
            this.assetList[4].isActive = false;
            this.assetList[5].isVisible = false;
            this.assetList[5].isActive = false;
            this.assetList[6].isActive = false;
            this.assetList[6].isVisible = false;

            if(currentHero.currentlySelectedSpecialOrItem.isUsedOnOpponent) {
              this.assetList[4].isVisible = true;
              this.assetList[4].isActive = true;
            }
            else {
              this.assetList[5].isVisible = true;
              this.assetList[5].isActive = true;
            }
          }
        }
        else if (i==2 && this.surManager.heroManager.assetList[this.currentlySelectedHero].currentlySelectedSpecialOrItem == this.assetList[2].menuButtonList[j].target) {
          console.log("Same Special selected, unassigning...");
          let currentHero = this.surManager.heroManager.assetList[this.currentlySelectedHero];
          currentHero.isSpecialorItemSelected = false;
          currentHero.currentlySelectedSpecialOrItem = null;
          currentHero.currentlySelectedTarget = null;
          currentHero.isTargetSelected = false;
          this.currentlySelectedSpecialOrItem = null;
          this.currentlySelectedTarget = null;
          this.assetList[4].isVisible = false;
          this.assetList[4].isActive = false;
          this.assetList[5].isVisible = false;
          this.assetList[5].isActive = false;
          this.assetList[6].isActive = false;
          this.assetList[6].isVisible = false;
        }
        else if(i==3 && this.surManager.heroManager.assetList[this.currentlySelectedHero].currentlySelectedSpecialOrItem != this.assetList[3].menuButtonList[j].target) {
          let currentHero = this.surManager.heroManager.assetList[this.currentlySelectedHero];
          if(j==0) {
            console.log("Back (item) button hit...");
            this.currentlySelectedAction = "none";
            this.currentlySelectedTarget = null;
            this.currentlySelectedSpecialOrItem = null;
            currentHero.isTargetSelected = false;
            currentHero.currentlySelectedTarget = null;
            currentHero.currentlySelectedAction = "none";
            currentHero.currentlySelectedSpecialOrItem = null;
            this.assetList[1].isVisible = true;
            this.assetList[1].isActive = true;
            this.assetList[2].isVisible = false;
            this.assetList[2].isActive = false;
            this.assetList[3].isActive = false;
            this.assetList[3].isVisible = false;
            this.assetList[4].isVisible = false;
            this.assetList[4].isActive = false;
            this.assetList[5].isVisible = false;
            this.assetList[5].isActive = false;
            this.assetList[6].isActive = false;
            this.assetList[6].isVisible = false;
            this.assetList[1].resetMenu();
            this.assetList[2].resetMenu();
            this.assetList[3].resetMenu();
            this.assetList[4].resetMenu();
            this.assetList[5].resetMenu();
          }
          else {
            console.log("New Item selected, assigning...");
            this.currentlySelectedSpecialOrItem = this.assetList[3].menuButtonList[j].target;
            currentHero.currentlySelectedSpecialOrItem = this.currentlySelectedSpecialOrItem;
            currentHero.isSpecialOrItemSelected = true;
            this.currentlySelectedTarget = null
            currentHero.currentlySelectedTarget = null;
            currentHero.isTargetSelected = false;
            this.assetList[4].resetMenu();
            this.assetList[5].resetMenu();
            this.assetList[4].isVisible = false;
            this.assetList[4].isActive = false;
            this.assetList[5].isVisible = false;
            this.assetList[5].isActive = false;
            this.assetList[6].isActive = false;
            this.assetList[6].isVisible = false;
            if(currentHero.currentlySelectedSpecialOrItem.isUsedOnOpponent) {
              this.assetList[4].isVisible = true;
              this.assetList[4].isActive = true;
            }
            else {
              this.assetList[5].isVisible = true;
              this.assetList[5].isActive = true;
            }
          }
        }
        else if (i==3 && this.surManager.heroManager.assetList[this.currentlySelectedHero].currentlySelectedSpecialOrItem == this.assetList[3].menuButtonList[j].target) {
          console.log("Same Item selected, unassigning...");
          let currentHero = this.surManager.heroManager.assetList[this.currentlySelectedHero];
          currentHero.isSpecialorItemSelected = false;
          currentHero.currentlySelectedSpecialOrItem = null;
          currentHero.currentlySelectedTarget = null;
          currentHero.isTargetSelected = false;
          this.currentlySelectedSpecialOrItem = null;
          this.currentlySelectedTarget = null;
          this.assetList[4].isVisible = false;
          this.assetList[4].isActive = false;
          this.assetList[5].isVisible = false;
          this.assetList[5].isActive = false;
          this.assetList[6].isActive = false;
          this.assetList[6].isVisible = false;
          this.assetList[4].resetMenu();
          this.assetList[5].resetMenu();
        }
        else if(i==4 && this.currentlySelectedTarget != this.assetList[4].menuButtonList[j].target) {
          console.log("new monster target selected, assigning...");

          let currentHero = this.surManager.heroManager.assetList[this.currentlySelectedHero];
          currentHero.isTargetSelected = true;
          currentHero.currentlySelectedTarget = this.assetList[4].menuButtonList[j].target;
          this.currentlySelectedTarget = this.assetList[4].menuButtonList[j].target;
          if(this.areAllHerosReady()){
            this.assetList[6].isActive = true;
            this.assetList[6].isVisible = true;
          }
        }
        else if(i==4 && this.currentlySelectedTarget == this.assetList[4].menuButtonList[j].target) {
          console.log("same monster target selected, unassigning...");
          let currentHero = this.surManager.heroManager.assetList[this.currentlySelectedHero];
          currentHero.isTargetSelected = false;
          currentHero.currentlySelectedTarget = null;
          this.currentlySelectedTarget = null;
          this.assetList[6].isActive = false;
          this.assetList[6].isVisible = false;
        }
        else if(i==5 && this.currentlySelectedTarget != this.assetList[5].menuButtonList[j].target) {
          console.log("new hero target selected, assigning...");



          let currentHero = this.surManager.heroManager.assetList[this.currentlySelectedHero];
          currentHero.isTargetSelected = true;
          currentHero.currentlySelectedTarget = this.assetList[5].menuButtonList[j].target;
          this.currentlySelectedTarget = this.assetList[5].menuButtonList[j].target;
          if(this.areAllHerosReady()){
            this.assetList[6].isActive = true;
            this.assetList[6].isVisible = true;
          }
          if(this.currentlySelectedAction == "Item") {
            console.log("checkingApplicability of item");
            this.currentlySelectedSpecialOrItem.checkApplicability(this.currentlySelectedTarget);
          }
        }
        else if(i==5 && this.currentlySelectedTarget == this.assetList[5].menuButtonList[j].target) {
          console.log("same hero target selected, unassigning...");
          let currentHero = this.surManager.heroManager.assetList[this.currentlySelectedHero];
          currentHero.isTargetSelected = false;
          currentHero.currentlySelectedTarget = null;
          this.currentlySelectedTarget = null;
          this.assetList[6].isActive = false;
          this.assetList[6].isVisible = false;
        }
        else if(i==6) {
          console.log("all actions selected, starting combat...");
          this.assetList[0].isVisible = false;
          this.assetList[0].isActive = false;
          this.assetList[1].isVisible = false;
          this.assetList[1].isActive = false;
          this.assetList[2].isVisible = false;
          this.assetList[2].isActive = false;
          this.assetList[3].isVisible = false;
          this.assetList[3].isActive = false;
          this.assetList[4].isVisible = false;
          this.assetList[4].isActive = false;
          this.assetList[5].isVisible = false;
          this.assetList[5].isActive = false;
          this.assetList[6].isVisible = false;
          this.assetList[6].isActive = false;
          this.surManager.battleState = "combat";
          this.surManager.combat = new Combat(this.surManager);
        }
      } // end of if(this.assetList[i].menuButtonList[j].cursorHover)
    }// end of for(let j = 0 ; j< this.assetList[i].menuButtonList.length; j++)
  }// end of for(let i =0 ; i< this.assetList.length; i++)
}
BattleMenuManager.prototype.areAllHerosReady = function() {
  let test = true;
  let i = 0;
  for(i = 0 ; i < this.surManager.heroManager.assetList.length ; i++) {
    if(!this.surManager.heroManager.assetList[i].isTargetSelected && this.surManager.heroManager.assetList[i].isAlive) {
      test = false;
    }
  }
  return test;
}
BattleMenuManager.prototype.newRound = function() {
	let i = 0;
  for(i = 0 ; i< this.assetList.length; i++) {
    this.assetList[i].resetMenu();
    this.assetList[i].verifyApplicability();
  }
  this.assetList[0].isVisible = true;
  this.assetList[0].isActive = true;
  this.currentlySelectedHero = -1;
  this.currentlySelectedAction = "none";
  this.currentlySelectedItemOrSpecial = null;
  this.currentlySelectedTarget = null;
}

export {Battle}
