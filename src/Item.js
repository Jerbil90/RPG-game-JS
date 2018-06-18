import {Stats, CombatStats, EquippedStats} from './Stats';
import {DamageDisplay, PoisonedDisplayIndicator, InitiativeDisplay} from './UI';

function Item() {
  this.isBattleItem = false;
  this.isEquipment = false;
  this.applicableTarget = false;
  this.name = "unnamedItem";
  this.quantity = 0;
  this.isUsedOnOpponent = false;
}
Item.prototype.acquire = function() {
  this.quantity += 1;
}
Item.prototype.consume = function() {
  this.quantity -= 1;
}
Item.prototype.checkAvailability = function(heroList, currentHero) {

}

function Equipment(name) {
  Item.call(this);
  this.isEquipment = true;
  this.name = name;
  this.role = "equipment";
  this.type = "untyped";
  this.applicableTarget = true;
  this.load();
}
Equipment.prototype = Object.create(Item.prototype);
Equipment.prototype.constructor = Equipment;
//This method sets the equipment type and instigates the stats, whch are both based on the name property
Equipment.prototype.load = function() {
  switch(this.name){
    case "none":
    this.type = "emptyEquipment";
    this.stats = new Stats(this);
    break;
    case "Iron Sword":
      this.type = "sword";
      this.stats = new Stats(this);
      break;
      case "Steel Sword":
      this.type = "sword";
      this.stats = new Stats(this);
      break;
    default:
      console.log("equipment load error, invalid name");
      break;
  }
}
function BattleItem() {
  Item.call(this);
  this.name = "unnamedBattleItem";
  this.isBattleItem = true;
  this.isUsedOnDead = false;
  this.isBeingUsedPreemptively = false;
  this.role = "item";
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
      this.targetCheck(target);
    }
    else {
    }
  }
  else {
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
  }
  else {
    this.isBeingUsedPreemptively = false;
    this.role = "item";
    this.specialOrItemStats = new Stats(this);
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
  }
  else {
    this.isBeingUsedPreemptively = true;
    this.role = "preemptiveItem";
    this.specialOrItemStats = new Stats(this);
  }
}


export {Item, BattleItem, MinorHealthPotion, Antidote, Equipment};
