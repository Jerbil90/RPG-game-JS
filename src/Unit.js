import {Stats, CombatStats, EquippedStats} from './Stats';
import {SpecialMove, PowerStrike, WindSlash, BlockOpponent, GuardAlly} from './Special';
import {Sprite, InitiativeSprite, BattleSprite, PoisonEffectSprite, StunnedEffectSprite} from './Sprite';
import {DamageDisplay, PoisonedDisplayIndicator, InitiativeDisplay} from './UI';
import {StatusEffect, Guarded, Blocked, Poisoned, Stunned} from './StatusEffect';
import {AftermathScreen, ExperienceBar} from './AftermathScreen';

//This is the constructor function for the Unit class, this class is the parent for each unit (hero/monster) and contains the parent properties and methods required by each Unit such as load, draw, update
function Unit(name){

  this.currentXP = 0;
  this.currentLV = 1;
  this.experienceBar = null;

  this.maxHP = 0;
  this.isAlive = true;
  this.remainingHP = this.maxHP;
  this.baseStats = null;
  this.equippedStats = null;
  this.equipment = [];
  this.combatStats = null;
  this.specialStats = null;
  this.combatStance = new CombatStance();
  this.statusEffectList = [];
  this.name = name;
  this.role = "unassigned";
  this.specialMoveList = [];
  this.isInParty = true;
  this.partyPosition = -1;
  this.applicableTarget = true;

  this.isActionSelected = false;
  this.isSpecialOrItemSelected = false;
  this.currentlySelectedAction = "none";
  this.currentylSelectedSpecialOrItem = null;
  this.isTargetSelected = false;
  this.currentlySelectedTarget = null;
  this.isActionConfirmed = false;

  this.damageDisplay = null;
  this.initiativeSprite = null;
  this.battleSprite = null;
}
Unit.prototype.setCurrentScreen = function(screen) {
  this.screen = screen;
}
Unit.prototype.isAfflictedWith = function(statusName) {
  for(let i = 0 ; i < this.statusEffectList.length ; i ++) {
    if(this.statusEffectList[i].name === statusName) {
      return true;
    }
  }
  return false;
}
Unit.prototype.calculateCombatStats = function() {
  this.combatStats.empty();
  this.equippedStats.empty();
  let i = 0;
  for(i = 0 ; i < this.equipment.length ; i++) {
    this.equippedStats.combineStats(this.equippedStats, this.equipment[i].stats);
  }
  this.combatStats.combineStats(this.baseStats, this.equippedStats);
  if((this.currentlySelectedAction == "Special" || this.currentlySelectedAction == "Item") && this.currentlySelectedSpecialOrItem != null){
    let specialStats = this.currentlySelectedSpecialOrItem.specialOrItemStats;
    this.combatStats.combineStats(this.baseStats, this.equippedStats);
    this.combatStats.combineStats(this.combatStats, specialStats);
  }

}
Unit.prototype.combatReset = function() {
  this.isActionSelected = false;
  this.currentlySelectedAction = "none";
  this.isTargetSelected = false;
  this.currentlySelectedSpecialOrItem = null;
  this.currentlySelectedTarget = null;
  this.isActionConfirmed = false;
}
//This method sets the units max hp at the start of battle based on vigor and vigor bonuses
Unit.prototype.setMaxHP = function() {
  this.maxHP = 5 * this.baseStats.vigor;
  this.remainingHP = this.maxHP;
}
//This method is called after the unit heals to ensure th remaining HP does not exceed thier maximum hp;
Unit.prototype.capHP = function() {
  if(this.remainingHP>this.maxHP) {
    this.remainingHP=this.maxHP;
  }
}
//This method is called when a unit performs a basic attack on another unit
Unit.prototype.attack = function(target){
  console.log(this.role + " " + this.name + " attacks " + target.name + " with " + this.combatStats.strength +" strength!");
  let damage = this.combatStats.strength-target.combatStats.toughness;
  if(damage<1) {
    damage = 1;
  }
  target.remainingHP -= (damage);
  target.damageDisplay = new DamageDisplay(damage, target.battleSprite.position);
  target.deathCheck();
  console.log("Net damage: " + (damage) + "\nremainingHP: " + target.remainingHP);
  if(!target.isAlive){
    console.log(target.role + " " + target.name + " has been slain!");
  }
}
//This method is responsible for checking remainingHP and updating the isAlive boolean propertiy appropriately
Unit.prototype.deathCheck = function() {
  if(this.remainingHP<=0) {
    this.isAlive = false;
    this.applicableTarget = false;
    //this.initiativeSprite = null;
  }
  else {
    this.isAlive = true;
  }
}
Unit.prototype.moveApplicabilityCheck = function() {
	let i = 0;
  for(i = 0 ; i < this.specialMoveList.length ; i++) {
    this.specialMoveList[i].applicableTarget = true;
  }
}
Unit.prototype.update = function(gameTime, elapsedTime) {
  if(this.healthBar != null) {
    this.healthBar.update(gameTime, elapsedTime);
  }

  this.combatStance.update(gameTime, elapsedTime);
  this.calculateCombatStats();
  this.deathCheck();
  if(this.damageDisplay != null) {
    this.damageDisplay.update(gameTime, elapsedTime);
    if(this.damageDisplay.isExpired) {
      this.damageDisplay = null;
    }
  }
  if(this.experienceBar != null) {
    this.experienceBar.update(gameTime, elapsedTime);
  }

  for(let  i = 0 ; i < this.statusEffectList.length ; i++) {
    this.statusEffectList[i].update(gameTime, elapsedTime);
  }
}
//This is the units main draw function
Unit.prototype.draw = function(ctx) {
  if(this.isAlive) {
    if(this.battleSprite != null) {
      this.battleSprite.draw(ctx);
    }
    if(this.initiativeSprite != null) {
      this.initiativeSprite.draw(ctx);
    }
    if(this.healthBar != null) {
      this.healthBar.draw(ctx);
    }

  }
  else if(this.role != "monster") {
    if(this.battleSprite != null) {
      this.battleSprite.draw(ctx);
    }
    if(this.healthBar != null) {
      this.healthBar.draw(ctx);
    }

  }
  if(this.damageDisplay != null) {
    this.damageDisplay.draw(ctx);
  }
  if(this.experienceBar != null) {
    this.experienceBar.draw(ctx);
  }
  for(let  i = 0 ; i < this.statusEffectList.length ; i++) {
    this.statusEffectList[i].draw(ctx);
  }
}
Unit.prototype.load = function() {
  this.loadStats();
  this.setMaxHP();
  this.healthBar = new HealthBar(this);
  this.loadBattleSprite();
}
Unit.prototype.setPartyPosition = function (i) {
  this.partyPosition = i;
}
Unit.prototype.loadStats = function() {
  this.baseStats = new Stats(this);
  this.equippedStats = new EquippedStats(this);
  this.combatStats = new CombatStats(this);
}
Unit.prototype.loadBattleSprite = function() {
  this.battleSprite = new BattleSprite(this);
  this.experienceBar = null;
  this.healthBar = new HealthBar(this);
  this.setMaxHP();
}
Unit.prototype.endBattle = function() {
  this.initiativeSprite = null;
  this.battleSprite = null;
  this.healthBar = null;
  this.remainingHP = this.maxHP;
  this.statusEffectList = [];
  this.experienceBar = new ExperienceBar(this);

}


