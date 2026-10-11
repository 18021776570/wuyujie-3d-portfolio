import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SCENE } from '../config/profile'
import PlaceholderFigure from './Placeholder'
import CustomModel from './CustomModel'
import { cameraYaw, modelTurnDeg } from './cameraBus'

/**
 * 滚动驱动的镜头运镜（代码实现，不依赖 glb 烘焙动画）。
 *
 * 原理：页面上有「镜头锚点」——首屏 .hero、每一条履历 .tl-entry、作品区 .works。
 * 每帧计算滚动进度落在哪两个锚点之间，在相邻「镜头关键帧」之间做平滑插值，
 * 再叠加鼠标视差，效果等同原站的「滚动就是运镜」。
 */
export default function Scene() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const gl = useThree((s) => s.gl)

  // 鼠标缓动值
  const smouse = useRef({ x: 0, y: 0 })
  const mouse = useRef({ x: 0, y: 0 })
  const targetRef = useRef(new THREE.Vector3())
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
  const anchorCache = useRef<HTMLElement[] | null>(null)
  // 镜头关键帧缓存（惰性生成：首次 useFrame 时 DOM 已就绪，取真实履历条数）
  const shotsRef = useRef<{ pos: THREE.Vector3; look: THREE.Vector3; modelTurnDeg: number }[] | null>(null)

  /**
   * 生成镜头关键帧：hero → 每条履历 → works。
   * 履历镜头沿弧线扫过模型；命中 faceShots 的履历改用配置的颧骨特写。
   * 返回值额外附上 modelTurnDeg：命中时取 faceShots 的转体角，否则回落到 0（正面）。
   */
  function buildShots(N: number) {
    const cams: { pos: THREE.Vector3; look: THREE.Vector3; modelTurnDeg: number }[] = []
    // 模型整体下移量：镜头 y 坐标全部同步跟随，保证构图不漂
    const oy = SCENE.modelOffsetY
    // 首屏 / 初始镜头：正面对镜头
    const heroShot = { pos: new THREE.Vector3(0, 1.8 + oy, 9.5), look: new THREE.Vector3(0, 1.45 + oy, 0), modelTurnDeg: 0 }
    cams.push({ ...heroShot, pos: heroShot.pos.clone(), look: heroShot.look.clone() })
    // 履历：按参考视频的节奏——先向右侧绕行，再快速推近到脸部特写，
    // 随后从侧脸退回正面，最后拉远进入 Works。
    const resumePath = [
      // 先保留完整脸部和头发
      { angle: 0.12, distance: 8.0, y: 1.75, lookY: 1.45 },
      // 向右侧绕行，开始把镜头中心抬到脸部图标区域
      { angle: 0.72, distance: 4.5, y: 1.62, lookY: 1.48 },
      // 核心特写：更近、更高，锁定双眼下方的脸部图标
      { angle: 1.05, distance: 1.85, y: 1.48, lookY: 1.50 },
      // 从特写平滑退回，仍保持脸部在画面中心
      { angle: 0.78, distance: 3.1, y: 1.58, lookY: 1.48 },
      { angle: 0.35, distance: 6.2, y: 1.85, lookY: 1.38 },
    ]
    // 模型缩放与下移（与 CustomModel 一致）
    const modelScale = SCENE.modelHeight / 0.7
    const yAxis = new THREE.Vector3(0, 1, 0)
    const faceByIndex = new Map<number, (typeof SCENE.faceShots)[number]>()
    for (const fs of SCENE.faceShots) faceByIndex.set(fs.entryIndex, fs)
    for (let i = 0; i < N; i++) {
      const fs = faceByIndex.get(i)
      if (fs) {
        // 图标本地坐标 → 世界坐标：先按模型缩放、再叠加上移
        const look = new THREE.Vector3(...fs.nodeLocal).multiplyScalar(modelScale)
        look.y += SCENE.modelOffsetY
        // 模型转体后，图标绕模型中心旋转同样的角度（模型绕自身 Y 轴转）
        const turn = THREE.MathUtils.degToRad(fs.modelTurnDeg)
        look.applyAxisAngle(yAxis, turn)
        // 相机在图标外侧偏右/左前，距离决定放大倍率
        const offset = new THREE.Vector3(...fs.camOffset).applyAxisAngle(yAxis, turn)
        const pos = look.clone().add(offset)
        cams.push({ pos, look, modelTurnDeg: fs.modelTurnDeg })
      } else if (SCENE.resetShots.includes(i)) {
        // 复用顶部初始镜头：克隆 Vector3，避免后续插值修改共享对象
        cams.push({ pos: heroShot.pos.clone(), look: heroShot.look.clone(), modelTurnDeg: heroShot.modelTurnDeg })
      } else {
        const t = N > 1 ? i / (N - 1) : 0.5
        const p0 = resumePath[Math.min(resumePath.length - 1, Math.round(t * (resumePath.length - 1)))]
        cams.push({
          pos: new THREE.Vector3(Math.sin(p0.angle) * p0.distance, p0.y + oy, Math.cos(p0.angle) * p0.distance),
          look: new THREE.Vector3(0, p0.lookY + oy, 0),
          modelTurnDeg: 0,
        })
      }
    }
    // 作品区：镜头拉远并抬高，回到完整人物/背面展示
    cams.push({ pos: new THREE.Vector3(-0.8, 2.8 + oy, 10.8), look: new THREE.Vector3(0, 1.05 + oy, 0), modelTurnDeg: 0 })
    return cams
  }

  // 镜头锚点 DOM 位置（首屏 + 每条履历 + 作品区）——首次 useFrame 时惰性查询
  const anchors = useMemo(() => {
    const els: HTMLElement[] = []
    const hero = document.querySelector('.hero') as HTMLElement | null
    if (hero) els.push(hero)
    document.querySelectorAll<HTMLElement>('.tl-entry').forEach((el) => els.push(el))
    const works = document.querySelector('.works') as HTMLElement | null
    if (works) els.push(works)
    return els
  }, [])

  const posA = useRef(new THREE.Vector3())
  const posB = useRef(new THREE.Vector3())
  const lookA = useRef(new THREE.Vector3())
  const lookB = useRef(new THREE.Vector3())
  const curPos = useRef(new THREE.Vector3(0, 1.8 + SCENE.modelOffsetY, 9.5))
  const curLook = useRef(new THREE.Vector3(0, 1.45 + SCENE.modelOffsetY, 0))
  const curTurn = useRef(0)
  const paraEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const paraQuat = useRef(new THREE.Quaternion())
  const tmp = useRef(new THREE.Vector3())

  useFrame((state, dt) => {
    if (!anchorCache.current || anchorCache.current.length < 2) {
      // DOM 未就绪时重查，保证拿到真实的【首屏 + 每条履历 + 作品区】锚点
      const els: HTMLElement[] = []
      const hero = document.querySelector('.hero') as HTMLElement | null
      if (hero) els.push(hero)
      document.querySelectorAll<HTMLElement>('.tl-entry').forEach((el) => els.push(el))
      const works = document.querySelector('.works') as HTMLElement | null
      if (works) els.push(works)
      anchorCache.current = els
    }
    if (!shotsRef.current) {
      const N = Math.max(1, document.querySelectorAll('.tl-entry').length || anchorCache.current.length - 2 || 3)
      shotsRef.current = buildShots(N)
    }
    const els = anchorCache.current
    const shots = shotsRef.current
    if (els.length < 2 || shots.length < 2) return

    // 1) 当前滚动 y，找所在区间 [i, i+1]
    const scrollY = window.scrollY
    const tops = els.map((el) => el.getBoundingClientRect().top + scrollY)
    let seg = 0
    while (seg < tops.length - 2 && scrollY >= tops[seg + 1]) seg++
    const a = tops[seg]
    const b = tops[seg + 1]
    const raw = b > a ? THREE.MathUtils.clamp((scrollY - a) / (b - a), 0, 1) : 1
    // 轻微 smoothstep，让镜头运动更顺滑（避免线性生硬）
    const t = THREE.MathUtils.smoothstep(raw, 0, 1)

    // 2) 在 shots[seg] 与 shots[seg+1] 之间插值（seg 钳到 shots 长度）
    const s0 = shots[Math.min(seg, shots.length - 1)]
    const s1 = shots[Math.min(seg + 1, shots.length - 1)]
    posA.current.copy(s0.pos)
    posB.current.copy(s1.pos)
    lookA.current.copy(s0.look)
    lookB.current.copy(s1.look)
    const desiredPos = tmp.current.copy(posA.current).lerp(posB.current, t)
    const desiredLook = lookA.current.lerp(lookB.current, t)

    // 3) 帧间阻尼（无限趋近），手感柔和
    const k = 1 - Math.pow(0.08, dt)
    curPos.current.lerp(desiredPos, k)
    curLook.current.lerp(desiredLook, k)
    // 模型转体角随镜头段插值：命中颧骨特写时平滑转向 ±45°，其余回落正面
    const turn0 = s0.modelTurnDeg
    const turn1 = s1.modelTurnDeg
    curTurn.current += (THREE.MathUtils.lerp(turn0, turn1, t) - curTurn.current) * k
    modelTurnDeg.value = curTurn.current

    // 4) 鼠标视差：绕焦点轻微旋转
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches !== true) {
      const me = 1 - Math.pow(0.1, dt)
      smouse.current.x += (mouse.current.x - smouse.current.x) * me
      smouse.current.y += (mouse.current.y - smouse.current.y) * me
      const ax = THREE.MathUtils.degToRad(2.2)
      paraEuler.current.set(-smouse.current.y * ax, -smouse.current.x * ax, 0)
      paraQuat.current.setFromEuler(paraEuler.current)
    } else {
      paraQuat.current.identity()
    }

    // 5) 应用：位置绕焦点旋转 + lookAt
    targetRef.current.copy(curLook.current)
    const rel = curPos.current.clone().sub(targetRef.current).applyQuaternion(paraQuat.current)
    camera.position.copy(targetRef.current).add(rel)
    camera.lookAt(targetRef.current)
    camera.updateProjectionMatrix?.()

    // 6) 把相机相对原点的方位角写入共享总线，供模型面向镜头
    const delta = camera.position.clone().sub(targetRef.current)
    cameraYaw.value = Math.atan2(delta.x, delta.z)
  })

  return (
    <>
      {/* 背景渐变球 */}
      <GradientBackground />

      {/* 灯光 */}
      <hemisphereLight args={['#ffffff', '#404040', 0.9]} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={2.2}
        color="#ffd9c6"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 4, -4]} intensity={1.8} color="#9fc6ff" />

      {/* 模型：有 glb 用自定义模型，否则占位小人 */}
      {SCENE.glb ? <CustomModel /> : <PlaceholderFigure />}

      {/* 地面阴影接收面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]} receiveShadow>
        <circleGeometry args={[10, 48]} />
        <meshStandardMaterial color="#0c1018" roughness={0.9} metalness={0} transparent opacity={0.7} />
      </mesh>
    </>
  )
}

/** 上下渐变背景球（包裹相机），营造电影感天空 */
function GradientBackground() {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color('#24344a') },
      uBottom: { value: new THREE.Color('#0a0e16') },
      uSteep: { value: 1.1 },
    }),
    []
  )
  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uBottom;
          uniform float uSteep;
          varying vec3 vDir;
          void main() {
            float t = clamp(vDir.y * uSteep * 0.5 + 0.5, 0.0, 1.0);
            gl_FragColor = vec4(mix(uBottom, uTop, t), 1.0);
          }
        `}
      />
    </mesh>
  )
}
