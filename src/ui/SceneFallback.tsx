import { Component, type ReactNode } from 'react'

/**
 * WebGL 能力检测。
 * 部分电脑浏览器（关闭硬件加速、显卡驱动被浏览器拉黑、远程桌面 / 虚拟机、
 * 企业策略禁用 WebGL）拿不到 WebGL 上下文，此时 3D 场景整块不会渲染。
 * 这里提前探测，拿不到就改用静态形象图兜底，页面不会「空一块」。
 */
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null)
    if (!gl) return false
    // 上下文创建成功但立即丢失（常见于驱动异常）也视为不可用
    const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')
    const isLost = (gl as WebGLRenderingContext).isContextLost?.() ?? false
    if (lose) lose.loseContext()
    return !isLost
  } catch {
    return false
  }
}

/** 3D 场景崩溃兜底：捕获 Canvas / 模型加载期间抛出的异常 */
export class SceneErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    // 保留日志便于排查，但不阻断页面其余部分
    console.warn('[3D 场景不可用，已回退静态形象图]', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** 静态形象图兜底：构图与 3D 模型一致（居中、贴底、带柔和投影） */
export function SceneFallback() {
  return (
    <div className="scene-fallback" aria-hidden="true">
      <img src={import.meta.env.BASE_URL + 'images/personas/persona-grad.webp'} alt="" />
    </div>
  )
}
