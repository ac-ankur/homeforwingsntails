// Room.js


// import React, { useState } from 'react';
// import { motion } from 'framer-motion';

// const Room = () => {
//   const [position, setPosition] = useState({ x: 50, y: 50 });

//   const move = (dx, dy) => {
//     setPosition(prev => {
//       const newX = Math.min(Math.max(prev.x + dx, 0), 280); // keep within 300x300 bounds (20px object)
//       const newY = Math.min(Math.max(prev.y + dy, 0), 280);
//       return { x: newX, y: newY };
//     });
//   };

//   return (
//     <div style={{margin:'10rem auto'}}>
//       <div style={{ width: 300, height: 300, border: '2px solid black', position: 'relative', marginBottom: '1rem' }}>
//         <svg width="100%" height="100%">
//           <path d="M 50,50 L 200,50 L 200,200 L 50,200 L 50,50" fill="none" stroke="gray" strokeWidth="2" />
//         </svg>
//         <motion.div
//           style={{
//             width: 20,
//             height: 20,
//             borderRadius: '50%',
//             backgroundColor: 'red',
//             position: 'absolute',
//             left: position.x,
//             top: position.y,
//           }}
//         />
//       </div>

//       <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
//         <button onClick={() => move(0, -10)}>Forward ↑</button>
//         <button onClick={() => move(0, 10)}>Backward ↓</button>
//         <button onClick={() => move(-10, 0)}>Left ←</button>
//         <button onClick={() => move(10, 0)}>Right →</button>
//       </div>
//     </div>
//   );
// };

// export default Room;




// import React, { useState, useRef, useEffect } from "react";

// const Room = () => {
//   const [pathPoints, setPathPoints] = useState([]);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [speed, setSpeed] = useState(2); // pixels per frame
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [isMoving, setIsMoving] = useState(false);
//   const pointIndexRef = useRef(0);
//   const positionRef = useRef({ x: 0, y: 0 });
//   const requestRef = useRef();

//   const handleMouseDown = (e) => {
//     setIsDrawing(true);
//     const rect = e.currentTarget.getBoundingClientRect();
//     const newPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
//     setPathPoints([newPoint]);
//     setPosition(newPoint);
//     positionRef.current = newPoint;
//     pointIndexRef.current = 0;
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawing) return;
//     const rect = e.currentTarget.getBoundingClientRect();
//     const newPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
//     setPathPoints((prev) => [...prev, newPoint]);
//   };

//   const handleMouseUp = () => {
//     setIsDrawing(false);
//   };

//   const toggleSpeed = () => {
//     setSpeed((prev) => (prev === 2 ? 4 : prev === 4 ? 8 : 2));
//   };

//   const speedLabel = speed === 2 ? "Slow" : speed === 4 ? "Medium" : "Fast";

//   const moveStep = () => {
//     const points = pathPoints;
//     let index = pointIndexRef.current;
//     if (index >= points.length - 1) {
//       cancelAnimationFrame(requestRef.current);
//       setIsMoving(false);
//       return;
//     }

//     const current = positionRef.current;
//     const target = points[index + 1];

//     const dx = target.x - current.x;
//     const dy = target.y - current.y;
//     const distance = Math.sqrt(dx * dx + dy * dy);

//     if (distance < speed) {
//       // Move directly to next point
//       positionRef.current = target;
//       pointIndexRef.current = index + 1;
//     } else {
//       // Move a bit closer
//       const ratio = speed / distance;
//       positionRef.current = {
//         x: current.x + dx * ratio,
//         y: current.y + dy * ratio,
//       };
//     }

//     setPosition({ ...positionRef.current });
//     requestRef.current = requestAnimationFrame(moveStep);
//   };

//   const startMovement = () => {
//     if (pathPoints.length < 2) return;
//     pointIndexRef.current = 0;
//     positionRef.current = pathPoints[0];
//     setIsMoving(true);
//     requestRef.current = requestAnimationFrame(moveStep);
//   };

//   const svgPath =
//     pathPoints.length > 0
//       ? "M " + pathPoints.map((p) => `${p.x},${p.y}`).join(" L ")
//       : "";

//   return (
//     <div style={{ textAlign: "center" }}>
//       <svg
//         width={500}
//         height={500}
//         style={{ border: "2px solid black", background: "#f9f9f9" }}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//       >
//         {/* Path */}
//         <path d={svgPath} stroke="gray" fill="none" strokeWidth="2" />
//         {/* Checkpoints */}
//         {pathPoints.map((point, index) => (
//           <circle key={index} cx={point.x} cy={point.y} r={3} fill="blue" />
//         ))}
//         {/* Moving object */}
//         <circle cx={position.x} cy={position.y} r={10} fill="red" />
//       </svg>

//       <div style={{ marginTop: "1rem" }}>
//         <button onClick={startMovement} disabled={isMoving}>
//           Start Moving
//         </button>
//         <button onClick={toggleSpeed} style={{ marginLeft: "1rem" }}>
//           Speed: {speedLabel}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Room;


import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const initialRobots = [
  {
    id: 'robot1',
    color: 'blue',
    path: [
      { x: 50, y: 50 },
      { x: 150, y: 50 },
      { x: 150, y: 150 },
      { x: 200, y: 200 },
    ],
  },
  {
    id: 'robot2',
    color: 'green',
    path: [
      { x: 250, y: 250 },
      { x: 200, y: 200 },
      { x: 150, y: 150 },
      { x: 100, y: 100 },
    ],
  },
];

