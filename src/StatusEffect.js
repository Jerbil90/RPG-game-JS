import {Sprite, InitiativeSprite, BattleSprite, PoisonEffectSprite, StunnedEffectSprite} from './Sprite'

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
StatusEffect.prototype.isThisLongestDurationEffect = function() {
  var testResult = true;
  for(let i = this.owner.statusEffectList.length - 1 ; i >= 0 ; i--) {
    if (this.owner.statusEffectList[i].name == this.name && this.owner.statusEffectList[i] != this) {
      if(this.owner.statusEffectList[i].duration == this.duration) {
        this.owner.statusEffectList.splice(i, 1);
        console.log("similar status discovered, removing...");
      }
      else if (this.owner.statusEffectList[i].duration > this.duration) {
        testResult = false;
        this.duration = 0;
      }
      else if(this.owner.statusEffectList[i].duration < this.duration) {
        console.log("shorter duration statuseffect detected, removing");
        this.owner.statusEffectList.splice(i, 1);
      }
    }
  }
  return testResult;
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
  if(this.isThisLongestDurationEffect()) {
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
  else {
    console.log("largerduration discovered");
  }
}
Poisoned.prototype.spawnPoisonEffectSprite = function() {
  this.statusEffectSprites.push(new PoisonEffectSprite(this.owner.battleSprite.position));
}

function Stunned(owner) {
  StatusEffect.call(this, owner);
  this.name = "Stunned";
  this.duration = 1;
  this.effectStrength = 1;
  this.effectSpriteSpawnTime = null;
}
Stunned.prototype = Object.create(StatusEffect.prototype);
Stunned.prototype.constructor = Stunned;
Stunned.prototype.update = function(gameTime, elapsedTime) {
  StatusEffect.prototype.update.call(this, gameTime, elapsedTime);
  if(this.effectSpriteSpawnTime == null) {
    this.effectSpriteSpawnTime = gameTime;
    this.spawnStunnedEffectSprites(this.owner.battleSprite.position);
  }
  else {

  }
}
Stunned.prototype.spawnStunnedEffectSprites = function(position) {
  this.statusEffectSprites.push(new StunnedEffectSprite(position));
}

export {StatusEffect, Guarded, Blocked, Poisoned, Stunned}
