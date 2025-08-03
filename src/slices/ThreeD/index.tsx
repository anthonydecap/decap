"use client";

import { type FC, useRef, useEffect, useState, Suspense } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { SectionIntro } from "@/components/SectionIntro";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useFBX } from "@react-three/drei";
import * as THREE from "three";
import { useScroll } from "framer-motion";
import clsx from "clsx";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code>{children}</code>;
    }
  },
};

interface ModelProps {
  url: string;
  animationType: string;
  animationSpeed: string;
  enableAutoRotation: boolean;
  scrollIntensity: number;
  cameraAngle: string;
}

// Fallback component for when FBX fails to load
const FallbackMicrophone = () => (
  <mesh>
    <boxGeometry args={[2, 3, 0.5]} />
    <meshStandardMaterial color="#404040" />
    <mesh position={[0, 0, 0.3]}>
      <cylinderGeometry args={[0.1, 0.1, 2]} />
      <meshStandardMaterial color="#202020" />
    </mesh>
  </mesh>
);

const Model: FC<ModelProps> = ({
  url,
  animationType,
  animationSpeed,
  enableAutoRotation,
  scrollIntensity,
  cameraAngle,
}) => {
  const modelRef = useRef<THREE.Group>(null);
  const { scrollYProgress } = useScroll();
  const [scrollY, setScrollY] = useState(0);
  
  // Always call hooks at the top level
  const fbx = useFBX(url);
  
  // Speed multipliers
  const speedMultipliers = {
    slow: 0.5,
    medium: 1.0,
    fast: 2.0,
  };
  
  const speed = speedMultipliers[animationSpeed as keyof typeof speedMultipliers] || 1.0;
  
  // Listen to scroll changes
  useEffect(() => {
    if (!scrollYProgress) return;
    const unsubscribe = scrollYProgress.on("change", (latest: number) => {
      setScrollY(latest);
    });
    return unsubscribe;
  }, [scrollYProgress]);
  
  // Animation loop
  useFrame((state) => {
    if (!modelRef.current) return;
    
    const time = state.clock.getElapsedTime() * speed;
    const scroll = scrollY * scrollIntensity;
    
    // Apply different animation types based on scroll
    switch (animationType) {
      case "float":
        modelRef.current.position.y = Math.sin(time) * 0.5 + scroll * 2;
        modelRef.current.rotation.x = scroll * Math.PI * 0.5;
        modelRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
        break;
        
      case "rotate_complex":
        modelRef.current.rotation.x = scroll * Math.PI + Math.sin(time * 0.3) * 0.2;
        modelRef.current.rotation.y = time * 0.5 + scroll * Math.PI * 2;
        modelRef.current.rotation.z = Math.cos(time * 0.7) * 0.1;
        break;
        
      case "wave":
        modelRef.current.position.x = Math.sin(time + scroll * 5) * 0.3;
        modelRef.current.position.y = Math.cos(time * 0.7 + scroll * 3) * 0.2;
        modelRef.current.rotation.y = time * 0.3 + scroll * Math.PI;
        break;
        
      case "parallax":
        modelRef.current.position.z = scroll * 5;
        modelRef.current.rotation.x = scroll * Math.PI * 0.3;
        modelRef.current.rotation.y = scroll * Math.PI * 0.5;
        break;
        
      case "zoom_rotate":
        const scale = 1 + scroll * 0.5;
        modelRef.current.scale.set(scale, scale, scale);
        modelRef.current.rotation.y = time * 0.5 + scroll * Math.PI * 3;
        modelRef.current.rotation.x = Math.sin(time + scroll * 2) * 0.3;
        break;
        
      case "spiral":
        const radius = 1 + scroll * 2;
        modelRef.current.position.x = Math.cos(time + scroll * 10) * radius;
        modelRef.current.position.z = Math.sin(time + scroll * 10) * radius;
        modelRef.current.position.y = scroll * 3;
        modelRef.current.rotation.y = time + scroll * Math.PI * 2;
        break;
        
      default:
        if (enableAutoRotation) {
          modelRef.current.rotation.y = time * 0.5;
        }
    }
  });
  
  // Position model based on camera angle
  useEffect(() => {
    if (!modelRef.current) return;
    
    switch (cameraAngle) {
      case "front":
        modelRef.current.position.set(0, 0, 0);
        break;
      case "side":
        modelRef.current.rotation.y = Math.PI / 2;
        break;
      case "angle":
        modelRef.current.rotation.y = Math.PI / 4;
        break;
      case "top":
        modelRef.current.rotation.x = -Math.PI / 4;
        break;
    }
  }, [cameraAngle]);
  
  // Scale the model appropriately (FBX models are often very large)
  useEffect(() => {
    if (fbx) {
      // Calculate bounding box to auto-scale
      const box = new THREE.Box3().setFromObject(fbx);
      const size = box.getSize(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      
      if (maxSize > 0) {
        const scale = 2 / maxSize; // Scale to fit in a 2 unit cube
        fbx.scale.set(scale, scale, scale);
        
        // Center the model
        const center = box.getCenter(new THREE.Vector3());
        fbx.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
      }
    }
  }, [fbx]);
  
  // Debug logging
  useEffect(() => {
    if (fbx) {
      console.log("FBX Model loaded successfully:", fbx);
    } else {
      console.log("FBX Model URL:", url);
    }
  }, [fbx, url]);
  
  return (
    <group ref={modelRef}>
      {fbx && <primitive object={fbx} />}
    </group>
  );
};

// Error boundary component
const ModelWithErrorBoundary: FC<ModelProps> = (props) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = () => {
      console.error("FBX loading failed, showing fallback");
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return <FallbackMicrophone />;
  }
  
  return <Model {...props} />;
};

