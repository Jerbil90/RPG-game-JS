import {Sprite, InitiativeSprite, BattleSprite, PoisonEffectSprite} from './Sprite'

function StatusEffect(owner) {
  this.owner = owner;
  this.name = "unnamed status effect";
  this.effectStrength = 0;
  this.duration = 0;
  this.statusEffectSprites = [];

}
StatusEffect.prototype.applyEffect = function() {

}
StatusEffect.prototype.update = function(gameTime, elapsedTime) {
  for(let i = 0 ; i < this.statusEffectSprites.length ; i++) {
    this.statusEffectSprites[i].update(gameTime, elapsedTime);
  }
}
StatusEffect.prototype.draw = function(ctx) {
  for(let i = 0 ; i < this.statusEffectSprites.length ; i++) {
    this.statusEffectSprites[i].draw(ctx);
  }
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
  this.latestEffectSpawnTime = null;
  this.spawnInterval = 500;
}
Poisoned.prototype = Object.create(StatusEffect.prototype);
Poisoned.prototype.constructor = Poisoned;
Poisoned.prototype.update = function(gameTime, elapsedTime) {
  StatusEffect.prototype.update.call(this, gameTime, elapsedTime);
  for(let i = this.statusEffectSprites.length - 1; i >= 0 ; i--) {
    if(this.statusEffectSprites[i].hasExpired) {
      this.statusEffectSprites.splice(i, 1);
    }
  }
  if(this.latestEffectSpawnTime == null) {
    this.latestEffectSpawnTime = gameTime;
    this.spawnPoisonEffectSprite();
  }
  else if(gameTime > this.latestEffectSpawnTime + this.spawnInterval) {
    this.latestEffectSpawnTime = gameTime;
    this.spawnPoisonEffectSprite();
  }
}
Poisoned.prototype.spawnPoisonEffectSprite = function() {
  this.statusEffectSprites.push(new PoisonEffectSprite(this.owner.battleSprite.position));
}

export {StatusEffect, Guarded, Blocked, Poisoned}
