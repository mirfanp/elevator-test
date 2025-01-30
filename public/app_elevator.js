class Elevator{
  constructor(id){
    this.id = id;
    this.currentFloor = 0;
    this.targetFloor = 0;
    this.animationId = null;
    this.pickupFloor = null;
    this.isIdle = true;
  }

  moveToFloor(targetFloor, callback){
    this.targetFloor = targetFloor;
    this.isIdle = false;
    this.animate(callback);
  }

  animate(callback){
    let velocity = 0.2;

    if (Math.abs(this.currentFloor - this.targetFloor) < 5)
      velocity = 0.1;

    // Update the current floor based on the target floor
    if(this.currentFloor < this.targetFloor){
      this.currentFloor += velocity;
      if (this.currentFloor > this.targetFloor)
        this.currentFloor = this.targetFloor;
    } else if(this.currentFloor > this.targetFloor){
      this.currentFloor -= velocity;
      if (this.currentFloor < this.targetFloor)
        this.currentFloor = this.targetFloor;
    }

    drawElevators();

    // Stop animation if the elevator has reached the target floor
    if(this.currentFloor === this.targetFloor){
      cancelAnimationFrame(this.animationId);
      this.pickupFloor = null;
      this.isIdle = true;
      if(typeof callback === 'function'){
        callback();
      }
    } else {
      this.animationId = requestAnimationFrame(() => this.animate(callback));
    }
  }
}

class ElevatorWorker{
  constructor(totalElevators, totalFloors, passengerQueue){
    const elevators = [];
    for(let i = 0; i < totalElevators; i++){
      let elevator = new Elevator(i);
      elevators.push(elevator);
    }
    this.elevators = elevators;
    this.totalFloors = totalFloors;
    this.passengerQueue = passengerQueue;
    this.startTime = new Date();
    this.finishTime = null;
    this.deliveredCount = 0;
  }

  updateDeliveredCount(count){
    if (count !== undefined && count > 0) {
      this.deliveredCount += count;
    }
    document.getElementById("startTime").innerHTML = this.startTime.toLocaleString();
    
    // Finish time is set when all elevators are idle
    if (this.finishTime) {
      document.getElementById("finishTime").innerHTML = this.finishTime.toLocaleString();
      document.getElementById("gapTime").innerHTML = getDateTimeSince(this.startTime);
    }
  
    document.getElementById("counter").innerHTML = this.deliveredCount;
  }

  assignElevator(elevator, passenger){
    elevator.pickupFloor = passenger.from;
    
    // Move to the passenger's pickup floor
    elevator.moveToFloor(passenger.from - 1, () => {
      setTimeout(() => {
        // Move to the passenger's destination floor
        elevator.moveToFloor(passenger.to - 1, () => {
          setTimeout(() => {
            this.processQueue(elevator);
            this.updateDeliveredCount(1);
          }, 2000);
        })
      }, 2000)
    });
  }

  isAllElevatorsIdle() {
    let isAllIdle = true;
    this.elevators.forEach(elevator => {
        if (!elevator.isIdle) {
            isAllIdle = false;
        }
    });
    return isAllIdle;
  }

  processQueue(elevator){
    if(this.passengerQueue.length > 0){
      const nextPassenger = this.passengerQueue.shift();
      elevator.pickupFloor = nextPassenger.from;
      this.assignElevator(elevator, nextPassenger);
    } else {
      // Move the elevator back to the ground floor when the queue is empty
      elevator.moveToFloor(0, () => {
        if (this.isAllElevatorsIdle()){
          this.finishTime = new Date();
          this.updateDeliveredCount(0);
        }
      });
    }
  }

  startElevators(){
    this.elevators.forEach(elevator => this.processQueue(elevator));
  }
}

function drawElevators() {
  const floorHeight = 14;
  const elevatorGap = 15;
  const elevatorWidth = 10;
  const elevatorHeight = 13;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < elevatorWorker.totalFloors; i++) {
    const thisFloor = i + 1;
    const yPosition = canvas.height - thisFloor * floorHeight;
    ctx.fillStyle = 'black';
    ctx.fillText(`Floor ${i+1}`, 10, yPosition + 12);
    
    // Check if this floor is waiting for an elevator
    elevatorWorker.elevators.forEach(elevator => {
        if (elevator.pickupFloor === thisFloor) {
            ctx.fillStyle = 'red';
            ctx.fillText("Waiting", 120, yPosition + 10);
        }
    });
    
    ctx.beginPath();
    ctx.moveTo(0, yPosition);
    ctx.lineTo(canvas.width, yPosition);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(110, yPosition);
    ctx.lineTo(110, yPosition+canvas.height);
    ctx.stroke();
  }
  
  elevatorWorker.elevators.forEach((elevator, idx) => {
    const xPos = 55 + (idx * elevatorGap);
    const yPos = canvas.height - (elevator.currentFloor + 1) * floorHeight + (floorHeight - elevatorHeight);
    ctx.fillStyle = 'red';
    ctx.fillRect(xPos, yPos, elevatorWidth, elevatorHeight);
  });
}

const canvas = document.getElementById('elevatorCanvas');
const ctx = canvas.getContext('2d');
const totalFloors = 50;
const totalElevators = 3;
const elevatorWorker = new ElevatorWorker(totalElevators, totalFloors, mans);

elevatorWorker.updateDeliveredCount(0);
elevatorWorker.startElevators();