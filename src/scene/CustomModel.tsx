import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SCENE } from '../config/profile'
import { cameraYaw, modelTurnDeg } from './cameraBus'

/**
 * 自定义模型：当 profile.ts 的 SCENE.glb 填了路径后使用。
 *
 * 特性：
 * 1. 整体呼吸悬浮，并根据相机方位平滑转向，始终面向镜头
 * 2. 眼球保持固定不动（保留模型原始姿态，不跟随鼠标）
 *
 * 模型摆放在原点（头部约在 y≈1 处），场景镜头默认 lookAt [0, 1.45, 0]。
 */
export default function CustomModel() {
  // 第二参数指定 Draco 解码器路径：用本地 public/draco/（不依赖 Google CDN，国内加载稳定）
  const { scene } = useGLTF(SCENE.glb, `${import.meta.env.BASE_URL}draco/`)
  const group = useRef<THREE.Group>(null)

  // 克隆场景（保持所有网格原始姿态，眼球固定）
  const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = false // 大头 + 透明 logo 平面不需要投影
        o.receiveShadow = false
      }
    })
    return clone
  }, [scene])

  // 模型原始头部高度约 0.7（Head 锚点 y≈0.95），按 modelHeight 缩放
  const scale = SCENE.modelHeight / 0.7
  // 平滑朝向：记录当前 yaw，避免突变
  const curYaw = useRef(0)
  // 呼吸基准高度（JSX position.y 会被每帧覆盖，需固定基准再叠加浮动）
  // 与 SCENE.modelOffsetY 联动：模型下移时镜头注视点由 Scene 同步，构图不漂
  const baseY = SCENE.modelOffsetY

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      // 1) 呼吸悬浮（在基准高度上浮动，不丢失下移量）
      group.current.position.y = baseY + Math.sin(t * 0.6) * 0.06
      // 2) 始终面向镜头：镜头在哪个方位，模型就平滑转到哪个方位
      //    滚回顶部时相机 yaw≈0 → 模型复位为正面对镜头
      //    沿短弧收敛（目标-当前 取 [-π,π] 再按阻尼比例逼近）
      const turnOffset = THREE.MathUtils.degToRad(modelTurnDeg.value)
      const targetAngle = cameraYaw.value + turnOffset
      const cur = curYaw.current
      const diff = ((targetAngle - cur + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI
      const target = cur + diff * (1 - Math.pow(0.08, dt))
      curYaw.current = target
      group.current.rotation.y = target
    }
  })

  return (
    <group ref={group} scale={scale} position={[0, SCENE.modelOffsetY, 0]}>
      <primitive object={model} />
    </group>
  )
}