//This is the constructor function for the Hero class, this class is responsible for describing the User's playable characters
function Hero(name, role){
  Unit.call(this, name);
  this.role = role;
  this.isInParty = true;
}
Hero.prototype = Object.create(Unit.prototype);
Hero.prototype.constructor = Hero;
Hero.prototype.levelUp = function() {
  this.currentLV++;
  this.currentXP = 0;
  this.baseStats = new Stats(this);

}

//This is the constructor function for the Fighter class, this class is responsible for describing the Hero's of the role fighter
//Fighters are balanced heros, strong attacks make them useful damage dealers and they possess moderate defensive abilities
function Fighter(name){
  Hero.call(this, name, "fighter");
  this.load();
  this.specialMoveList.push(new PowerStrike());
  this.specialMoveList.push(new WindSlash());
  this.moveApplicabilityCheck();
}
Fighter.prototype = Object.create(Hero.prototype);
Fighter.prototype.constructor = Fighter;

function Knight(name){
  Hero.call(this, name, "knight");
  this.load();
  this.specialMoveList.push(new GuardAlly());
  this.specialMoveList.push(new BlockOpponent());
  this.moveApplicabilityCheck();
}
Knight.prototype = Object.create(Hero.prototype);
Knight.prototype.constructor = Knight;

//This is the constructor function for the Monster class, this class is responsible for describing the enemy monsters that the player will encounter throughout the game
function Monster(name) {
  Unit.call(this, name);
  this.role = "monster";
  this.load();
}
Monster.prototype = Object.create(Unit.prototype);
Monster.prototype.constructor = Monster;

