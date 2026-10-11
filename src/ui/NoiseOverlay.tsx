/**
 * 全屏胶片噪点蒙层：用 SVG feTurbulence 生成动态噪点，multiply 混合，
 * 给画面加一层电影胶片质感（与原站 NoiseOverlay 等效）。
 */
export default function NoiseOverlay() {
  return (
    <div className="noise" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="noise-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch">
            <animate
              attributeName="baseFrequency"
              dur="0.4s"
              values="0.85;0.9;0.85"
              keyTimes="0;0.5;1"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
    </div>
  )
}
