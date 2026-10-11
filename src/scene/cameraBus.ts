/**
 * 3D 场景共享总线：
 * - cameraYaw：Scene 每帧把「相机相对模型(原点)的方位角」写进来，
 *   CustomModel 读取后让模型平滑转向、始终面向镜头。
 *   顶部镜头在正前方（yaw≈0）→ 模型复位成正面对镜头。
 * - modelTurnDeg：Scene 按当前镜头段插值的「模型转体角」（度）。
 *   命中脸部特写镜头时取负/正 45°，其余段回落到 0（正面）。
 *   CustomModel 把它叠加到面向镜头的角速度上?? no — 直接作为姿态补偿叠加到 yaw。
 */
export const cameraYaw = { value: 0 }
export const modelTurnDeg = { value: 0 }