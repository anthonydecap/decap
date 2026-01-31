/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { type FC, Suspense, useRef, useState } from "react";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import * as THREE from "three";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <span className="text-blue-600 underline">{children}</span>;
  },
};

// Apple-Level Interaction Elegance
const AppleInteractionElegance = ({
  isVisible,
  hasInteracted,
}: {
  isVisible: boolean;
  hasInteracted: boolean;
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Apple-style precision ring - barely visible but perfect */}
      <div className="absolute inset-4">
        <div className="w-full h-full rounded-full border border-black/30 relative">
          <div
            className="absolute inset-0 rounded-full border border-black/30 animate-pulse"
            style={{ animationDuration: "8s" }}
          ></div>
        </div>
      </div>

      {/* Elegant rotation arrows - Apple-style with subtle animations */}
      <div className="absolute inset-0">
        {/* Top arrow */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <svg
            className="w-6 h-6 text-black/30 animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "0s" }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2L12 22M12 2L6 8M12 2L18 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Left arrow */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
          <svg
            className="w-6 h-6 text-black/30 transform rotate-90 animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "1s" }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2L12 22M12 2L6 8M12 2L18 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Right arrow */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <svg
            className="w-6 h-6 text-black/30 transform -rotate-90 animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "2s" }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2L12 22M12 2L6 8M12 2L18 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Bottom arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <svg
            className="w-6 h-6 text-black/30 transform rotate-180 animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "3s" }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2L12 22M12 2L6 8M12 2L18 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Subtle corner accent - Apple's signature detail */}
      <div className="absolute top-3 right-3">
        <div className="w-0.5 h-0.5 bg-black/30 rounded-full"></div>
      </div>
    </div>
  );
};

// 3D Model Component
const Model = ({
  modelPath,
  rotation,
  onLoad,
  onMeshNames,
  metallicMeshes,
}: {
  modelPath: string;
  rotation: [number, number, number];
  onLoad?: () => void;
  onMeshNames?: (names: string[]) => void;
  metallicMeshes?: Set<string>;
}) => {
  const fbx = useLoader(FBXLoader, modelPath);
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = rotation[0];
      meshRef.current.rotation.y = rotation[1];
      meshRef.current.rotation.z = rotation[2];
    }
  });

  React.useEffect(() => {
    if (fbx) {
      const meshNames: string[] = [];

      const applyMaterials = (obj: THREE.Object3D) => {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const meshName = child.name || "unnamed_mesh";
            meshNames.push(meshName);

            const material = child.material as THREE.Material;
            let newMaterial: THREE.MeshStandardMaterial;

            const shouldBeMetallic = metallicMeshes?.has(meshName);

            if (material instanceof THREE.MeshStandardMaterial) {
              newMaterial = material.clone();
              newMaterial.metalness = shouldBeMetallic ? 0.8 : 0.0;
              newMaterial.roughness = shouldBeMetallic ? 0.2 : 0.8;
            } else if (material instanceof THREE.MeshBasicMaterial) {
              newMaterial = new THREE.MeshStandardMaterial({
                color: material.color,
                metalness: shouldBeMetallic ? 0.8 : 0.0,
                roughness: shouldBeMetallic ? 0.2 : 0.8,
                transparent: material.transparent,
                opacity: material.opacity,
              });
            } else if (material instanceof THREE.MeshLambertMaterial) {
              newMaterial = new THREE.MeshStandardMaterial({
                color: material.color,
                metalness: shouldBeMetallic ? 0.8 : 0.0,
                roughness: shouldBeMetallic ? 0.2 : 0.8,
                transparent: material.transparent,
                opacity: material.opacity,
              });
            } else {
              newMaterial = new THREE.MeshStandardMaterial({
                color: (material as any).color || 0x888888,
                metalness: shouldBeMetallic ? 0.8 : 0.0,
                roughness: shouldBeMetallic ? 0.2 : 0.8,
              });
            }

            child.material = newMaterial;
          }
        });
      };

      applyMaterials(fbx);

      if (onMeshNames) onMeshNames(meshNames);
      if (onLoad) onLoad();
    }
  }, [fbx, onLoad, onMeshNames, metallicMeshes]);

  return (
    <primitive
      ref={meshRef}
      object={fbx}
      position={[0, 0, 0]}
      scale={[0.01, 0.01, 0.01]}
    />
  );
};

// Error Boundary for 3D Model
const ModelErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white">
        <div className="text-center">
          <div className="mb-2 text-lg">⚠️</div>
          <div className="text-sm">Failed to load 3D model</div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>{children}</ErrorBoundary>
  );
};

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Apply camera position only when set from control inputs (not every frame, to avoid fighting OrbitControls)
const CameraSync = ({
  position,
  applyOnceRef,
}: {
  position: [number, number, number];
  applyOnceRef: React.MutableRefObject<boolean>;
}) => {
  const { camera } = useThree();
  useFrame(() => {
    if (applyOnceRef.current) {
      camera.position.set(position[0], position[1], position[2]);
      applyOnceRef.current = false;
    }
  });
  return null;
};

