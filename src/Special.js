import {Stats, CombatStats, EquippedStats} from './Stats';
import {DamageDisplay, PoisonedDisplayIndicator, InitiativeDisplay} from './UI';
import {StatusEffect, Guarded, Blocked, Stunned} from './StatusEffect';

function SpecialMove() {
  this.name = "unnamedSpecialMove";
  this.role = "special";
  this.isUsedOnOpponent = true;
  this.specialOrItemStats = null;
  this.isUsedOnDead = false;
}
SpecialMove.prototype.loadStats = function() {
  this.specialOrItemStats = new Stats(this);
}
SpecialMove.prototype.useMove = function(owner, target) {
  console.log("performing specialMove, target: " + target + "\t name: " + this.name);
  target.remainingHP -= (owner.combatStats.strength-target.combatStats.toughness);
  target.damageDisplay = new DamageDisplay(owner.combatStats.strength-target.combatStats.toughness, target.battleSprite.position);
}


function PowerStrike() {
  SpecialMove.call(this);
  this.name = "Power Strike";
  this.loadStats();
}
PowerStrike.prototype = Object.create(SpecialMove.prototype);
PowerStrike.prototype.constructor = PowerStrike;

function WindSlash() {
  SpecialMove.call(this);
  this.name = "Wind Slash";
  this.loadStats();
}
WindSlash.prototype = Object.create(SpecialMove.prototype);
WindSlash.prototype.constructor = WindSlash;
function BlockOpponent() {
  SpecialMove.call(this);
  this.name = "Block Opponent";
  this.loadStats();
}
BlockOpponent.prototype = Object.create(SpecialMove.prototype);
BlockOpponent.prototype.constructor = BlockOpponent;
BlockOpponent.prototype.useMove = function(owner, target) {
  console.log(owner.name + " is blocking opponent " + target.name);
  target.statusEffectList.push(new Blocked(target, owner));
}

function GuardAlly() {
  SpecialMove.call(this);
  this.name = "Guard Ally";
  this.isUsedOnOpponent = false;
  this.loadStats();
}
GuardAlly.prototype = Object.create(SpecialMove.prototype);
GuardAlly.prototype.constructor = GuardAlly;
GuardAlly.prototype.useMove = function(owner, target) {
  console.log(owner.name + " is guarding ally " + target.name);
  target.statusEffectList.push(new Guarded(target, owner))
}

export {SpecialMove, PowerStrike, WindSlash, BlockOpponent, GuardAlly}
