import {Stats, CombatStats, EquippedStats} from './Stats';
import {DamageDisplay, InitiativeDisplay} from './UI';

function Item() {
  this.isBattleItem = false;
  this.applicableTarget = false;
  this.name = "unnamedItem";
  this.quantity = 0;
  this.isUsedOnOpponent = false;
}
Item.prototype.consume = function() {
  this.quantity -= 1;
}
Item.prototype.checkAvailability = function(heroList, currentHero) {

}

function BattleItem() {
  Item.call(this);
  this.name = "unnamedBattleItem";
  this.isBattleItem = true;
  this.isUsedOnDead = false;
  this.isBeingUsedPreemptively = false;
  this.role = "item";
  console.log("loading stats for item " + this.name);
  this.specialOrItemStats = new Stats(this);
}
BattleItem.prototype = Object.create(Item.prototype);
BattleItem.prototype.constructor = BattleItem;
BattleItem.prototype.effect = function(target){

}
//This method checks to see if the item is availableFF
BattleItem.prototype.checkAvailability = function(heroList, currentHero) {
  this.applicableTarget = true;
  if(this.quantity <= 0) {
    this.applicableTarget = false;
  }
  else {
    let toBeUsedThisTurn = 0;
	let i = 0;
    for(i = 0 ; i < heroList.length; i++) {
      if(heroList[i].currentlySelectedSpecialOrItem != null) {
        if(heroList[i].currentlySelectedSpecialOrItem.name == this.name) {
          toBeUsedThisTurn++;
        }
      }
    }
    if(heroList[currentHero].currentlySelectedSpecialOrItem != null) {
      if(heroList[currentHero].currentlySelectedSpecialOrItem.name == this.name) {
        toBeUsedThisTurn--;
      }
    }
    if(this.quantity == toBeUsedThisTurn) {
      this.applicableTarget = false;
    }
  }
}
BattleItem.prototype.checkApplicability = function(target) {
  if(target != null){
    if(!this.isUsedOnOppoent) {
      console.log("checking current target");
      this.targetCheck(target);
    }
    else {
      console.log("Item used on opponent applicability check irrelevant");
    }
  }
  else {
    console.log("no target detected for item applicability check");
  }
}
BattleItem.prototype.targetCheck = function(target) {

}

function MinorHealthPotion() {
  BattleItem.call(this);
  this.name = "Minor Health Potion";
  this.healingPower = 10;
}
MinorHealthPotion.prototype = Object.create(BattleItem.prototype);
MinorHealthPotion.prototype.constructor = MinorHealthPotion;
MinorHealthPotion.prototype.effect = function(target) {
  target.remainingHP += this.healingPower;
  target.damageDisplay = new DamageDisplay(-1*this.healingPower, target.battleSprite.position);
  target.capHP();
  this.consume();
  console.log(target.name + " healed 10 points by health potion");
}
MinorHealthPotion.prototype.targetCheck = function(target) {
  if(target.remainingHP == target.maxHP) {
    this.isBeingUsedPreemptively = true;
    this.role = "preemptiveItem";
    this.specialOrItemStats = new Stats(this);
    console.log("no damamge on targe detected, peremptiveItem Stats set");
  }
  else {
    this.isBeingUsedPreemptively = false;
    this.role = "item";
    this.specialOrItemStats = new Stats(this);
    console.log("damage on target detected, item stats set");
  }
}

function Antidote() {
  BattleItem.call(this);
  this.name = "Antidote";
  this.isUsedPreemptively = true;
  this.role = "preemptiveItem";
  this.specialOrItemStats = new Stats(this);
}
Antidote.prototype = Object.create(BattleItem.prototype);
Antidote.prototype.constructor = Antidote;
Antidote.prototype.effect = function(target) {
  if(target.isAfflictedWith("Poisoned")) {
    for(let i = target.statusEffectList.length - 1 ; i >= 0 ; i--){
      if(target.statusEffectList[i].name == "Poisoned") {
        target.statusEffectList.splice(i, 1);
        console.log(target.name + " has been cured of a poison status effect!");
      }
    }
  }
}
Antidote.prototype.targetCheck = function(target){
  if(target.isAfflictedWith("Poisoned")) {
    this.isBeingUsedPreemptively = false;
    this.role = "item";
    this.specialOrItemStats = new Stats(this);
    console.log("poison detected on target, new item stats")
  }
  else {
    this.isBeingUsedPreemptively = true;
    this.role = "preemptiveItem";
    this.specialOrItemStats = new Stats(this);
    console.log("poison not detected on target, premetiveItemStats set");
  }
}


export {Item, BattleItem, MinorHealthPotion, Antidote};