// Scene Component
const Scene = ({
  cameraPosition,
  modelRotation,
  enableDragging,
  enableRotation,
  onLoad,
  onMeshNames,
  metallicMeshes,
  onCameraChange,
  cameraPosRef,
  applyCameraFromControlsRef,
}: {
  cameraPosition: [number, number, number];
  cameraZoom: number;
  modelRotation: [number, number, number];
  enableDragging: boolean;
  enableZoom: boolean;
  enableRotation: boolean;
  onLoad: () => void;
  onMeshNames?: (names: string[]) => void;
  metallicMeshes?: Set<string>;
  onCameraChange?: (position: [number, number, number]) => void;
  onModelRotationChange?: (rotation: [number, number, number]) => void;
  cameraPosRef?: React.MutableRefObject<{ x: number; y: number; z: number }>;
  applyCameraFromControlsRef?: React.MutableRefObject<boolean>;
}) => {
  return (
    <>
      <CameraSync
        position={cameraPosition}
        applyOnceRef={applyCameraFromControlsRef ?? { current: false }}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      <Model
        modelPath="/models/StoppedFlute_Square_64.fbx"
        rotation={modelRotation}
        onLoad={onLoad}
        onMeshNames={onMeshNames}
        metallicMeshes={metallicMeshes}
      />

      <OrbitControls
        enablePan={enableDragging}
        enableZoom={true}
        enableRotate={enableRotation}
        minDistance={3}
        maxDistance={50}
        target={[0, 0, 0]}
        onChange={(e) => {
          if (e?.target?.object && cameraPosRef) {
            const pos = e.target.object.position;
            cameraPosRef.current = { x: pos.x, y: pos.y, z: pos.z };
          }
        }}
      />

      <Environment preset="studio" />
    </>
  );
};

/**
 * Props for `SmartValveChest3D`.
 */
type SmartValveChest3DProps = SliceComponentProps<any>;

/**
 * Component for "SmartValveChest3D" Slices.
 */
