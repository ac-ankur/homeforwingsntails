import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";

// Robotic arm component
function getMedicineColor(medicineName) {
  const colors = [
    "#f44336",
    "#2196f3",
    "#ffeb3b",
    "#4caf50",
    "#9c27b0",
    "#ff9800",
    "#00bcd4",
    "#795548",
  ];
  const hash = medicineName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function RoboticArm({ phase, position, onPhaseComplete, currentMedicine }) {
  const armRef = useRef();
  const clawRef = useRef();

  const basePosY = 0.9;
  const pickDropY = 0.5;
  const travelHeight = 2.5;
  const moveSpeed = 0.3;
  const tolerance = 0.05;

  const currentArmPos = useRef(new THREE.Vector3());
  const finalTargetPos = useRef(new THREE.Vector3());
  const intermediateTargetPos = useRef(new THREE.Vector3());
  const clawScale = useRef(1);

  const [movementSubPhase, setMovementSubPhase] = useState("idle");

  useEffect(() => {
    if (!armRef.current) return;
    currentArmPos.current.copy(armRef.current.position);
  }, []);

  useEffect(() => {
    if (phase === "idle") {
      finalTargetPos.current.copy(new THREE.Vector3(0, basePosY, 0));
      clawScale.current = 1;
      setMovementSubPhase("moveX_return");
    } else if (phase === "moveToPick" && position) {
      finalTargetPos.current.set(position.x, pickDropY, position.z);
      clawScale.current = 1;
      intermediateTargetPos.current.set(
        currentArmPos.current.x,
        travelHeight,
        currentArmPos.current.z
      );
      setMovementSubPhase("moveY_up");
    } else if (phase === "lift" && position) {
      finalTargetPos.current.set(position.x, travelHeight, position.z);
      clawScale.current = 0.4;
      intermediateTargetPos.current.copy(finalTargetPos.current);
      setMovementSubPhase("moveY");
    } else if (phase === "moveToDrop" && position) {
      finalTargetPos.current.set(position.x, travelHeight, position.z);
      clawScale.current = 0.4;
      intermediateTargetPos.current.set(
        finalTargetPos.current.x,
        travelHeight,
        currentArmPos.current.z
      );
      setMovementSubPhase("moveX");
    } else if (phase === "drop" && position) {
      finalTargetPos.current.set(position.x, pickDropY, position.z);
      clawScale.current = 1;
      intermediateTargetPos.current.copy(finalTargetPos.current);
      setMovementSubPhase("moveY");
    } else if (phase === "return") {
      finalTargetPos.current.copy(new THREE.Vector3(0, pickDropY, 0));
      clawScale.current = 1;
      intermediateTargetPos.current.set(
        currentArmPos.current.x,
        travelHeight,
        currentArmPos.current.z
      );
      setMovementSubPhase("moveY_up");
    }
  }, [phase, position]);

  useFrame(() => {
    if (!armRef.current || !clawRef.current) return;
    currentArmPos.current.copy(armRef.current.position);

    const currentClawScale = clawRef.current.scale.y;
    clawRef.current.scale.y += (clawScale.current - currentClawScale) * 0.1;

    let movementCompleted = false;

    switch (movementSubPhase) {
      case "moveY_up":
        currentArmPos.current.y = THREE.MathUtils.lerp(
          currentArmPos.current.y,
          intermediateTargetPos.current.y,
          moveSpeed
        );
        if (
          Math.abs(currentArmPos.current.y - intermediateTargetPos.current.y) <
          tolerance
        ) {
          currentArmPos.current.y = intermediateTargetPos.current.y;
          movementCompleted = true;
          intermediateTargetPos.current.set(
            finalTargetPos.current.x,
            travelHeight,
            currentArmPos.current.z
          );
          setMovementSubPhase("moveX");
        }
        break;

      case "moveX":
        currentArmPos.current.x = THREE.MathUtils.lerp(
          currentArmPos.current.x,
          intermediateTargetPos.current.x,
          moveSpeed
        );
        if (
          Math.abs(currentArmPos.current.x - intermediateTargetPos.current.x) <
          tolerance
        ) {
          currentArmPos.current.x = intermediateTargetPos.current.x;
          movementCompleted = true;
          intermediateTargetPos.current.set(
            finalTargetPos.current.x,
            travelHeight,
            finalTargetPos.current.z
          );
          setMovementSubPhase("moveZ");
        }
        break;

      case "moveZ":
        currentArmPos.current.z = THREE.MathUtils.lerp(
          currentArmPos.current.z,
          intermediateTargetPos.current.z,
          moveSpeed
        );
        if (
          Math.abs(currentArmPos.current.z - intermediateTargetPos.current.z) <
          tolerance
        ) {
          currentArmPos.current.z = intermediateTargetPos.current.z;
          movementCompleted = true;
          if (phase === "moveToPick" || phase === "drop") {
            intermediateTargetPos.current.set(
              finalTargetPos.current.x,
              pickDropY,
              finalTargetPos.current.z
            );
            setMovementSubPhase("moveY_down");
          } else {
            setMovementSubPhase("complete");
          }
        }
        break;

      case "moveY":
        currentArmPos.current.y = THREE.MathUtils.lerp(
          currentArmPos.current.y,
          intermediateTargetPos.current.y,
          moveSpeed
        );
        if (
          Math.abs(currentArmPos.current.y - intermediateTargetPos.current.y) <
          tolerance
        ) {
          currentArmPos.current.y = intermediateTargetPos.current.y;
          movementCompleted = true;
          setMovementSubPhase("complete");
        }
        break;

      case "moveY_down":
        currentArmPos.current.y = THREE.MathUtils.lerp(
          currentArmPos.current.y,
          intermediateTargetPos.current.y,
          moveSpeed
        );
        if (
          Math.abs(currentArmPos.current.y - intermediateTargetPos.current.y) <
          tolerance
        ) {
          currentArmPos.current.y = intermediateTargetPos.current.y;
          movementCompleted = true;
          setMovementSubPhase("complete");
        }
        break;

      case "moveX_return":
        currentArmPos.current.x = THREE.MathUtils.lerp(
          currentArmPos.current.x,
          finalTargetPos.current.x,
          moveSpeed
        );
        if (
          Math.abs(currentArmPos.current.x - finalTargetPos.current.x) <
          tolerance
        ) {
          currentArmPos.current.x = finalTargetPos.current.x;
          movementCompleted = true;
          setMovementSubPhase("moveZ_return");
        }
        break;

      case "moveZ_return":
        currentArmPos.current.z = THREE.MathUtils.lerp(
          currentArmPos.current.z,
          finalTargetPos.current.z,
          moveSpeed
        );
        if (
          Math.abs(currentArmPos.current.z - finalTargetPos.current.z) <
          tolerance
        ) {
          currentArmPos.current.z = finalTargetPos.current.z;
          movementCompleted = true;
          if (Math.abs(currentArmPos.current.y - pickDropY) > tolerance) {
            intermediateTargetPos.current.set(
              finalTargetPos.current.x,
              pickDropY,
              finalTargetPos.current.z
            );
            setMovementSubPhase("moveY_down");
          } else {
            setMovementSubPhase("complete");
          }
        }
        break;

      case "complete":
        if (Math.abs(clawRef.current.scale.y - clawScale.current) < 0.1) {
          onPhaseComplete();
          setMovementSubPhase("idle");
        }
        break;

      default:
        break;
    }

    armRef.current.position.copy(currentArmPos.current);
  });

  return (
    <group ref={armRef}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.2, 1, 1.2]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Arm */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[0.25, 2.6, 0.25]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Horizontal arm */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.2]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <group ref={clawRef} position={[0, 3.2, 0]}>
        {/* Left claw */}
        <mesh position={[-0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial
            color={currentMedicine ? "#4CAF50" : "#222"}
            emissive={currentMedicine ? "#004d00" : "#000000"}
          />
        </mesh>

        {/* Right claw */}
        <mesh position={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial
            color={currentMedicine ? "#4CAF50" : "#222"}
            emissive={currentMedicine ? "#004d00" : "#000000"}
          />
        </mesh>

        {/* Visual medicine item between claws */}
        {currentMedicine && (
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial
              color={getMedicineColor(currentMedicine.name)}
              transparent
              opacity={0.8}
            />
          </mesh>
        )}

        {/* Glowing effect */}
        {currentMedicine && (
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.35, 16]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* ADD THIS HERE - Medicine name display */}
      {phase !== "idle" && currentMedicine && (
        <Html position={[0, 4, 0]} center>
          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
            {currentMedicine.name}
          </div>
        </Html>
      )}
    </group>
  );
}