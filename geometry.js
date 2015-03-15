var state = 0;

/*
  This function defines the objects to be animated and the different states
*/
function animateGeometry() {
  console.log("Running animateGeometry.");

  var cross = document.getElementById("cross");
  var circle = document.getElementById("circle");
  var triangle = document.getElementById("triangle");
  var square = document.getElementById("square");  

  var button = document.getElementById("animateButton");

  button.disabled = true;

  var states = [[], []];

  var state1 = [];
  var state2 = [];
  var state3 = [];
  var state4 = [];

  states[0] = state1;
  states[1] = state2;
  states[2] = state3;
  states[3] = state4;

  state1[0] = new State(cross, new Coordinate(42,60));
  state1[1] = new State(circle, new Coordinate(52,40));
  state1[2] = new State(triangle, new Coordinate(42,20));
  state1[3] = new State(square, new Coordinate(32,40));

  state2[0] = new State(cross, new Coordinate(62,40));
  state2[1] = new State(circle, new Coordinate(42,10));
  state2[2] = new State(triangle, new Coordinate(22,40));
  state2[3] = new State(square, new Coordinate(42,70));

  state3[0] = new State(cross, new Coordinate(22,10));
  state3[1] = new State(circle, new Coordinate(22,70));
  state3[2] = new State(triangle, new Coordinate(62,70));
  state3[3] = new State(square, new Coordinate(62,10));

  state4[0] = new State(cross, new Coordinate(42,70));
  state4[1] = new State(circle, new Coordinate(62,40));
  state4[2] = new State(triangle, new Coordinate(42,10));
  state4[3] = new State(square, new Coordinate(22,40));

  state++;
  state = state % states.length;

  animation(1500, 20, sCurveTemporalDelta, ortogonalSpatialDelta, circleSpatialMagnitude, states[state], Unit.PERCENT, callback);

  function callback(){
    button.disabled = false;
    console.log("Completed animateGeometry.");
  }
}





/*
  This is the code handling the animations 
*/

// A State is an element and its target coordinates
function State(element, coordinates){
  this.elem = element;
  this.coords = coordinates;
}

// Enum defining the unit of measurement
var Unit = {
  PIXELS: 1,
  PERCENT: 2
}

// An x,y pair
function Coordinate(xVal,yVal){
  this.x=xVal;
  this.y=yVal;
}

Coordinate.prototype.toString = function(){
  return "("+this.x+", "+this.y+")";
}

// Subtract coord from this Coordinate
Coordinate.prototype.sub = function(coord){
  var self = this;
  return new Coordinate(self.x - coord.x, self.y - coord.y);
}

// Add coord to this Coordinate
Coordinate.prototype.add = function(coord){
  var self = this;
  return new Coordinate(self.x + coord.x, self.y + coord.y);
}

// Multiply this Coordinate with a scalar
Coordinate.prototype.mult = function(scalar){
  var self = this;
  return new Coordinate(self.x * scalar, self.y * scalar);
}

// A vector from one Coordinate to another
function Vector(startCoord, endCoord){
  this.start = startCoord;
  this.end = endCoord;
}

Vector.prototype.toString = function(){
  var self = this;
  return "["+self.start.toString()+", "+self.end.toString()+"]"; 
}

// The length of this vector
Vector.prototype.distance = function(){
  var deltaX = this.start.x-this.end.x;
  var deltaY = this.start.y-this.end.y;
  return Math.sqrt(Math.pow(deltaX, 2)+Math.pow(deltaY, 2));
}

Vector.prototype.zero = function(){
  return new Vector(new Coordinate(0,0), new Coordinate(0,0));
}

// Subtract vector from this Vector
Vector.prototype.sub = function(vector){
  var self = this;
  return new Vector(self.start.sub(vector.start), self.end.sub(vector.end));
}

// Add vector to this Vector
Vector.prototype.add = function(vector){
  var self = this;
  return new Vector(self.start.add(vector.start), self.end.add(vector.end));
}

// Multiply a scalar with this Vector
Vector.prototype.mult = function(scalar){
  var self = this;
    
  var origoShifted = self.origoShift();
  var scaled = new Vector(origoShifted.start.mult(scalar), origoShifted.end.mult(scalar));

  return new Vector(self.start, scaled.end.add(self.start)); 
}

// Shifts this Vector so that it begins in origo
Vector.prototype.origoShift = function(){
  var self = this;
  return new Vector(new Coordinate(0,0), self.end.sub(self.start));
}

// Returns the unit vector with the same rotation as this vector
Vector.prototype.unit = function(){
  var self = this;

  if(self.distance()==0)
    return 

  var origoShift = self.origoShift();
  var scaled = origoShift.mult(1/origoShift.distance());

  return scaled;
}

// Returns a unit vector rotated by alpha radians from this Vector
Vector.prototype.rotate = function(alpha){
  var self = this;
   
  if(self.distance()==0)  // Cannot rotate the zero vector
    return self.zero();

  var unit = self.unit();
  var x = unit.end.x;
  var y = unit.end.y;
  var gamma;
  
  // Determine the angle of this vector (gamma)
  if(x==0){ // Vector is on the y-axis
    if(y>0)
      gamma = Math.PI/2;
    else
      gamma = 3*Math.PI/2;
  }

  else if(y==0){ // Vector is on the x-axis
    if(x>0)    
      gamma = 0;
    else
      gamma = Math.PI;
  }

  else { // Vector is in one of the quadrants
    if(y>0){
      if(x>0) // First quadrant
        gamma = Math.atan(y/x);
      else // Second quadrant
        gamma = Math.atan(-x/y)+Math.PI/2;
    }
    else {
      if(x<0) // Third quadrant
        gamma = Math.atan(-y/-x)+Math.PI;
      else // Fourth quadrant
        gamma = Math.atan(x/-y)+3*Math.PI/2;
    }
  }

  // The new angle
  var beta = gamma + alpha;

  //console.log("Alpha: "+alpha/Math.PI);
  //console.log("Gamma: "+gamma/Math.PI);
  //console.log("Beta: "+beta/Math.PI);

  var newX = Math.cos(beta);
  var newY = Math.sin(beta);

  var rotated = new Vector(new Coordinate(0,0), new Coordinate(newX,newY));

  //console.log("Unit: "+unit.toString());
  //console.log("Rotated: "+rotated.toString());

  return rotated;
}

