// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:5173", // Your React app URL
//     methods: ["GET", "POST"]
//   }
// });

// app.use(cors());
// app.use(express.json());

// // Mock robot controller - replace with actual robot API calls
// class RobotController {
//   constructor() {
//     this.isMoving = false;
//     this.currentPosition = { x: 0, y: 0.9, z: 0 };
//   }

//   async moveToPosition(targetPos, phase) {
//     this.isMoving = true;
//     console.log(`Moving robot to position:`, targetPos, `for phase: ${phase}`);
    
//     // Replace this with actual robot movement commands
//     // Example: await this.sendSerialCommand(`G1 X${targetPos.x} Y${targetPos.y} Z${targetPos.z}`);
    
//     // Simulate movement time
//     const moveTime = this.calculateMoveTime(targetPos);
//     await new Promise(resolve => setTimeout(resolve, moveTime));
    
//     this.currentPosition = targetPos;
//     this.isMoving = false;
    
//     return { success: true, position: targetPos };
//   }

//   async actuateClaw(action) {
//     console.log(`Actuating claw: ${action}`);
//     // Replace with actual claw control
//     // Example: await this.sendSerialCommand(action === 'close' ? 'M3' : 'M5');
//     await new Promise(resolve => setTimeout(resolve, 500));
//     return { success: true, action };
//   }

//   calculateMoveTime(targetPos) {
//     const distance = Math.sqrt(
//       Math.pow(targetPos.x - this.currentPosition.x, 2) +
//       Math.pow(targetPos.y - this.currentPosition.y, 2) +
//       Math.pow(targetPos.z - this.currentPosition.z, 2)
//     );
//     return Math.max(1000, distance * 1000); // Minimum 1 second, scale with distance
//   }
// }

// const robot = new RobotController();

// io.on('connection', (socket) => {
//   console.log('Client connected');
  
//   socket.emit('robot_status', robot.isMoving ? 'moving' : 'ready');

//   socket.on('execute_movement', async (command) => {
//     try {
//       socket.emit('robot_status', 'processing');
      
//       switch (command.phase) {
//         case 'moveToPick':
//         case 'moveToDrop':
//           await robot.moveToPosition(command.targetPosition, command.phase);
//           break;
          
//         case 'lift':
//           await robot.actuateClaw('close');
//           break;
          
//         case 'drop':
//           await robot.actuateClaw('open');
//           break;
          
//         case 'return':
//           await robot.moveToPosition({ x: 0, y: 0.9, z: 0 }, command.phase);
//           break;
//       }
      
//       socket.emit('robot_status', 'ready');
//       socket.emit('robot_movement_complete', {
//         phase: command.phase,
//         success: true,
//         timestamp: Date.now()
//       });
      
//     } catch (error) {
//       console.error('Robot movement error:', error);
//       socket.emit('robot_status', 'error');
//       socket.emit('robot_movement_complete', {
//         phase: command.phase,
//         success: false,
//         error: error.message
//       });
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Robot control server running on port ${PORT}`);
// });