//This is the constructor for the wolf class, this class is responsible for describing an enemy wolf that may be encountered
function Wolf(){
  Monster.call(this, "Wolf");
  this.baseStats = new Stats(this);
  this.currentXP = 4;
  this.currentLV = 1;
}
Wolf.prototype = Object.create(Monster.prototype);
Wolf.prototype.constructor = Wolf;

function Snake() {
  Monster.call(this, "Snake");
  this.baseStats = new Stats(this);
  this.currentXP = 4;
  this.currentLV = 1;
}
Snake.prototype = Object.create(Monster.prototype);
Snake.prototype.contructor = Snake;
Snake.prototype.attack = function(target) {
  Unit.prototype.attack.call(this, target);
  if(Math.random()>0) {
    target.statusEffectList.push(new Poisoned(target));
    console.log(target.name + " is now poisoned!");
  }
}

function Highwayman() {
  Monster.call(this, "Highwayman");
  this.baseStats = new Stats(this);
  this.currentXP = 12;
  this.currentLV = 3;
}
Highwayman.prototype = Object.create(Monster.prototype);
Highwayman.prototype.costructor = Highwayman;

function MrSnips() {
  Monster.call(this, "Mr Snips");
  this.baseStats = new Stats(this);
  this.currentLV = 5;
  this.currentXP = 24;
}
MrSnips.prototype = Object.create(Monster.prototype);
MrSnips.prototype.constructor = MrSnips;
MrSnips.prototype.attack = function(target) {
  Unit.prototype.attack.call(this, target);
  if(Math.random()>0) {
    target.statusEffectList.push(new Stunned(target));
    console.log(target.name + " is now stunned!");
  }
}

function ZombieSailor() {
  Monster.call(this, "Zombie Sailor");
  this.baseStats = new Stats(this);
  this.currentLV = 4;
  this.currentXP = 16;
}
ZombieSailor.prototype = Object.create(Monster.prototype);
ZombieSailor.prototype.constructor = ZombieSailor;

function ZombiePirate() {
  Monster.call(this, "Zombie Pirate");
  this.baseStats = new Stats(this);
  this.currentLV = 7;
  this.currentXP = 36;
}
ZombiePirate.prototype = Object.create(Monster.prototype);
ZombiePirate.prototype.constructor = ZombiePirate;

function Equipment(name) {
  this.name = name;
  this.role = "equipment";
  this.load();
}
Equipment.prototype.load = function() {
  switch(this.name){
    case "Iron Sword":
      this.type = "sword";
      this.stats = new Stats(this);
      break;
    default:
      console.log("equipment load error, invalid name");
      break;
  }
}