const MultiRobotRoom = () => {
  const [robots, setRobots] = useState(initialRobots);
  const [positions, setPositions] = useState(
    Object.fromEntries(initialRobots.map(r => [r.id, r.path[0]]))
  );
  const [speed, setSpeed] = useState(1000);
  const [playing, setPlaying] = useState(false);
  const [tracePositions, setTracePositions] = useState({});
  const [tValues, setTValues] = useState(
    Object.fromEntries(initialRobots.map(r => [r.id, 0]))
  );
  const svgRef = useRef(null);

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setTValues(prev => {
        const updated = { ...prev };
        const newPositions = {};
        const newTraces = { ...tracePositions };

        robots.forEach(robot => {
          const t = prev[robot.id];
          const nextPos = robot.path[t] || robot.path[robot.path.length - 1];
          newPositions[robot.id] = nextPos;
          newTraces[robot.id] = [...(newTraces[robot.id] || []), nextPos];
          updated[robot.id] = Math.min(t + 1, robot.path.length);
        });

        if (
          newPositions.robot1?.x === newPositions.robot2?.x &&
          newPositions.robot1?.y === newPositions.robot2?.y
        ) {
          updated.robot2 = prev.robot2;
        }

        setPositions(newPositions);
        setTracePositions(newTraces);
        return updated;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [robots, speed, playing]);

  const toPathStr = (path) => `M ${path.map(p => `${p.x},${p.y}`).join(' L ')}`;

  const handleDrag = (robotId, pointIndex, e) => {
    const newX = e.clientX - svgRef.current.getBoundingClientRect().left;
    const newY = e.clientY - svgRef.current.getBoundingClientRect().top;
    setRobots(prev =>
      prev.map(r =>
        r.id === robotId
          ? {
              ...r,
              path: r.path.map((p, i) => (i === pointIndex ? { x: newX, y: newY } : p)),
            }
          : r
      )
    );
  };

  const handleAddPoint = (robotId, e) => {
    const newX = e.clientX - svgRef.current.getBoundingClientRect().left;
    const newY = e.clientY - svgRef.current.getBoundingClientRect().top;
    setRobots(prev =>
      prev.map(r =>
        r.id === robotId
          ? {
              ...r,
              path: [...r.path, { x: newX, y: newY }],
            }
          : r
      )
    );
  };

  const handleClearPaths = () => {
    setRobots(prev => prev.map(robot => ({ ...robot, path: [] })));
    setPositions({});
    setTracePositions({});
    setTValues(Object.fromEntries(robots.map(r => [r.id, 0])));
    setPlaying(false);
  };

  return (
    <div style={{ width: 900, height: 600, border: '3px solid #222', position: 'relative', background: '#f0f0f0' , margin: '10rem auto'}}>
      <svg ref={svgRef} width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        {robots.map(robot => (
            <div style={{marginTop:"2rem"}}>
          <React.Fragment key={robot.id} >
            <path d={toPathStr(robot.path)} fill="none" stroke={robot.color} strokeWidth="2" />
            {(tracePositions[robot.id] || []).map((p, i) => (
              <circle key={`${robot.id}-trace-${i}`} cx={p.x} cy={p.y} r={2} fill={robot.color} />
            ))}
            {robot.path.map((p, i) => (
              <circle
                key={`${robot.id}-point-${i}`}
                cx={p.x}
                cy={p.y}
                r={6}
                fill={robot.color}
                stroke="#fff"
                strokeWidth="2"
                style={{ cursor: 'move' }}
                onMouseDown={(e) => {
                  const handleMouseMove = (moveEvent) => handleDrag(robot.id, i, moveEvent);
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            ))}
          </React.Fragment>
          </div>
        ))}
      </svg>

      {robots.map(robot => (

        <motion.div
          key={robot.id}
          animate={{
            x: positions[robot.id]?.x || 0,
            y: positions[robot.id]?.y || 0,
          }}
          transition={{ duration: 0.8 }}
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: robot.color,
            position: 'absolute',
            left: 0,
            top: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
            boxShadow: '0 0 8px rgba(0,0,0,0.3)',
          }}
        >
          {robot.id}
        </motion.div>
      ))}

      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        {robots.map(robot => (
          <button
            key={`add-${robot.id}`}
            onClick={(e) => svgRef.current.addEventListener('click', (event) => handleAddPoint(robot.id, event), { once: true })}
            style={{ margin: '0 5px' }}
          >
            Add Point to {robot.id}
          </button>
        ))}
        <button onClick={handleClearPaths} style={{ marginLeft: 10, background: 'red', color: '#fff' }}>
          Clear All Paths
        </button>
      </div>

      <div style={{ position: 'absolute', bottom: 10, left: 10, background: '#fff', padding: '5px 10px', borderRadius: 4 }}>
        <label style={{color:'black'}}>Speed: </label>
        <input
          type="range"
          min="200"
          max="2000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
        <span>{speed}ms</span>
      </div>

      <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
        <button onClick={() => setPlaying(p => !p)} style={{ padding: '6px 12px' }}>
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
};

export default MultiRobotRoom;