interface LightingSetupProps {
  lighting: string;
}

const LightingSetup: FC<LightingSetupProps> = ({ lighting }) => {
  switch (lighting) {
    case "studio":
      return (
        <>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />
        </>
      );
      
    case "dramatic":
      return (
        <>
          <ambientLight intensity={0.2} />
          <spotLight position={[0, 20, 0]} angle={0.3} penumbra={1} intensity={2} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
        </>
      );
      
    case "soft":
      return (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[0, 10, 0]} intensity={0.8} />
          <hemisphereLight args={["#ffffff", "#444444", 0.5]} />
        </>
      );
      
    case "environment":
      return (
        <>
          <Environment preset="studio" />
          <ambientLight intensity={0.3} />
        </>
      );
      
    default:
      return (
        <>
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 10, 5]} intensity={1} />
        </>
      );
  }
};

// HTML loading component (outside Canvas)
const LoadingFallback = () => (
  <div className="flex h-full items-center justify-center bg-neutral-100 rounded-3xl">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neutral-950 mx-auto mb-4"></div>
      <p className="text-neutral-600">Loading 3D Model...</p>
      <p className="text-xs text-neutral-400 mt-2">This may take a moment</p>
    </div>
  </div>
);

/**
 * Component for "ThreeD" Slices.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ThreeD: FC<SliceComponentProps<any>> = ({ slice }) => {
  const {
    title,
    eyebrow,
    description,
    model_file,
    animation_type,
    animation_speed,
    background_color,
    lighting,
    camera_angle,
    enable_auto_rotation,
    scroll_intensity,
  } = slice.primary;

  const backgroundClasses = {
    transparent: "bg-transparent",
    dark: "bg-neutral-950",
    gradient: "bg-gradient-to-br from-neutral-100 to-neutral-200",
  };

  const bgColor = background_color || "transparent";

  // Check if model file exists and has URL
  const modelUrl = model_file?.url || null;
  const modelName = model_file?.name || "FBX File";

  // Debug logging
  console.log("Model URL:", modelUrl);
  console.log("Model File Object:", model_file);

  if (!modelUrl) {
    return (
      <Container className="mt-8 sm:mt-12 lg:mt-16">
        <FadeIn>
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-neutral-950">
              No 3D model uploaded
            </h2>
            <p className="mt-4 text-neutral-600">
              Please upload an FBX file to display the 3D model.
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Debug info: {JSON.stringify(model_file, null, 2)}
            </p>
          </div>
        </FadeIn>
      </Container>
    );
  }

  return (
    <div className={clsx("relative", backgroundClasses[bgColor as keyof typeof backgroundClasses])}>
      <Container className="mt-8 sm:mt-12 lg:mt-16">
        <FadeIn>
          {(title || eyebrow || description) && (
            <div className="text-center mb-16">
              <SectionIntro title={title || ""} eyebrow={eyebrow || ""} invert={bgColor === "dark"}>
                {description && (
                  <PrismicRichText field={description} components={components} />
                )}
              </SectionIntro>
            </div>
          )}
          
          <div className="relative h-[600px] sm:h-[700px] lg:h-[800px] rounded-3xl overflow-hidden">
            <Suspense fallback={<LoadingFallback />}>
              <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                className="w-full h-full"
              >
                <ModelWithErrorBoundary
                  url={modelUrl}
                  animationType={animation_type || "float"}
                  animationSpeed={animation_speed || "medium"}
                  enableAutoRotation={enable_auto_rotation !== false}
                  scrollIntensity={scroll_intensity || 1.0}
                  cameraAngle={camera_angle || "angle"}
                />
                <LightingSetup lighting={lighting || "studio"} />
                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  enableRotate={true}
                  autoRotate={enable_auto_rotation !== false}
                  autoRotateSpeed={0.5}
                />
              </Canvas>
            </Suspense>
            
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 text-sm text-neutral-400">
                Drag to rotate • Scroll to zoom • Scroll page for animations
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-neutral-500">
              <span>Model:</span>
              <span className="font-medium">{modelName}</span>
            </div>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
};

export default ThreeD; 