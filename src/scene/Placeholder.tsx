import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SCENE } from '../config/profile'

/**
 * 占位人物：纯代码生成的「几何小人」——头部 + 躯干 + 四肢 + 底座，
 * 带呼吸浮动与环绕装饰体。等你有自己的 .glb 模型后，
 * 在 profile.ts 的 SCENE.glb 填路径即可自动替换成真实模型。
 */
export default function PlaceholderFigure() {
  const group = useRef<THREE.Group>(null)
  const deco = useRef<THREE.Group>(null)
  const H = SCENE.modelHeight
  const matBody = <meshStandardMaterial color="#e8dcc8" roughness={0.55} metalness={0.05} />
  const matDark = <meshStandardMaterial color="#3a4252" roughness={0.7} metalness={0.1} />
  const matAccent = <meshStandardMaterial color="#ffb56b" roughness={0.35} metalness={0.15} />

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      // 呼吸：轻微上下浮动 + 极慢自转
      group.current.position.y = Math.sin(t * 0.7) * 0.08
      group.current.rotation.y = t * 0.05
    }
    if (deco.current) {
      deco.current.children.forEach((child, i) => {
        const ph = i * 2.1
        child.position.y = Math.sin(t * 0.9 + ph) * 0.35
        child.rotation.x = t * 0.4 + i
        child.rotation.y = t * 0.5 + i * 1.7
      })
    }
  })

  const bodyW = H * 0.26
  const bodyH = H * 0.42
  return (
    <>
      {/* 主体小人 */}
      <group ref={group}>
        {/* 底座 */}
        <mesh position={[0, -H * 0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[H * 0.62, H * 0.72, 48]} />
          <meshStandardMaterial color="#ffb56b" roughness={0.3} metalness={0.3} transparent opacity={0.85} />
        </mesh>
        {/* 腿 */}
        {[0.09, -0.09].map((x, i) => (
          <mesh key={i} position={[x * bodyW * 1.6, -bodyH * 0.52, 0]} rotation={[0, 0, 0]}>
            <capsuleGeometry args={[bodyW * 0.16, bodyH * 0.34, 8, 16]} />
            {matDark}
          </mesh>
        ))}
        {/* 躯干 */}
        <mesh position={[0, -bodyH * 0.12, 0]}>
          <capsuleGeometry args={[bodyW, bodyH, 8, 16]} />
          {matBody}
        </mesh>
        {/* 手臂 */}
        {[0.075, -0.075].map((x, i) => (
          <group key={i} position={[x * bodyW * 2.4, -bodyH * 0.1, 0]} rotation={[0, 0, i === 0 ? -0.18 : 0.18]}>
            <mesh position={[0, -bodyH * 0.36, 0]}>
              <capsuleGeometry args={[bodyW * 0.13, bodyH * 0.5, 8, 12]} />
              {matDark}
            </mesh>
          </group>
        ))}
        {/* 头 */}
        <mesh position={[0, bodyH * 0.62, 0]}>
          <sphereGeometry args={[bodyW * 1.05, 24, 24]} />
          {matBody}
        </mesh>
        {/* 头带装饰 */}
        <mesh position={[0, bodyH * 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[bodyW * 1.05, bodyW * 0.06, 12, 36]} />
          {matAccent}
        </mesh>
      </group>

      {/* 环绕装饰体：三个漂浮几何体 */}
      <group ref={deco}>
        <mesh position={[-3.2, 1.2, -1.5]}>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshStandardMaterial color="#6ea8ff" roughness={0.3} metalness={0.2} flatShading />
        </mesh>
        <mesh position={[3.0, 2.4, -2.0]}>
          <torusGeometry args={[0.55, 0.14, 16, 40]} />
          <meshStandardMaterial color="#ff8fa3" roughness={0.3} metalness={0.25} />
        </mesh>
        <mesh position={[1.8, 0.6, 2.4]}>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          <meshStandardMaterial color="#8fe3a8" roughness={0.4} metalness={0.15} flatShading />
        </mesh>
      </group>
    </>
  )
}
