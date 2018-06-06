import {Stats, CombatStats, EquippedStats} from './Stats';

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
Item.prototype.checkApplicability = function(heroList, currentHero) {

}

function BattleItem() {
  Item.call(this);
  this.name = "unnamedBattleItem";
  this.isBattleItem = true;
  this.isUsedOnDead = false;
  this.role = "item";
  console.log("loading stats for item " + this.name);
  this.specialOrItemStats = new Stats(this);
}
BattleItem.prototype = Object.create(Item.prototype);
BattleItem.prototype.constructor = BattleItem;
BattleItem.prototype.effect = function(target){

}
BattleItem.prototype.checkApplicability = function(heroList, currentHero) {
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

export {Item, BattleItem, MinorHealthPotion}