/*
  Main animation procedure

  duration: total duration of the animation in ms
  step: the interval between updates in ms
  temporalDelta: a function defined on the domain [0,1] with f(0)=0 and f(1)=1, 
    defines the motion of the animation
  spatialDelta: a function f(vector, progress) where progress is in the interval [0,1] and
    and vector is the transport vector of the animation. Returns an offset unit vector.
  spatialMagnitude: a function defined on the domain [0,1], which determines the magnitude of 
    the spatialDelta vector. Together they form an offset vector which is added to the linear
    transport vector.
  states: an array of State objects, defining the target positions of the animation
  unit: an integer defining the unit of coordinates, see Unit
  callback: call this function when finished
*/
function animation(duration, step, temporalDelta, spatialDelta, spatialMagnitude, states, unit, callback){
  var startTime = new Date;
  var id = setInterval(timer, step)

  var start = [];
  for(i = 0; i<states.length; i++){
    start[i] = getRelativeCoords(states[i].elem);
  }

  
  function timer(){
    var timePassed = new Date - startTime;
    var progress = timePassed/duration;

    if(progress>1)
      progress = 1;

    for(i = 0; i<states.length; i++){
      //console.log(typeof(states[i].elem.id));
      move(states[i].elem, start[i], states[i].coords, temporalDelta(progress), spatialDelta, spatialMagnitude, unit);    
    }

    if(progress==1){
      clearInterval(id);
      callback();
    }
  }

}

/*
  Procedure that moves elements based on the progress

  elem: the element to move
  start: original Coordinate of the element
  target: target Coordinate of the element
  progress: a float in the interval [0,1], defining the (intended) progress of the animation 
    (this need not increase linearly)
  spatialDelta: a function f(vector, progress) where progress is in the interval [0,1] and
    and vector is the transport vector of the animation. Returns an offset unit vector.
  spatialMagnitude: a function defined on the domain [0,1], which determines the magnitude of 
    the spatialDelta vector. Together they form an offset vector which is added to the linear
    transport vector.
  unit: an integer defining the unit of coordinates, see Unit  
*/
function move(elem, start, target, progress, spatialDelta, spatialMagnitude, unit){

  var unitString;
  
  switch(unit){

  case Unit.PERCENT:
    unitString = "%";
    break;
    
  case Unit.PIXEL:
    unitString = "px";
    break;

  default:
    unitString = "%";

  }
  
  //console.log("Element: "+elem.id);
  //console.log("Start: "+start.toString());
  //console.log("Target: "+target.toString());
  var vector = new Vector(start, target);
  //console.log("Vector: "+vector.toString());
  var scaled = vector.mult(progress);
  //console.log("Progress: "+progress)
  //console.log("Scaled: "+scaled.toString());

  var magnitude = spatialMagnitude(progress);
  //console.log("Magnitude: "+magnitude);
  var offset = spatialDelta(scaled, progress).mult(magnitude);
  //console.log("Offset: "+offset.toString());
  var result = scaled.add(offset);
  //console.log("Result: "+result.toString());

  elem.style.left = result.end.x+unitString;
  elem.style.top = result.end.y+unitString;
}

/*
  Get the Coordinate of an element relative to its parent
  
  elem: the element of interest
  unit: an integer defining the unit of coordinates, see Unit  
*/
function getRelativeCoords(elem, unit){

  var parentRect = elem.offsetParent.getBoundingClientRect();
  var elemRect = elem.getBoundingClientRect();
  
  var parentWidth = parentRect.right-parentRect.left;
  var parentHeight = parentRect.bottom-parentRect.top;

  var coord = new Coordinate();
  coord.x = Math.round(100*(elemRect.left-parentRect.left)/parentWidth);
  coord.y = Math.round(100*(elemRect.top-parentRect.top)/parentHeight);

  return coord;
}

/*
  Some example temporal deltas that can be used
*/
function linearTemporalDelta(progress){
  return progress;
}

function quadraticTemporalDelta(progress){
  return progress*progress;
}

function sinusoidalTemporalDelta(progress){
  return Math.sin(Math.PI*progress/2); 
}

function sCurveTemporalDelta(progress){
  return 0.5*Math.cos(progress*Math.PI+Math.PI)+0.5;
}

/*
  Some spatial deltas
*/
function rotateSpatialDelta(vector, progress){
  return vector.rotate(4*Math.PI*progress);
}

function ortogonalSpatialDelta(vector, progress){
  return vector.rotate(Math.PI/2);
}

/*
  Spatial delta magnitudes
*/
function circleSpatialMagnitude(progress){
  var magnitude = 5*Math.sin(progress*Math.PI);
  if(magnitude < 0.01)
    magnitude = 0;
  return magnitude;
}

function sinusoidalSpatialMagnitude(progress){
  var magnitude = 5*Math.sin(progress*6*Math.PI);
  if(magnitude < 0.01)
    magnitude = 0;
  return magnitude;
}