const SmartValveChest3D: FC<SmartValveChest3DProps> = ({ slice }) => {
  const primary = slice.primary as any;
  const [isLoading, setIsLoading] = useState(true);
  const [meshNames, setMeshNames] = useState<string[]>([]);
  const [metallicMeshes, setMetallicMeshes] = useState<Set<string>>(
    new Set(["Body1"]),
  );
  const initialCamera = {
    x: primary.camera_position_x ?? 0,
    y: primary.camera_position_y ?? 0,
    z: primary.camera_position_z ?? 0,
  };
  const [cameraPos, setCameraPos] = useState(initialCamera);
  const cameraPosRef = React.useRef(initialCamera);
  const applyCameraFromControlsRef = React.useRef(false);
  const [modelRot, setModelRot] = useState(() => ({
    x: primary.model_rotation_x ?? 1,
    y: primary.model_rotation_y ?? 0,
    z: primary.model_rotation_z ?? 0,
  }));
  const [hasInteracted, setHasInteracted] = useState(false);

  const {
    title,
    description,
    background_type,
    background_color,
    background_image,
    camera_position_x = 0,
    camera_position_y = 0,
    camera_position_z = 18,
    camera_zoom = 1,
    model_rotation_x = 0,
    model_rotation_y = 0,
    model_rotation_z = 0,
    enable_dragging = true,
    enable_zoom = true,
    enable_rotation = true,
    show_controls = false,
  } = primary;

  // Section background (matches Story / pipe: optional color or image)
  const sectionStyle =
    background_type === "image" && background_image?.url
      ? { backgroundImage: `url(${background_image.url})` }
      : { backgroundColor: background_color || undefined };

  return (
    <div
      className="relative py-16 sm:py-24 lg:py-32 bg-neutral-950 text-white overflow-hidden"
      style={sectionStyle}
    >
      <Container className="relative z-10">
        <FadeIn>
          {/* Text Content – typography matches SmartProcessor, pipe, Story */}
          <div className="text-center mb-12 lg:mb-16">
            {title && (
              <h2 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight text-white">
                {title}
              </h2>
            )}
            {description && (
              <div className="max-w-3xl mx-auto text-xl text-neutral-400 leading-relaxed">
                <PrismicRichText
                  field={description}
                  components={components}
                />
              </div>
            )}
          </div>

          {/* 3D Model Viewer – onPointerUp syncs camera to state so we don't setState during drag (avoids stutter) */}
          <div
            className="relative h-96 w-full rounded-2xl overflow-hidden bg-neutral-900 sm:h-[500px] lg:h-[600px]"
              onPointerUp={() => {
                setCameraPos({ ...cameraPosRef.current });
                setHasInteracted(true);
              }}
              onPointerLeave={() => setCameraPos({ ...cameraPosRef.current })}
            >
              <Canvas
                camera={{
                  position: [cameraPos.x, cameraPos.y, cameraPos.z],
                  fov: 75,
                  near: 0.1,
                  far: 1000,
                }}
                style={{ background: "transparent" }}
                onPointerDown={() => setHasInteracted(true)}
                onWheel={() => setHasInteracted(true)}
              >
                <Suspense fallback={null}>
                  <ModelErrorBoundary>
                    <Scene
                      cameraPosition={[cameraPos.x, cameraPos.y, cameraPos.z]}
                      cameraZoom={camera_zoom}
                      modelRotation={[modelRot.x, modelRot.y, modelRot.z]}
                      enableDragging={enable_dragging}
                      enableZoom={enable_zoom}
                      enableRotation={enable_rotation}
                      onLoad={() => setIsLoading(false)}
                      onMeshNames={setMeshNames}
                      metallicMeshes={metallicMeshes}
                      cameraPosRef={cameraPosRef}
                      applyCameraFromControlsRef={applyCameraFromControlsRef}
                    />
                  </ModelErrorBoundary>
                </Suspense>
              </Canvas>

              {/* Apple-Level Interaction Elegance */}
              <AppleInteractionElegance
                isVisible={!isLoading}
                hasInteracted={hasInteracted}
              />

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center  text-white pointer-events-none">
                  <div className="text-center">
                    <div className="mb-2 text-sm">Loading 3D Model...</div>
                    <div className="h-1 w-32 rounded-full ">
                      <div className="h-full w-1/3 rounded-full bg-white animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Camera & Model controls – visible when show_controls is true in Prismic */}
              {show_controls && (
                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-4 rounded-lg bg-black/90 px-4 py-3 font-mono text-xs text-white/90 backdrop-blur sm:right-auto sm:max-w-none sm:flex-row">
                  {/* Camera */}
                  <div className="min-w-0 flex-1 rounded border border-white/20 bg-white/5 p-3">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                      Camera
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <label className="flex flex-col gap-0.5">
                        <span className="text-white/50">camera_position_x</span>
                        <input
                          type="number"
                          step="0.1"
                          value={cameraPos.x}
                          onChange={(e) => {
                            const x = Number(e.target.value) || 0;
                            setCameraPos((p) => ({ ...p, x }));
                            cameraPosRef.current = {
                              ...cameraPosRef.current,
                              x,
                            };
                            applyCameraFromControlsRef.current = true;
                          }}
                          className="w-full rounded border border-white/20 bg-black/50 px-2 py-1 text-white focus:border-white/50 focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-white/50">camera_position_y</span>
                        <input
                          type="number"
                          step="0.1"
                          value={cameraPos.y}
                          onChange={(e) => {
                            const y = Number(e.target.value) || 0;
                            setCameraPos((p) => ({ ...p, y }));
                            cameraPosRef.current = {
                              ...cameraPosRef.current,
                              y,
                            };
                            applyCameraFromControlsRef.current = true;
                          }}
                          className="w-full rounded border border-white/20 bg-black/50 px-2 py-1 text-white focus:border-white/50 focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-white/50">camera_position_z</span>
                        <input
                          type="number"
                          step="0.1"
                          value={cameraPos.z}
                          onChange={(e) => {
                            const z = Number(e.target.value) || 0;
                            setCameraPos((p) => ({ ...p, z }));
                            cameraPosRef.current = {
                              ...cameraPosRef.current,
                              z,
                            };
                            applyCameraFromControlsRef.current = true;
                          }}
                          className="w-full rounded border border-white/20 bg-black/50 px-2 py-1 text-white focus:border-white/50 focus:outline-none"
                        />
                      </label>
                    </div>
                  </div>
                  {/* Model */}
                  <div className="min-w-0 flex-1 rounded border border-white/20 bg-white/5 p-3">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                      Model
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <label className="flex flex-col gap-0.5">
                        <span className="text-white/50">model_rotation_x</span>
                        <input
                          type="number"
                          step="0.01"
                          value={modelRot.x}
                          onChange={(e) =>
                            setModelRot((p) => ({
                              ...p,
                              x: Number(e.target.value) || 0,
                            }))
                          }
                          className="w-full rounded border border-white/20 bg-black/50 px-2 py-1 text-white focus:border-white/50 focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-white/50">model_rotation_y</span>
                        <input
                          type="number"
                          step="0.01"
                          value={modelRot.y}
                          onChange={(e) =>
                            setModelRot((p) => ({
                              ...p,
                              y: Number(e.target.value) || 0,
                            }))
                          }
                          className="w-full rounded border border-white/20 bg-black/50 px-2 py-1 text-white focus:border-white/50 focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-white/50">model_rotation_z</span>
                        <input
                          type="number"
                          step="0.01"
                          value={modelRot.z}
                          onChange={(e) =>
                            setModelRot((p) => ({
                              ...p,
                              z: Number(e.target.value) || 0,
                            }))
                          }
                          className="w-full rounded border border-white/20 bg-black/50 px-2 py-1 text-white focus:border-white/50 focus:outline-none"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls hint – matches pipe / SmartProcessor hint style */}
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-6 text-neutral-400">
                <span className="text-xs font-light tracking-[0.1em] uppercase">
                  Drag to move
                </span>
                <span className="w-px h-3 bg-neutral-600" aria-hidden />
                <span className="text-xs font-light tracking-[0.1em] uppercase">
                  Drag to rotate
                </span>
              </div>
            </div>
        </FadeIn>
      </Container>
    </div>
  );
};

export default SmartValveChest3D;