function HealthBar(owner) {
  this.owner = owner;
  this.maxHP = owner.maxHP;
  this.remainingHP = owner.remainingHP;
  this.length = 40;
  this.height = 10;
  this.borderWidth = 4;
  this.potentialDamageLength = 0;
  this.remainingHPLength = this.legnth;
  this.position = {x: 0, y:0};
  this.isPotentiallyFullySlain = false;
  this.isPotentiallyFullyHealed = false;
}
HealthBar.prototype.calculateRemainingHPLength = function() {
  this.remainingHPLength = (this.remainingHP / this.maxHP) * this.length;
  if(this.remainingHPLength < 0) {
    this.remainingHPLength = 0;
  }
}
HealthBar.prototype.calculatePotentialDamage = function() {
  var owner = this.owner;
  var heroList = owner.screen.heroManager.assetList;
  var potentialDamage = 0;
  this.isPotentiallyFullySlain = false;
  this.isPotentiallyFullyHealed = false;
  for(let i = 0 ; i < heroList.length ; i++) {
    if(heroList[i].currentlySelectedTarget == owner) {
      switch(heroList[i].currentlySelectedAction) {
        case "Attack":
          potentialDamage += heroList[i].combatStats.strength - owner.combatStats.toughness;
          break;
        case "Special":
        case "Item":
          if(heroList[i].currentlySelectedSpecialOrItem.isUsedOnOpponent) {
            potentialDamage += heroList[i].combatStats.strength-owner.combatStats.toughness;
          }
          else {
            if(heroList[i].currentlySelectedSpecialOrItem.healingPower != null) {
              potentialDamage -= heroList[i].currentlySelectedSpecialOrItem.healingPower;
            }
          }
          break;
        default:
          console.log("calculatePotentialDamage error, hero with unknown action detected");
          break;
      }
    }
  }
  if(potentialDamage>=this.remainingHP) {
    this.potentialDamageLength = this.remainingHPLength;
    this.isPotentiallyFullySlain = true;
  }
  else if(this.remainingHP-potentialDamage>=this.maxHP && potentialDamage!=0){
    this.potentialDamageLength = -1*(this.length - this.remainingHPLength);
    this.isPotentiallyFullyHealed = true;
  }
  else {
    this.potentialDamageLength = (potentialDamage/this.maxHP) * this.length;
  }
}
HealthBar.prototype.update = function(gameTime, elapsedTime) {
  this.position = {x: this.owner.battleSprite.position.x, y: this.owner.battleSprite.position.y-this.height - 2*this.borderWidth};
  this.maxHP = this.owner.maxHP;
  this.remainingHP = this.owner.remainingHP;
  this.calculateRemainingHPLength();
  if(this.owner.screen != null) {
    if(this.owner.screen.state != null) {
      if(this.owner.screen.state == "waiting for input") {
        this.calculatePotentialDamage();
      }
      else {
        this.potentialDamageLength = 0;
      }
    }
  }

}
HealthBar.prototype.draw = function(ctx) {
  //first draw the background rect
  if(this.isPotentiallyFullyHealed) {
    ctx.fillStyle = "rgb(100, 200, 50)";
  }
  else if (this.isPotentiallyFullySlain) {
    ctx.fillStyle = "rgb(200, 50, 50)";
  }
  else {
    ctx.fillStyle = "rgb(139, 69, 19)";
  }

  ctx.fillRect(this.position.x, this.position.y, this.length + 2 * this.borderWidth, this.height + 2 * this.borderWidth);
  //then draw the empty HP bar
  ctx.fillStyle = "rgb(2164, 8, 8)";
  ctx.fillRect(this.position.x + this.borderWidth, this.position.y + this.borderWidth, this.length, this.height);
  //next draw the remaining hp
  ctx.fillStyle = "rgb(0, 200, 50)";
  ctx.fillRect(this.position.x + this.borderWidth, this.position.y + this.borderWidth, this.remainingHPLength, this.height);
  //ctx.fillRect(500, 400, 20, 20);
  //finally draw the indicated potential damage
  ctx.fillStyle = "rgb(244, 250, 0)";
  ctx.fillRect(this.position.x + this.borderWidth + this.remainingHPLength - this.potentialDamageLength, this.position.y+ this.borderWidth, this.potentialDamageLength, this.height);
  //ctx.fillRect(this.position.x + this.borderWidth + this.remainingHPLength - this.potentialDamageLength, this.position.y + this.borderLength, this.potentialDamageLength, this.height);
}

function CombatStance() {
  this.currentStance = "passive";
  this.stanceStartTime = 0;
  this.isCurrentTurn = false;
}
CombatStance.prototype.update = function(gameTime, elapsedTime) {
  if(!this.isCurrentTurn) {

  }
  else {
    switch(this.currentStance) {
      case "passive":
        this.currentStance = "targeting";
        this.stanceStartTime = gameTime;
        break;
      case "targeting":

        if(gameTime > this.stanceStartTime+500) {
          this.currentStance = "attacking";
          this.stanceStartTime = gameTime;
        }
        break;
      case "attacking":
        if(gameTime > this.stanceStartTime+500) {
          this.currentStance = "passive";
          this.isCurrentTurn = false;
          this.stanceStartTime = gameTime;
        }
        break;
      default:
        console.log("battleStance error");
        break;
    }
  }
}

export {Unit, Hero, Monster, Fighter, Knight, Wolf, Snake, Highwayman, ZombieSailor, MrSnips, ZombiePirate, HealthBar, Equipment}
