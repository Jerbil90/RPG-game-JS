function Sprite() {
  this.image = null;
  this.position = {x:0, y:0};
  this.startingPosition = null;
  this.targetPosition = null;
  this.moveStartTime = null;
  this.moveDuration = 0;
  this.isMoving = false;
  this.isNewMove = false;
}
Sprite.prototype.update = function(gameTime, elapsedTime) {
  if(this.isNewMove) {
    this.isNewMove = false;
    this.moveStartTime = gameTime;
  }
  if(this.isMoving) {
    if(gameTime > this.moveStartTime + this.moveDuration) {
      this.isMoving = false;
      this.position = this.targetPosition;
    }
    else {
      let fraction = ((gameTime - this.moveStartTime) / this.moveDuration);
      this.position.x = this.startingPosition.x + fraction * (this.targetPosition.x - this.startingPosition.x);
      this.position.y = this.startingPosition.y + fraction * (this.targetPosition.y - this.startingPosition.y);
    }
  }
}
Sprite.prototype.draw = function(ctx) {
  ctx.drawImage(this.image, this.position.x, this.position.y);
}
Sprite.prototype.setPosition = function(x, y) {
  this.position.x = x;
  this.position.y = y;
}
Sprite.prototype.moveTo = function(x, y, duration) {
  this.startingPosition = this.position;
  this.targetPosition = {x: x, y: y};
  this.moveDuration = duration;
  this.isMoving = true;
  this.isNewMove = true;
}
Sprite.prototype.loadBattleSprite = function() {
    switch(this.owner.role) {
    case "monster":
    this.image = new Image();
    this.image.src = '../assets/myMonsterSymbol.png';
    this.loadMonsterSprite();
    break;
    case "knight":
    this.image = new Image();
    this.image.src = '../assets/myKnightSymbol.png';
    break;
    case "fighter":
    this.image = new Image();
    this.image.src = '../assets/myFighterSymbol.png';
    break;
    default:
    console.log("error loading battle sprites: " + this.name + " has invalid role: " + this.role);
    break;
  }
}
Sprite.prototype.loadMonsterSprite = function() {
  switch(this.owner.name) {
    case "Wolf":
    this.image.src = '../assets/myWolfSymbol.png';
    break;
    case "Snake":
    this.image.src = '../assets/mySnakeSymbol.png';
    break;
    case "Mr Snips":
    this.image.src = '../assets/myMisterSnipsSymbol.png';
    break;
    case "Highwayman":
    this.image.src = '../assets/myHighwaymanSymbol.png';
    break;
    case "Zombie Sailor":
    this.image.src = '../assets/myZombieSailorSymbol.png';
    break;
    case "Zombie Pirate":
    this.image.src = '../assets/myZombiePirateSymbol.png';
    break;
    default:
    console.log("error in loadMonsterSprite, invalid name");
    break;
  }
}
Sprite.prototype.loadEffectSprite = function() {

}
Sprite.prototype.setOwner = function(owner) {
  this.owner = owner;
}

function InitiativeSprite(owner) {
  Sprite.call(this);
  this.owner = owner;
  this.image = owner.battleSprite.image;
}
InitiativeSprite.prototype = Object.create(Sprite.prototype);
InitiativeSprite.prototype.constructor = InitiativeSprite;

function BattleSprite(owner) {
  Sprite.call(this);
  this.owner = owner;
  this.loadBattleSprite();
  this.setPassivePosition();
}
BattleSprite.prototype = Object.create(Sprite.prototype);
BattleSprite.prototype.constructor = BattleSprite;
BattleSprite.prototype.setPassivePosition = function() {
  if(this.owner.role == "monster") {
    this.position = {x:450, y:100 + this.owner.partyPosition*50};
  }
  else{
    this.position = {x:150, y:100 + this.owner.partyPosition*50};
  }
}

function EffectSprite() {
  Sprite.call(this);
  this.lifeTime = 500;
  this.spawnTime = null;
  this.hasExpired = false;
}
EffectSprite.prototype = Object.create(Sprite.prototype);
EffectSprite.prototype.constructor = EffectSprite;
EffectSprite.prototype.update = function(gameTime, elapsedTime) {
  Sprite.prototype.update.call(this, gameTime, elapsedTime);
  if(this.spawnTime == null) {
    this.spawnTime = gameTime;
  }
  else {
    if(gameTime > this.spawnTime + this.lifeTime) {
      this.hasExpired = true;
    }
  }
}

function PoisonEffectSprite(origin) {
  EffectSprite.call(this);
  this.loadEffectSprite();
  this.position = {x: origin.x-10 + Math.floor(Math.random() * 50), y: origin.y + 30 + Math.floor(Math.random() * 15)};
  //this.moveTo(this.position.x-5 + Math.floor(Math.random*10), this.position.y - (95 + Math.floor(Math.random() * 10)), 3000);
this.moveTo(this.position.x, this.position.y-50, 500);
}
PoisonEffectSprite.prototype = Object.create(EffectSprite.prototype);
PoisonEffectSprite.prototype.constructor = PoisonEffectSprite;
PoisonEffectSprite.prototype.update = function(gameTime, elapsedTime) {
  EffectSprite.prototype.update.call(this, gameTime, elapsedTime);
}
PoisonEffectSprite.prototype.loadEffectSprite = function() {
  this.image = new Image();
  this.image.src = '../assets/myPoisonEffectSymbol.png'
}

function StunnedEffectSprite(position) {
  EffectSprite.call(this);
  this.setUpSpriteArray(position);
}
StunnedEffectSprite.prototype = Object.create(EffectSprite.prototype);
StunnedEffectSprite.prototype.constructor = StunnedEffectSprite;
StunnedEffectSprite.prototype.setUpSpriteArray = function(centre) {
  this.spriteArray = [];
  for(let i = 0 ; i < 3 ; i++) {
    this.spriteArray.push(new StunnedEffectPart(i, centre))
  }
}
StunnedEffectSprite.prototype.draw = function(ctx) {
  for(let i = 0 ; i < this.spriteArray.length ; i++) {
    this.spriteArray[i].draw(ctx);
  }
}
StunnedEffectSprite.prototype.update = function(gameTime, elapsedTime) {
  for(let i = 0 ; i < this.spriteArray.length ; i++) {
    this.spriteArray[i].update(gameTime, elapsedTime);
  }
}

function StunnedEffectPart(index, centre) {
  Sprite.call(this);
  this.loadEffectSprite();
  this.centre = centre;
  this.xRadius = 15;
  this.yRadius = 5;
  this.animationStartTime = null;
  this.animationPeriod = 1500;
  this.index = index;
}
StunnedEffectPart.prototype = Object.create(Sprite.prototype);
StunnedEffectPart.prototype.constructor = StunnedEffectPart;
StunnedEffectPart.prototype.update = function(gameTime, elapsedTime) {
  if(this.animationStartTime == null) {
    this.animationStartTime = gameTime;
    this.animationStartTime -= this.index*(this.animationPeriod/3);
  }
  else {
    this.setPosition(this.centre.x + this.xRadius * Math.cos(2*Math.PI * (gameTime - this.animationStartTime)/this.animationPeriod), this.centre.y+ this.yRadius * Math.sin(2*Math.PI * (gameTime - this.animationStartTime)/this.animationPeriod));
  }
}
StunnedEffectPart.prototype.loadEffectSprite = function() {
  this.image = new Image();
  this.image.src = '../assets/myStunnedEffectSymbol.png'
}

export {Sprite, InitiativeSprite, BattleSprite, PoisonEffectSprite, StunnedEffectSprite}
