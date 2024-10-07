/**
 *     ____            _____ _                  
 *    |  _ \          |  __ (_)                
 *    | |_) | _____  _| |__) | _ __   ___  ___ 
 *    |  _ < / _ \ \/ /  ___/ | '_ \ / _ \/ __|
 *    | |_) | (_) >  <| |   | | |_) |  __/\__ \
 *    |____/ \___/_/\_\_|   |_| .__/ \___||___/  by Alon Dattner
 *                            | |              
 *                            |_|              
 *
 *    Inspired by "3D Pipes" screensaver for Windows
 **/

// You can adjust the colors to your preference
let boxColors = ["#f94144", "#f3722c", "#f8961e", "#f9844a", "#f9c74f", "#90be6d", "#43aa8b", "#4d908e", "#577590", "#277da1"];

// DON'T CHANGE THESE!
let blockSize = 50;
let gridWidth = 1000;
let gridHeight = 500;
let pipes = [];
let stars = [];

/**
 *  Setup scene
 */
function setup() {
  
  // General settings
  createCanvas(1280, 720, WEBGL);
  angleMode(DEGREES);
  frameRate(20);
  
  // Add pipe
  pipes.push(new Pipe());
  
  // Add stars
  for(let i = 0; i<100; i++) {
    stars.push(new Star());
  }
}

/**
 *  Draw scene
 */
function draw() {
  
  // Set background, camera and lighting
  background(0);
  camera(gridWidth/6,-gridHeight/4,gridWidth*2.25);
  ambientLight(150,150,150);
  directionalLight(255,255,255,-0.5,0.5,-0.5);
  
  // Draw stars
  for(let i = stars.length-1; i>=0; i--) {
    stars[i].render();
    stars[i].update();
  }
  
  // Draw pipes
  for(let i = pipes.length-1; i >= 0; i--) {
    pipes[i].render();
    pipes[i].update();
  }
}

/**
 *  Block Class
 */
class Block {
  constructor(position, blockColor) {
    this.position = createVector(position.x, position.y, position.z);
    this.blockColor = blockColor;
  }
  
  /**
   *  Renders the block
   */
  render() {    
    push();
    strokeWeight(5);
    fill(this.blockColor);
    translate(this.position.x,this.position.y,this.position.z);
    box(blockSize);
    pop();
  }
  
  /**
   *  Returns the position
   */
  getPosition() {
    return this.position.copy();
  }
}

/**
 *  Star Class
 */
class Star {
  constructor() {
    this.position = createVector(random(-gridWidth*4, gridWidth*4), random(-gridHeight*4, gridHeight*4), -gridWidth*1.5);
    this.size = random(3,10);
  }
  
  /**
   *  Updates the star
   */
  update() {
    
    // Updates position based on mouse position
    this.position.add(createVector(this.size*(mouseX-1280/2)*0.001, this.size*(mouseY-720/2)*0.001,0));
    
    // Updates position if star leaves screen
    if(this.position.x > gridWidth*4 || this.position.x < -gridWidth*4) this.position.x = -this.position.x;
    if(this.position.y > gridHeight*4 || this.position.y < -gridHeight*4) this.position.y = -this.position.y;
  }
  
  /**
   *  Renders the star
   */
  render() {
    push();
    noStroke();
    fill("white");
    translate(this.position.x, this.position.y, this.position.z);
    sphere(this.size);
    pop();
  }
}

/**
 *  Pipe Class
 */
class Pipe {
  constructor() {
    
    // Array will contain all blocks of pipe
    this.blocks = [];
    
    // Find random possible starting position
    do {
      this.position = createVector(
      this.getRandomStartCoordinate(-gridWidth, gridWidth),
      this.getRandomStartCoordinate(-gridHeight, gridHeight),
      this.getRandomStartCoordinate(-gridWidth, gridWidth));
    } while(!this.isPossibleNewPosition(this.position))
    
    // Find random possible starting velocity (moving direction)
    let possibleVelocities = [
      createVector(50,0,0),
      createVector(0,50,0),
      createVector(0,0,50),
      createVector(-50,0,0),
      createVector(0,-50,0),
      createVector(0,0,-50)
    ];
    this.velocity = random(possibleVelocities);
    
    // Set random starting section length
    this.sectionLength = floor(random(5,20));
    
    // Set random color
    let boxColorIndex = floor(random(boxColors.length));
    this.boxColor = boxColors[boxColorIndex];   
    // Remove color from possible box colors so there are no pipes with same color at the same time
    boxColors.splice(boxColorIndex, 1);

    // Add first block
    let newBlock = new Block(this.position.copy(), this.boxColor)
    this.blocks.push(newBlock);
  }
  
