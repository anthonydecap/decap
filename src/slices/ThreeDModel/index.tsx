/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { type FC, Suspense, useRef, useState, useEffect } from "react";
import { type Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
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
        <div className="w-full h-full rounded-full border border-white/8 relative">
          <div
            className="absolute inset-0 rounded-full border border-white/4 animate-pulse"
            style={{ animationDuration: "8s" }}
          ></div>
        </div>
      </div>

      {/* Elegant rotation arrows - Apple-style with subtle animations */}
      <div className="absolute inset-0">
        {/* Top arrow */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <svg
            className="w-6 h-6 text-white/30 animate-pulse"
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
            className="w-6 h-6 text-white/30 transform rotate-90 animate-pulse"
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
            className="w-6 h-6 text-white/30 transform -rotate-90 animate-pulse"
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
            className="w-6 h-6 text-white/30 transform rotate-180 animate-pulse"
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
        <div className="w-0.5 h-0.5 bg-white/20 rounded-full"></div>
      </div>
    </div>
  );
};

// 3D Model Component
const Model = ({
  modelPath,
  rotation,
  position = [0, 0, 0],
  onLoad,
  onMeshNames,
  metallicMeshes,
}: {
  modelPath: string;
  rotation: [number, number, number];
  position?: [number, number, number];
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

  // Collect mesh names and apply materials
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

            // Check if this mesh should be metallic
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

      // Send mesh names to parent
      if (onMeshNames) {
        onMeshNames(meshNames);
      }

      if (onLoad) {
        onLoad();
      }
    }
  }, [fbx, onLoad, onMeshNames, metallicMeshes]);

  return (
    <primitive
      ref={meshRef}
      object={fbx}
      position={position}
      scale={[0.01, 0.01, 0.01]} // Scale down FBX models as they're usually large
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

// Scene Component
const Scene = ({
  cameraPosition,
  cameraZoom,
  modelRotation,
  enableDragging,
  enableZoom,
  enableRotation,
  onLoad,
  onMeshNames,
  metallicMeshes,
  onCameraChange,
  onModelRotationChange,
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
}) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      <Model
        modelPath="/models/OX-SA001-XX (Brass Core) v41.fbx"
        rotation={modelRotation}
        onLoad={onLoad}
        onMeshNames={onMeshNames}
        metallicMeshes={metallicMeshes}
      />

      <OrbitControls
        enablePan={enableDragging}
        enableZoom={false}
        enableRotate={enableRotation}
        minDistance={1}
        maxDistance={20}
        target={[0, 0, 0]}
        onChange={(e) => {
          if (onCameraChange && e?.target?.object) {
            const pos = e.target.object.position;
            onCameraChange([pos.x, pos.y, pos.z]);
          }
        }}
      />

      <Environment preset="studio" />
    </>
  );
};

/**
 * Props for `ThreeDModel`.
 */
type ThreeDModelProps = SliceComponentProps<Content.ThreeDModelSlice>;

/**
 * Component for "ThreeDModel" Slices.
 */
const ThreeDModel: FC<ThreeDModelProps> = ({ slice }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [meshNames, setMeshNames] = useState<string[]>([]);
  const [metallicMeshes, setMetallicMeshes] = useState<Set<string>>(
    new Set(["Body1"])
  );
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 5 });
  const [modelRot, setModelRot] = useState({ x: 0, y: 0, z: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);

  const {
    title,
    description,
    background_type,
    background_color,
    background_image,
    camera_position_x = 0,
    camera_position_y = 0,
    camera_position_z = 5,
    camera_zoom = 1,
    model_rotation_x = 0,
    model_rotation_y = 0,
    model_rotation_z = 0,
    enable_dragging = true,
    enable_zoom = true,
    enable_rotation = true,
  } = slice.primary as any;

  // Background style
  const backgroundStyle =
    background_type === "image" && background_image?.url
      ? { backgroundImage: `url(${background_image.url})` }
      : { backgroundColor: background_color || "#1a1a1a" };

  return (
    <Container className="py-24 sm:py-32 ">
      <FadeIn
        className="-mx-6 rounded-4xl px-6 py-20 sm:mx-0 sm:py-24 md:px-12 shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]"
        style={backgroundStyle}
      >
        <div className="mx-auto max-w-6xl">
          {/* Text Content */}
          <div className="mb-12 max-w">
            {title && (
              <h2 className="font-display text-3xl font-medium text-white sm:text-4xl text-center max-w-4xl mx-auto">
                {title}
              </h2>
            )}
            {description && (
              <div className="mt-6 text-base text-neutral-300">
                <PrismicRichText field={description} components={components} />
              </div>
            )}
          </div>

          {/* 3D Model Viewer */}
          <div className="relative h-96 w-full rounded-2xl backdrop-blur-sm sm:h-[500px] lg:h-[600px]">
            <Canvas
              camera={{
                position: [
                  camera_position_x,
                  camera_position_y,
                  camera_position_z,
                ],
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
                    onCameraChange={(pos) => {
                      setCameraPos({ x: pos[0], y: pos[1], z: pos[2] });
                      setHasInteracted(true);
                    }}
                    onModelRotationChange={(rot) => {
                      setModelRot({ x: rot[0], y: rot[1], z: rot[2] });
                      setHasInteracted(true);
                    }}
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
          </div>

                     {/* Apple-Style Controls Info */}
           <div className="mt-12 text-center">
             <div className="inline-flex items-center space-x-8">
               <div className="flex items-center space-x-3">
                 <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                 <span className="text-white/50 text-xs font-light tracking-[0.1em] uppercase">Drag to move</span>
               </div>
               <div className="w-px h-3 bg-white/20"></div>
               <div className="flex items-center space-x-3">
                 <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                 <span className="text-white/50 text-xs font-light tracking-[0.1em] uppercase">Drag to rotate</span>
               </div>
              
             </div>
           </div>
        </div>
      </FadeIn>
    </Container>
  );
};

export default ThreeDModel;
