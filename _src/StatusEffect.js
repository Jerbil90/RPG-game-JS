

function StatusEffect(owner) {
  this.owner = owner;
  this.name = "unnamed status effect";
  this.effectStrength = 0;
  this.duration = 0;

}
StatusEffect.prototype.applyEffect = function() {

}

function Guarded(owner, guardian) {
  StatusEffect.call(this, owner);
  this.name = "Guarded";
  this.duration = 1;
  this.effectStrength = 1;
  this.guardian = guardian;
}
Guarded.prototype = Object.create(StatusEffect.prototype);
Guarded.prototype.constructor = Guarded;

function Blocked(owner, blocker) {
  StatusEffect.call(this, owner);
  this.name = "Blocked";
  this.duration = 1;
  this.effectStrength = 1;
  this.blocker = blocker;
}
Blocked.prototype = Object.create(StatusEffect.prototype);
Blocked.prototype.constructor = Blocked;

function Poisoned(owner) {
  StatusEffect.call(this, owner);
  this.name = "Poisoned";
  this.duration = 5;
  this.effectStrength = 1;
}

export {StatusEffect, Guarded, Blocked, Poisoned}
