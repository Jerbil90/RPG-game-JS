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
  if(this.image != null) {
    ctx.drawImage(this.image, this.position.x, this.position.y);
  }
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
    this.image.src = require('../assets/myMonsterSymbol.png');
    this.loadMonsterSprite();
    break;
    case "knight":
    this.image = new Image();
    this.image.src = require('../assets/myKnightSymbol.png');
    break;
    case "fighter":
    this.image = new Image();
    this.image.src = require('../assets/myFighterSymbol.png');
    break;
    default:
    console.log("error loading battle sprites: " + this.name + " has invalid role: " + this.role);
    break;
  }
}
Sprite.prototype.loadMonsterSprite = function() {
  switch(this.owner.name) {
    case "Wolf":
    this.image.src = require('../assets/myWolfSymbol.png');
    break;
    case "Snake":
    this.image.src = require('../assets/mySnakeSymbol.png');
    break;
    case "Mr Snips":
    this.image.src = require('../assets/myMisterSnipsSymbol.png');
    break;
    case "Highwayman":
    this.image.src = require('../assets/myHighwaymanSymbol.png');
    break;
    case "Zombie Sailor":
    this.image.src = require('../assets/myZombieSailorSymbol.png');
    break;
    case "Zombie Pirate":
    this.image.src = require('../assets/myZombiePirateSymbol.png');
    break;
    default:
    console.log("error in loadMonsterSprite, invalid name");
    break;
  }
}
Sprite.prototype.setOwner = function(owner) {
  this.owner = owner;
}
Sprite.prototype.loadEffectSprite = function(name, position) {
  this.image = new Image();
  position
  var imgsrc = "";
  switch(name) {
    case "Poisoned":
    imgsrc = '../assets/myPoisonEffectSymbol.png';
    break;
    case "Stunned":
    imgsrc = '../assets/myStunnedEffectSymbol.png';
    console.log("stunned image loaded");
    break;
  }
  this.image.src = imgsrc;
  console.log(this.image);
  this.setPosition(position.x, position.y);
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
  //this.setPassivePosition();
}
BattleSprite.prototype = Object.create(Sprite.prototype);
BattleSprite.prototype.constructor = BattleSprite;
BattleSprite.prototype.setPassivePosition = function() {
  if(this.owner.role == "monster") {
    console.log(this.owner.name + " has had their sprite set!");
    this.position = {x:450, y:100 + this.owner.partyPosition*50};
  }
  else{
    this.position = {x:150, y:100 + this.owner.partyPosition*50};
  }
}

function EffectSprite(position) {
  Sprite.call(this);
  this.effectStartTime = null;
  console.log("effectSprite");
  this.setPosition(position.x, position.y);
}
EffectSprite.prototype = Object.create(Sprite.prototype);
EffectSprite.prototype.constructor = EffectSprite;

function PoisonEffectSprite(position) {
  EffectSprite.call(this, position);
  this.expirationTime = 500;
  this.hasExpired = false;
}
PoisonEffectSprite.prototype = Object.create(EffectSprite.prototype);
PoisonEffectSprite.prototype.constructor = PoisonEffectSprite;
PoisonEffectSprite.prototype.update = function(gameTime, elapsedTime) {
  if(this.effectStartTime == null) {
    this.loadEffectSprite("Poisoned", this.position);
    this.effectStartTime = gameTime;
    let origin = {x: this.position.x, y: this.position.y};
    origin.x += (-5 + Math.floor(Math.random()*42));
    this.setPosition(origin.x, origin.y);
    this.moveTo(origin.x , origin.y - 50, 1000);
  }
  else {
    EffectSprite.prototype.update.call(this, gameTime, elapsedTime);
    if(gameTime > this.effectStartTime + this.expirationTime) {
      this.hasExpired = true;
    }
  }
}

function StunnedEffectSprite(position) {
  EffectSprite.call(this, position);
  this.centre = {x: position.x + 16, y: position.y};
  this.partList = [];
  for(let i = 0 ; i < 3 ; i++) {
    this.partList.push(new StunnedEffectSpritePart(this.centre, i));
  }
}
StunnedEffectSprite.prototype = Object.create(EffectSprite.prototype);
StunnedEffectSprite.prototype.constructor = StunnedEffectSprite;
StunnedEffectSprite.prototype.update = function(gameTime, elapsedTime) {
  for(let i = 0 ; i < this.partList.length ; i++) {
    this.partList[i].update(gameTime, elapsedTime);
  }
}
StunnedEffectSprite.prototype.draw = function(ctx) {
  for(let i = 0 ; i < this.partList.length ; i++) {
    this.partList[i].draw(ctx);
    ctx.drawImage(this.partList[0].image, this.centre.x, this.centre.y);
  }
}

function StunnedEffectSpritePart(centre, i) {
  Sprite.call(this);
  this.centre = centre;
  this.radiusx = 10;
  this.radiusy = 5;
  this.period = 3000;
  this.effectStartTime = null;
  this.index = i;
  this.loadEffectSprite("Stunned", this.position);
  console.log(this.image);
}
StunnedEffectSpritePart.prototype = Object.create(Sprite.prototype);
StunnedEffectSpritePart.prototype.constructor = StunnedEffectSpritePart
StunnedEffectSpritePart.prototype.update = function(gameTime, elapsedTime) {
  if(this.effectStartTime == null) {
    this.effectStartTime = gameTime;
    this.effectStartTime -= (this.period/3) * this.index;
  }
  else {
    Sprite.prototype.update.call(this, gameTime, elapsedTime);
    this.setPosition(this.radiusx * Math.cos(2*Math.PI*(gameTime-this.effectStartTime)/this.period), this.radiusy * Math.sin(2*Math.PI*(gameTime-this.effectStartTime)/this.period));
  }
}
StunnedEffectSprite.prototype.draw = function(ctx) {
  console.log(this.image);
  ctx.drawImage(this.image, this.position.x, this.position.y);
}

export {Sprite, InitiativeSprite, BattleSprite, PoisonEffectSprite, StunnedEffectSprite}
