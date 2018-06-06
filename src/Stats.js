
function Stats(owner) {
  this.owner = owner
  this.strength = 0;
  this.toughness = 0;
  this.vigor = 0;
  this.dexterity = 0;
  this.cunning = 0;
  this.spirit = 0;
  this.will = 0;
  this.speed = 0;
  this.load(owner.role);
}
Stats.prototype.empty = function() {
  this.strength = 0;
  this.toughness = 0;
  this.vigor = 0;
  this.dexterity = 0;
  this.cunning = 0;
  this.spirit = 0;
  this.will = 0;
  this.speed = 0;
}
Stats.prototype.combineStats = function(stats1, stats2) {
  this.strength = stats1.strength + stats2.strength;
  this.toughness = stats1.toughness + stats2.toughness;
  this.vigor = stats1.vigor + stats2.vigor;
  this.dexterity = stats1.dexterity + stats2.dexteriety;
  this.cunning = stats1.cunning + stats2.cunning;
  this.spirit = stats1.spirit + stats2.spirit;
  this.will = stats1.will + stats2.will;
  this.speed = stats1.speed + stats2.speed;
}
Stats.prototype.load = function(role) {
  switch(role) {
    case "fighter":
      this.strength = 8;
      this.toughness = 3;
      this.vigor = 4;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 4;
      break;
    case "knight":
      this.strength = 5;
      this.toughness = 4;
      this.vigor = 5;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 3;
      break;
    case "monster":
      this.loadMonster(this.owner.name);
      break;
    case "equipment":
      this.loadEquipment(this.owner.name);
      break;
    case "special":
      this.loadSpecial(this.owner.name);
      break;
    case "item":
      this.strength = 0;
      this.toughness = 0;
      this.vigor = 0;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 5;
      break;
    default:
      console.log("error, could not load stats for role: " + role);
      break;
  }
}
Stats.prototype.loadMonster = function(monster) {
  switch(monster) {
    case "Wolf":
      this.strength = 8;
      this.toughness = 3;
      this.vigor = 2;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 5;
  }
}
Stats.loadEquipment = function(name) {
  switch(name) {
      case "Iron Sword":
        this.strength = 2;
        this.toughness = 0;
        this.vigor = 0;
        this.dexterity = 0;
        this.cunning = 0;
        this.spirit = 0;
        this.will = 0;
        this.speed = 0;
      break;
    case "Steel Sword":
        this.strength = 4;
        this.toughness = 0;
        this.vigor = 0;
        this.dexterity = 0;
        this.cunning = 0;
        this.spirit = 0;
        this.will = 0;
        this.speed = 0;
      break;
    default:
      console.log("loadEquipment error, invalid name");
      break;
  }
}
Stats.prototype.loadSpecial = function(name) {
  switch(name) {
    case "Power Strike":
      this.strength = 3;
      this.toughness = 0;
      this.vigor = 0;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 0;
      break;
    case "Wind Slash":
      this.strength = 1;
      this.toughness = 0;
      this.vigor = 0;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 3;
      break;
    case "Guard Ally":
      this.strength = 0;
      this.toughness = 2;
      this.vigor = 0;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 5;
      break;
    case "Block Opponent":
      this.strength = 0;
      this.toughness = 2;
      this.vigor = 0;
      this.dexterity = 0;
      this.cunning = 0;
      this.spirit = 0;
      this.will = 0;
      this.speed = 5;
      break;
    default:
      console.log("loadPower error, invalid name");
      break;
  }
}

function CombatStats(owner) {
  Stats.call(this, owner);
  this.empty();
}
CombatStats.prototype = Object.create(Stats.prototype);
CombatStats.prototype.constructor = CombatStats;

function EquippedStats(owner) {
  Stats.call(this, owner);
  this.empty();
}
EquippedStats.prototype = Object.create(Stats.prototype);
EquippedStats.prototype.constructor = EquippedStats;

export {Stats, CombatStats, EquippedStats}
