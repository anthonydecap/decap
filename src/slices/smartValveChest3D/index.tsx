/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { type FC, Suspense, useRef, useState } from "react";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import * as THREE from "three";

const components: JSXMapSerializer = {
  hyperlink: ({ children }) => (
    <span className="text-blue-600 underline">{children}</span>
  ),
};

// Interaction hint overlay (hidden when loading)
const AppleInteractionElegance = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Apple-style precision ring - barely visible but perfect */}
      <div className="absolute inset-0">
        <div className="w-full h-full rounded-full border border-neutral-400 relative">
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
            className="w-6 h-6 text-neutral-400 animate-pulse"
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
            className="w-6 h-6 text-neutral-400 transform rotate-90 animate-pulse"
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
            className="w-6 h-6 text-neutral-400 transform -rotate-90 animate-pulse"
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
            className="w-6 h-6 text-neutral-400 transform rotate-180 animate-pulse"
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

// Resolve model URL from site root so it never gets /en/ or locale prefixed (fixes 404 with i18n routes)
function getAbsoluteModelUrl(path: string): string {
  if (typeof window === "undefined") return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${normalized}`;
}

// 3D Model Component – rotation from Prismic; materials/lighting unchanged
const Model = ({
  modelPath,
  rotation,
  onLoad,
  metallicMeshes,
}: {
  modelPath: string;
  rotation: [number, number, number];
  onLoad?: () => void;
  metallicMeshes: Set<string>;
}) => {
  const absoluteUrl = getAbsoluteModelUrl(modelPath);
  const fbx = useLoader(FBXLoader, absoluteUrl);
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
      const applyMaterials = (obj: THREE.Object3D) => {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const meshName = child.name || "unnamed_mesh";

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
      if (onLoad) onLoad();
    }
  }, [fbx, onLoad, metallicMeshes]);

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
const ModelErrorBoundary = ({
  children,
  onWebGLError,
}: {
  children: React.ReactNode;
  onWebGLError?: () => void;
}) => {
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
    <ErrorBoundary
      onError={(error) => {
        setHasError(true);
        // Check if it's a WebGL error
        if (
          error?.message?.includes("WebGL") ||
          error?.message?.includes("webgl") ||
          error?.message?.includes("context")
        ) {
          onWebGLError?.();
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    onError: (error?: Error) => void;
  },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    onError: (error?: Error) => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
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

// Scene: lights, model, orbit. No rendering/lighting/texture changes.
const Scene = ({
  cameraPosition,
  modelRotation,
  enableDragging,
  enableZoom,
  enableRotation,
  onLoad,
  metallicMeshes,
  cameraPosRef,
  applyCameraFromControlsRef,
}: {
  cameraPosition: [number, number, number];
  modelRotation: [number, number, number];
  enableDragging: boolean;
  enableZoom: boolean;
  enableRotation: boolean;
  onLoad: () => void;
  metallicMeshes: Set<string>;
  cameraPosRef: React.MutableRefObject<{ x: number; y: number; z: number }>;
  applyCameraFromControlsRef: React.MutableRefObject<boolean>;
}) => {
  return (
    <>
      <CameraSync
        position={cameraPosition}
        applyOnceRef={applyCameraFromControlsRef}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      <Model
        modelPath="/models/StoppedFlute_Square_64.fbx"
        rotation={modelRotation}
        onLoad={onLoad}
        metallicMeshes={metallicMeshes}
      />

      <OrbitControls
        enablePan={enableDragging}
        enableZoom={enableZoom}
        enableRotate={enableRotation}
        minDistance={5}
        maxDistance={60}
        target={[0, 16.5, 0]}
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
// Meshes that get metallic material (rest stay matte) – used by Model only
const METALLIC_MESHES = new Set(["Body1"]);

// Check WebGL availability (does not retain a context – we create and release immediately)
const checkWebGLAvailability = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    const ext = gl.getExtension("WEBGL_lose_context");
    if (ext) ext.loseContext();
    return true;
  } catch {
    return false;
  }
};

// Releases WebGL context when Canvas unmounts so the browser can reuse it (avoids "no WebGL" after many reloads)
const WebGLContextReleaser = () => {
  const { gl: renderer } = useThree();
  React.useEffect(() => {
    return () => {
      try {
        const ctx = renderer.getContext?.() as WebGLRenderingContext | undefined;
        if (ctx) {
          const ext = ctx.getExtension("WEBGL_lose_context");
          if (ext) ext.loseContext();
        }
      } catch {
        // ignore
      }
      if (typeof renderer.dispose === "function") renderer.dispose();
    };
  }, [renderer]);
  return null;
};

const SmartValveChest3D: FC<SmartValveChest3DProps> = ({ slice }) => {
  const primary = slice.primary as any;
  const [isLoading, setIsLoading] = useState(true);
  const [webglError, setWebglError] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  React.useEffect(() => {
    setWebglAvailable(checkWebGLAvailability());

    // Listen for WebGL context lost events
    const handleWebGLContextLost = (event: Event) => {
      event.preventDefault();
      setWebglError(true);
      setIsLoading(false);
    };

    const handleWebGLContextRestored = () => {
      setWebglError(false);
      setWebglAvailable(checkWebGLAvailability());
    };

    // Add global error handler for WebGL errors
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes("WebGL") ||
        event.message?.includes("webgl") ||
        event.message?.includes("context") ||
        event.message?.includes("BindToCurrentSequence")
      ) {
        setWebglError(true);
        setIsLoading(false);
      }
    };

    window.addEventListener("webglcontextlost", handleWebGLContextLost);
    window.addEventListener("webglcontextrestored", handleWebGLContextRestored);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("webglcontextlost", handleWebGLContextLost);
      window.removeEventListener(
        "webglcontextrestored",
        handleWebGLContextRestored
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  const initialCamera = {
    x: Number(primary.camera_position_x) || 0,
    y: Number(primary.camera_position_y) || 0,
    z: Number(primary.camera_position_z) || 26,
  };
  const [cameraPos, setCameraPos] = useState(initialCamera);
  const cameraPosRef = React.useRef(initialCamera);
  const applyCameraFromControlsRef = React.useRef(false);

  const [modelRot, setModelRot] = useState(() => ({
    x: Number(primary.model_rotation_x) || 0,
    y: Number(primary.model_rotation_y) || 0,
    z: Number(primary.model_rotation_z) || 0,
  }));

  const title = primary.title;
  const description = primary.description;
  const background_color = primary.background_color;
  const background_image = primary.background_image;
  const fallback_image = primary.fallback_image;
  const enable_dragging = primary.enable_dragging !== false;
  const enable_zoom = primary.enable_zoom !== false;
  const enable_rotation = primary.enable_rotation !== false;
  const show_controls = false;

  const sectionStyle = background_image?.url
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

          {/* 3D Model Viewer – clipped to rounded frame so model stays inside borders */}
          <div
            className="relative h-96 w-full rounded-2xl overflow-hidden bg-neutral-900 sm:h-[500px] lg:h-[600px]"
            onPointerUp={() => setCameraPos({ ...cameraPosRef.current })}
            onPointerLeave={() => setCameraPos({ ...cameraPosRef.current })}
          >
            {/* Clipping wrapper: forces canvas (and overlays) to respect rounded corners */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl [isolation:isolate] ">
              {webglAvailable === true && !webglError ? (
                <Canvas
                  camera={{
                    position: [cameraPos.x, cameraPos.y, cameraPos.z],
                    fov: 75,
                    near: 0.1,
                    far: 1000,
                  }}
                  style={{
                    background: "transparent",
                    borderRadius: "1rem",
                    display: "block",
                  }}
                  onPointerDown={() => {}}
                  onWheel={() => {}}
                  onCreated={({ gl }) => {
                    // Check if WebGL context was created successfully
                    if (!gl.getContext()) {
                      setWebglError(true);
                      setIsLoading(false);
                    }
                  }}
                  gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                    failIfMajorPerformanceCaveat: false,
                  }}
                  onError={(error) => {
                    console.error("Canvas error:", error);
                    setWebglError(true);
                    setIsLoading(false);
                  }}
                >
                  <WebGLContextReleaser />
                  <Suspense fallback={null}>
                    <ModelErrorBoundary
                      onWebGLError={() => {
                        setWebglError(true);
                        setIsLoading(false);
                      }}
                    >
                      <Scene
                        cameraPosition={[cameraPos.x, cameraPos.y, cameraPos.z]}
                        modelRotation={[modelRot.x, modelRot.y, modelRot.z]}
                        enableDragging={enable_dragging}
                        enableZoom={enable_zoom}
                        enableRotation={enable_rotation}
                        onLoad={() => setIsLoading(false)}
                        metallicMeshes={METALLIC_MESHES}
                        cameraPosRef={cameraPosRef}
                        applyCameraFromControlsRef={applyCameraFromControlsRef}
                      />
                    </ModelErrorBoundary>
                  </Suspense>
                </Canvas>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-neutral-900">
                  {fallback_image?.url ? (
                    <>
                      <PrismicNextImage
                        field={fallback_image}
                        className="w-full h-full object-contain"
                      />
                      <p className="absolute bottom-4 left-4 right-4 text-center text-xs text-neutral-500">
                        3D viewer unavailable — showing image
                      </p>
                    </>
                  ) : background_image?.url ? (
                    <>
                      <PrismicNextImage
                        field={background_image}
                        className="w-full h-full object-cover"
                      />
                      <p className="absolute bottom-4 left-4 right-4 text-center text-xs text-neutral-500">
                        3D viewer unavailable — showing image
                      </p>
                    </>
                  ) : (
                    <div className="text-center px-6">
                      <div className="mb-3 text-4xl opacity-60">◇</div>
                      <div className="text-sm font-medium text-neutral-300">
                        3D viewer unavailable
                      </div>
                      <div className="mt-2 text-xs text-neutral-500 max-w-xs">
                        WebGL is disabled or not supported. The rest of this page works normally — try enabling WebGL or use another browser for the 3D model.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {webglAvailable === true && !webglError && (
              <AppleInteractionElegance isVisible={!isLoading} />
            )}

              {/* Loading overlay */}
              {webglAvailable === true && !webglError && isLoading && (
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