  /**
   *  Updates the pipe
   */
  update() {   
        
    // Remove pipe if delete = true
    if(this.delete) {    
      
      // Remove blocks while deleting
      if(this.blocks.length>0) {
          this.blocks.splice(0,1);      
      }   
      
      // Remove pipe when fully deleted
      else {
        
        // Add color back to possible box colors
        boxColors.push(this.boxColor);
        
        // Remove pipe completely
        pipes.splice(0,1);
      }
      return;
    }
    
    // Set delete = true when pipe reached max length
    if(!this.delete && this.blocks.length >= 200) {
      this.delete = true;
    }
    
    // Calculate new position
    let calculatedNewPosition = this.position.copy().add(this.velocity);
    
    // Check if new position is possible
    if(!this.isPossibleNewPosition(calculatedNewPosition)) {

      // All possible velocities
      let possibleVelocities = [
        createVector(50,0,0),
        createVector(0,50,0),
        createVector(0,0,50),
        createVector(-50,0,0),
        createVector(0,-50,0),
        createVector(0,0,-50)
      ];
      
      // Loop through each possible velocity
      for(let i = possibleVelocities.length-1; i >= 0; i--) {
        
        // Calculate new position with possible velocity
        calculatedNewPosition = this.position.copy().add(possibleVelocities[i]);   
        
        // Remove velocity from possible velocities if new position is not possible
        if(!this.isPossibleNewPosition(calculatedNewPosition) || 
           possibleVelocities[i].equals(this.velocity.copy().mult(-1))) {
          possibleVelocities.splice(i, 1);
        }
      }
      
      // Set new random velocity from possible velocities
      this.velocity = random(possibleVelocities);
      
      // Set delete = true and return if there is no possible velocity
      if(!this.velocity) {
        this.delete = true;
        return;
      }
    }
    
    // Add velocity to position and create new block
    this.position.add(this.velocity);  
    let newBlock = new Block(this.position, this.boxColor);
    this.blocks.push(newBlock);
    
    // Reduce sectionLength
    this.sectionLength--;
    
    // Create new pipe if pipe length is 100
    if(this.blocks.length == 100) {
      pipes.push(new Pipe());
    }
  }
  
  /**
   *  Renders the pipe
   */
  render() {
    
    // Render all blocks of pipe
    for(let block of this.blocks) {
      block.render();
    }
  }
  
  /**
   *  Returns wether a new position is possible
   */
  isPossibleNewPosition(newPosition) {
    
    // Return false if section length is reached
    if(this.sectionLength <= 0) {
      this.sectionLength = floor(random(5,20));
      return false;
    }
    
    // Return false if grid limits are reached 
    if(newPosition.x > gridWidth || 
       newPosition.x < -gridWidth || 
       newPosition.y > gridHeight || 
       newPosition.y < -gridHeight || 
       newPosition.z > gridWidth || 
       newPosition.z < -gridWidth) {
      return false;
    }
    
    // Return false if pipe collides with a block
    for(let pipe of pipes) {
      for(let block of pipe.getAllBlocks()) {
        let blockPosition = block.getPosition();
        if(newPosition.x == blockPosition.x && newPosition.y == blockPosition.y && newPosition.z == blockPosition.z) return false;
      }
    }
    
    return true;
  }
  
  /**
   *  Returns all blocks
   */
  getAllBlocks() {
    return this.blocks;
  }
  
  /**
   *  Returns a random start coordinate inside the min and max (considering the grid and block size)
   *  
   *  Disclamer:
   *  ChatGPT was used to "generate a function to find a random number between two numbers which can be divided by 50"
   *  I then customized the function to fit my needs (considering the grid and block size)
   */
  getRandomStartCoordinate(min, max) {
    min = Math.ceil(min / blockSize) * blockSize;
    max = Math.floor(max / blockSize) * blockSize;
    return Math.floor(random((max - min) / blockSize + 1)) * blockSize + min;
  }
}

/**
 *  Pauses loop (for debugging only)
 */
/*function mousePressed() {
  if(isLooping()) {
    noLoop();
  }
  else loop();
}*/