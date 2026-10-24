import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface UtThreeSceneProps {
  blockType: 'iiw_v1' | 'step_wedge' | 'angle_weld' | 'mt_yoke';
  // UT probe properties
  probePositionMm: number; // position on block surface
  probeAngleDeg: number;   // 0 (normal), 45, 60, 70
  probePreset?: 'A' | 'B' | 'C' | 'D'; // IIW positions
  selectedStep?: number;   // 1 to 5 for step wedge
  // Inspection parameters
  plateThicknessMm?: number;
  defectLocationMm?: number;
  defectDetected?: boolean;
  // MT parameters
  isYokeEnergized?: boolean;
  areParticlesApplied?: boolean;
  crackAngleDeg?: number; // 90 = perpendicular, 0 = parallel
}

export const UtThreeScene: React.FC<UtThreeSceneProps> = ({
  blockType,
  probePositionMm,
  probeAngleDeg,
  probePreset = 'B',
  selectedStep = 1,
  plateThicknessMm = 20,
  defectLocationMm = 40,
  defectDetected = false,
  isYokeEnergized = false,
  areParticlesApplied = false,
  crackAngleDeg = 90
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to keep track of mutable Three.js objects across props updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const probeGroupRef = useRef<THREE.Group | null>(null);
  const soundBeamRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  const fluxLinesGroupRef = useRef<THREE.Group | null>(null);
  const defectMeshRef = useRef<THREE.Mesh | null>(null);

  // Camera Orbit controls state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 24, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Detect software WebGL per Three.js skill
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a1a);
    sceneRef.current = scene;

    // Camera setup
    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const updateCameraPos = () => {
      const { radius, theta, phi } = cameraSphericalRef.current;
      camera.position.x = targetLookAt.current.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = targetLookAt.current.y + radius * Math.cos(phi);
      camera.position.z = targetLookAt.current.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(targetLookAt.current);
    };
    updateCameraPos();

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // Procedural RoomEnvironment for realistic brushed steel and metal reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    try {
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.05).texture;
    } catch {
      // fallback
    }
    pmremGenerator.dispose();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff5e6, 2.4);
    dirLight1.position.set(15, 25, 20);
    dirLight1.castShadow = !isSoftwareGl;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x88bbff, 1.2);
    dirLight2.position.set(-15, 12, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, 1.5, 30);
    pointLight.position.set(0, 10, 5);
    scene.add(pointLight);

    // Ground reflective grid plate
    const gridHelper = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -4;
    scene.add(gridHelper);

    // Root model group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // Animation frame loop
    let animId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle pulse on sound beam
      if (soundBeamRef.current) {
        soundBeamRef.current.children.forEach((child, idx) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            const baseOpacity = child.userData.baseOpacity || 0.6;
            child.material.opacity = baseOpacity + Math.sin(elapsedTime * 6 + idx) * 0.15;
          }
        });
      }

      // Magnetic flux pulse
      if (fluxLinesGroupRef.current && isYokeEnergized) {
        fluxLinesGroupRef.current.children.forEach((line, idx) => {
          if (line instanceof THREE.Line && line.material instanceof THREE.LineBasicMaterial) {
            line.material.opacity = 0.5 + Math.sin(elapsedTime * 12 + idx) * 0.4;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handling
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(mount);

    // Mouse / Touch orbit controls
    const dom = renderer.domElement;
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraSphericalRef.current.theta -= deltaX * 0.008;
      cameraSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, cameraSphericalRef.current.phi - deltaY * 0.008)
      );

      updateCameraPos();
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSphericalRef.current.radius = Math.max(
        8,
        Math.min(45, cameraSphericalRef.current.radius + e.deltaY * 0.02)
      );
      updateCameraPos();
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      resizeObserver.disconnect();

      // Dispose Three.js objects
      scene.clear();
      renderer.dispose();
      if (mount.contains(dom)) {
        mount.removeChild(dom);
      }
    };
  }, []);

  // Re-build 3D Scene when blockType or geometry changes
  useEffect(() => {
    const root = rootGroupRef.current;
    if (!root) return;

    // Clear previous children
    while (root.children.length > 0) {
      const obj = root.children[0];
      root.remove(obj);
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }
    }

    // Reset references
    probeGroupRef.current = null;
    soundBeamRef.current = null;
    particlesGroupRef.current = null;
    fluxLinesGroupRef.current = null;
    defectMeshRef.current = null;

    // Common PBR Materials
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25,
      envMapIntensity: 1.2
    });

    const polishedSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.95,
      roughness: 0.12,
      envMapIntensity: 1.5
    });

    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.3
    });

    const perspexMaterial = new THREE.MeshStandardMaterial({
      color: 0xa5f3fc,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75
    });

    const probeBodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.4,
      roughness: 0.4
    });

    const probeWearPlateMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1
    });

    const cableMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.8
    });

    // -------------------------------------------------------------
    // BLOCK 1: IIW TYPE 1 (V1) CALIBRATION BLOCK
    // Standard ASME Sec V / ISO 2400 reference block
    // -------------------------------------------------------------
    if (blockType === 'iiw_v1') {
      const iiwGroup = new THREE.Group();

      // Main Block Body (300 x 100 x 25 mm scale normalized: 14 x 4.6 x 1.2)
      const blockLength = 14;
      const blockHeight = 4.6;
      const blockDepth = 1.2;

      // Steel Main Slab
      const slabGeo = new THREE.BoxGeometry(blockLength, blockHeight, blockDepth);
      const slabMesh = new THREE.Mesh(slabGeo, steelMaterial);
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      iiwGroup.add(slabMesh);

      // Curved Arc End (100 mm radius equivalent)
      const arcGeo = new THREE.CylinderGeometry(
        blockHeight * 0.95,
        blockHeight * 0.95,
        blockDepth,
        32,
        1,
        false,
        -Math.PI / 2,
        Math.PI
      );
      arcGeo.rotateX(Math.PI / 2);
      const arcMesh = new THREE.Mesh(arcGeo, polishedSteelMaterial);
      arcMesh.position.set(-blockLength / 2, 0, 0);
      arcMesh.castShadow = true;
      iiwGroup.add(arcMesh);

      // 1.5 mm Through Hole (Side Drilled Hole at 15 mm depth)
      const sdhGeo = new THREE.CylinderGeometry(0.12, 0.12, blockDepth + 0.1, 16);
      sdhGeo.rotateX(Math.PI / 2);
      const sdhMat = new THREE.MeshBasicMaterial({ color: 0x030712 });
      const sdhMesh = new THREE.Mesh(sdhGeo, sdhMat);
      sdhMesh.position.set(2.5, 0.8, 0);
      iiwGroup.add(sdhMesh);

      // 50 mm Perspex Cylinder Insert
      const perspexGeo = new THREE.CylinderGeometry(1.2, 1.2, blockDepth + 0.05, 32);
      perspexGeo.rotateX(Math.PI / 2);
      const perspexMesh = new THREE.Mesh(perspexGeo, perspexMaterial);
      perspexMesh.position.set(-2, -0.6, 0);
      iiwGroup.add(perspexMesh);

      // 25 mm Step cut-out
      const stepCutGeo = new THREE.BoxGeometry(2.5, 1.2, blockDepth + 0.05);
      const stepCutMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.4 });
      const stepCutMesh = new THREE.Mesh(stepCutGeo, stepCutMat);
      stepCutMesh.position.set(5.5, -1.7, 0);
      iiwGroup.add(stepCutMesh);

      // Engraved Scale Markings / Degree ticks on arc
      for (let deg = 40; deg <= 75; deg += 5) {
        const rad = (deg * Math.PI) / 180;
        const tickGeo = new THREE.BoxGeometry(0.04, 0.35, blockDepth + 0.02);
        const tickMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
        const tickMesh = new THREE.Mesh(tickGeo, tickMat);
        const arcR = blockHeight * 0.95;
        tickMesh.position.set(-blockLength / 2 + Math.cos(rad) * arcR * 0.9, Math.sin(rad) * arcR * 0.9, 0);
        tickMesh.rotation.z = rad - Math.PI / 2;
        iiwGroup.add(tickMesh);
      }

      root.add(iiwGroup);

      // -----------------------------------------------------------
      // Transducer Probe Assembly
      // -----------------------------------------------------------
      const probeGroup = new THREE.Group();

      // Probe Casing (knurled cylinder)
      const probeCasingGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.4, 24);
      const probeCasingMesh = new THREE.Mesh(probeCasingGeo, probeBodyMaterial);
      probeGroup.add(probeCasingMesh);

      // Transducer Wear Plate / Face
      const wearPlateGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.15, 24);
      const wearPlateMesh = new THREE.Mesh(wearPlateGeo, probeWearPlateMaterial);
      wearPlateMesh.position.y = -0.7;
      probeGroup.add(wearPlateMesh);

      // Top Brass BNC Connector
      const bncGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 16);
      const bncMesh = new THREE.Mesh(bncGeo, brassMaterial);
      bncMesh.position.y = 0.9;
      probeGroup.add(bncMesh);

      // Coaxial cable trailing off
      const cableCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.2, 0),
        new THREE.Vector3(0.5, 2.0, 0.5),
        new THREE.Vector3(2.0, 2.8, 1.5),
        new THREE.Vector3(3.5, 2.5, 3.0)
      ]);
      const cableGeo = new THREE.TubeGeometry(cableCurve, 20, 0.08, 8, false);
      const cableMesh = new THREE.Mesh(cableGeo, cableMat);
      probeGroup.add(cableMesh);

      // Couplant liquid film ring beneath probe
      const couplantGeo = new THREE.RingGeometry(0.1, 0.8, 24);
      couplantGeo.rotateX(-Math.PI / 2);
      const couplantMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1
      });
      const couplantMesh = new THREE.Mesh(couplantGeo, couplantMat);
      couplantMesh.position.y = -0.78;
      probeGroup.add(couplantMesh);

      root.add(probeGroup);
      probeGroupRef.current = probeGroup;

      // -----------------------------------------------------------
      // Glowing Acoustic Beam Simulation (Ultrasound propagation cone)
      // -----------------------------------------------------------
      const beamGroup = new THREE.Group();
      const beamGeo = new THREE.ConeGeometry(0.9, 4.4, 24, 1, true);
      beamGeo.rotateX(Math.PI);
      beamGeo.translate(0, -2.2, 0);

      const beamMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        side: THREE.DoubleSide
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.userData = { baseOpacity: 0.45 };
      beamGroup.add(beamMesh);

      // Core ray beam line
      const rayGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.4, 8);
      rayGeo.translate(0, -2.2, 0);
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
      const rayMesh = new THREE.Mesh(rayGeo, rayMat);
      beamGroup.add(rayMesh);

      // Echo reflection ring at backwall impact
      const impactRingGeo = new THREE.RingGeometry(0.2, 0.6, 24);
      impactRingGeo.rotateX(-Math.PI / 2);
      const impactRingMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide
      });
      const impactRingMesh = new THREE.Mesh(impactRingGeo, impactRingMat);
      impactRingMesh.position.y = -4.4;
      beamGroup.add(impactRingMesh);

      probeGroup.add(beamGroup);
      soundBeamRef.current = beamGroup;
    }

    // -------------------------------------------------------------
    // BLOCK 2: 5-STEP WEDGE CALIBRATION BLOCK
    // Precision step thicknesses: 2.5 mm, 5.0 mm, 7.5 mm, 10.0 mm, 12.5 mm
    // -------------------------------------------------------------
    else if (blockType === 'step_wedge') {
      const stepGroup = new THREE.Group();
      const stepHeights = [0.8, 1.6, 2.4, 3.2, 4.0]; // proportional to 2.5mm, 5.0mm, 7.5mm, 10.0mm, 12.5mm
      const stepWidth = 2.4;
      const stepDepth = 2.8;

      stepHeights.forEach((h, idx) => {
        const xPos = (idx - 2) * stepWidth;
        const geo = new THREE.BoxGeometry(stepWidth - 0.04, h, stepDepth);
        const mesh = new THREE.Mesh(geo, idx === selectedStep - 1 ? polishedSteelMaterial : steelMaterial);
        mesh.position.set(xPos, h / 2 - 2, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        stepGroup.add(mesh);

        // Engraved step label plate
        const labelGeo = new THREE.BoxGeometry(stepWidth * 0.7, 0.02, 0.4);
        const labelMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const labelMesh = new THREE.Mesh(labelGeo, labelMat);
        labelMesh.position.set(xPos, h - 1.99, stepDepth / 2 - 0.35);
        stepGroup.add(labelMesh);
      });

      root.add(stepGroup);

      // Transducer Probe placed on top of currently selected step
      const probeGroup = new THREE.Group();

      const probeCasingGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.2, 24);
      const probeCasingMesh = new THREE.Mesh(probeCasingGeo, probeBodyMaterial);
      probeGroup.add(probeCasingMesh);

      const wearPlateGeo = new THREE.CylinderGeometry(0.63, 0.63, 0.12, 24);
      const wearPlateMesh = new THREE.Mesh(wearPlateGeo, probeWearPlateMaterial);
      wearPlateMesh.position.y = -0.6;
      probeGroup.add(wearPlateMesh);

      // Couplant liquid film ring
      const couplantGeo = new THREE.RingGeometry(0.1, 0.75, 24);
      couplantGeo.rotateX(-Math.PI / 2);
      const couplantMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1
      });
      const couplantMesh = new THREE.Mesh(couplantGeo, couplantMat);
      couplantMesh.position.y = -0.66;
      probeGroup.add(couplantMesh);

      // Position probe on the chosen step
      const currentH = stepHeights[selectedStep - 1] || 0.8;
      const xPos = (selectedStep - 1 - 2) * stepWidth;
      probeGroup.position.set(xPos, currentH - 2 + 0.66, 0);

      // Sound beam through step thickness
      const beamGroup = new THREE.Group();
      const beamGeo = new THREE.CylinderGeometry(0.4, 0.4, currentH, 16);
      beamGeo.translate(0, -currentH / 2 - 0.66, 0);
      const beamMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.5,
        emissive: 0x0284c7,
        emissiveIntensity: 0.7
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamGroup.add(beamMesh);

      // Bottom backwall reflection bounce
      const echoGeo = new THREE.RingGeometry(0.1, 0.45, 16);
      echoGeo.rotateX(-Math.PI / 2);
      const echoMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
      const echoMesh = new THREE.Mesh(echoGeo, echoMat);
      echoMesh.position.y = -currentH - 0.66;
      beamGroup.add(echoMesh);

      probeGroup.add(beamGroup);
      root.add(probeGroup);
      probeGroupRef.current = probeGroup;
      soundBeamRef.current = beamGroup;
    }

    // -------------------------------------------------------------
    // BLOCK 3: ANGLE BEAM WELD INSPECTION
    // Welded Plate with V-Groove seam, weld bead, heat-affected zone,
    // and internal flaw detected via sound skip bounce (Leg 1 & Leg 2)
    // -------------------------------------------------------------
    else if (blockType === 'angle_weld') {
      const weldGroup = new THREE.Group();
      const plateWidth = 14;
      const plateH = 2.2;
      const plateDepth = 5.0;

      // Base Plate
      const plateGeo = new THREE.BoxGeometry(plateWidth, plateH, plateDepth);
      const plateMesh = new THREE.Mesh(plateGeo, steelMaterial);
      plateMesh.position.y = -plateH / 2;
      plateMesh.castShadow = true;
      plateMesh.receiveShadow = true;
      weldGroup.add(plateMesh);

      // V-Groove Weld Seam (center reinforcement cap)
      const capGeo = new THREE.CylinderGeometry(0.8, 1.2, plateDepth, 16);
      capGeo.rotateZ(Math.PI / 2);
      const weldMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.45,
        metalness: 0.75
      });
      const weldCapMesh = new THREE.Mesh(capGeo, weldMat);
      weldCapMesh.position.set(0, 0.1, 0);
      weldGroup.add(weldCapMesh);

      // Weld Root Bead at bottom
      const rootBeadGeo = new THREE.CylinderGeometry(0.4, 0.7, plateDepth, 16);
      rootBeadGeo.rotateZ(Math.PI / 2);
      const rootBeadMesh = new THREE.Mesh(rootBeadGeo, weldMat);
      rootBeadMesh.position.set(0, -plateH, 0);
      weldGroup.add(rootBeadMesh);

      // Heat-Affected Zone (HAZ) subtle bands on both sides
      [-1.4, 1.4].forEach(xOff => {
        const hazGeo = new THREE.BoxGeometry(0.4, 0.05, plateDepth);
        const hazMat = new THREE.MeshBasicMaterial({ color: 0x92400e }); // heat tint
        const hazMesh = new THREE.Mesh(hazGeo, hazMat);
        hazMesh.position.set(xOff, 0.01, 0);
        weldGroup.add(hazMesh);
      });

      // Internal Weld Root Crack Defect (Located inside weld)
      const crackGeo = new THREE.BoxGeometry(0.2, 0.6, 1.2);
      const crackMat = new THREE.MeshStandardMaterial({
        color: defectDetected ? 0xef4444 : 0x7f1d1d,
        emissive: defectDetected ? 0xef4444 : 0x330000,
        emissiveIntensity: defectDetected ? 1.5 : 0.2
      });
      const crackMesh = new THREE.Mesh(crackGeo, crackMat);
      crackMesh.position.set(0, -plateH + 0.5, 0);
      weldGroup.add(crackMesh);
      defectMeshRef.current = crackMesh;

      root.add(weldGroup);

      // Angle Probe with Perspex Wedge (45°, 60°, 70°)
      const probeGroup = new THREE.Group();

      // Perspex Wedge (prismatic wedge geometry)
      const wedgeGeo = new THREE.BoxGeometry(1.8, 1.2, 1.4);
      const wedgeMat = new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.8,
        roughness: 0.15
      });
      const wedgeMesh = new THREE.Mesh(wedgeGeo, wedgeMat);
      wedgeMesh.position.y = 0.6;
      probeGroup.add(wedgeMesh);

      // Transducer crystal mounted on angled face
      const crystalGeo = new THREE.BoxGeometry(0.8, 0.2, 1.0);
      crystalGeo.rotateZ((-probeAngleDeg * Math.PI) / 180 / 2);
      const crystalMesh = new THREE.Mesh(crystalGeo, probeBodyMaterial);
      crystalMesh.position.set(-0.3, 1.2, 0);
      probeGroup.add(crystalMesh);

      // Cable from transducer
      const cableGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.0, 8);
      cableGeo.rotateZ(Math.PI / 4);
      const cableMesh = new THREE.Mesh(cableGeo, cableMat);
      cableMesh.position.set(-1.0, 2.0, 0);
      probeGroup.add(cableMesh);

      root.add(probeGroup);
      probeGroupRef.current = probeGroup;

      // Dynamic 3D Sound Beam (Leg 1 direct to bottom wall, Leg 2 skip bounce)
      const beamGroup = new THREE.Group();

      // Sound Path Calculations
      const angleRad = (probeAngleDeg * Math.PI) / 180;
      const leg1Length = plateH / Math.cos(angleRad);
      const leg1X = Math.tan(angleRad) * plateH;

      // Leg 1 Tube
      const leg1Path = new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(leg1X, -plateH, 0)
      );
      const leg1Geo = new THREE.TubeGeometry(leg1Path, 10, 0.1, 8, false);
      const beamMat = new THREE.MeshStandardMaterial({
        color: defectDetected ? 0xf59e0b : 0x38bdf8,
        emissive: defectDetected ? 0xf59e0b : 0x0284c7,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.85
      });
      const leg1Mesh = new THREE.Mesh(leg1Geo, beamMat);
      beamGroup.add(leg1Mesh);

      // Bottom reflection impact circle
      const bottomBounceGeo = new THREE.RingGeometry(0.1, 0.35, 16);
      bottomBounceGeo.rotateX(-Math.PI / 2);
      const bottomBounceMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const bottomBounceMesh = new THREE.Mesh(bottomBounceGeo, bottomBounceMat);
      bottomBounceMesh.position.set(leg1X, -plateH, 0);
      beamGroup.add(bottomBounceMesh);

      // Leg 2 Tube (skip bounced ray to top surface)
      const leg2Path = new THREE.LineCurve3(
        new THREE.Vector3(leg1X, -plateH, 0),
        new THREE.Vector3(leg1X * 2, 0, 0)
      );
      const leg2Geo = new THREE.TubeGeometry(leg2Path, 10, 0.08, 8, false);
      const leg2Mesh = new THREE.Mesh(leg2Geo, beamMat);
      beamGroup.add(leg2Mesh);

      probeGroup.add(beamGroup);
      soundBeamRef.current = beamGroup;
    }

    // -------------------------------------------------------------
    // BLOCK 4: MAGNETIC PARTICLE TESTING (MT) YOKE & PLATE
    // Articulated AC electromagnetic yoke, surface fatigue crack,
    // magnetic flux lines, and dynamic powder particle gathering
    // -------------------------------------------------------------
    else if (blockType === 'mt_yoke') {
      const mtGroup = new THREE.Group();

      // Steel Test Plate
      const plateGeo = new THREE.BoxGeometry(12, 1.5, 8);
      const plateMesh = new THREE.Mesh(plateGeo, steelMaterial);
      plateMesh.position.y = -0.75;
      plateMesh.castShadow = true;
      plateMesh.receiveShadow = true;
      mtGroup.add(plateMesh);

      // Surface Crack with variable orientation angle
      const crackLength = 2.4;
      const crackWidth = 0.08;
      const crackGeo = new THREE.BoxGeometry(crackLength, 0.08, crackWidth);
      crackGeo.rotateY(((crackAngleDeg - 90) * Math.PI) / 180);
      const crackMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
      const crackMesh = new THREE.Mesh(crackGeo, crackMat);
      crackMesh.position.set(0, 0.02, 0);
      mtGroup.add(crackMesh);

      // -----------------------------------------------------------
      // Electromagnetic Yoke (Handle, Coil Core, Two Articulated Legs)
      // -----------------------------------------------------------
      const yokeGroup = new THREE.Group();

      // Main Grip Handle (Rubberized Red/Orange casing)
      const handleGeo = new THREE.BoxGeometry(7, 1.4, 1.6);
      const handleMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626, // Parker / Magnaflux red
        roughness: 0.6,
        metalness: 0.2
      });
      const handleMesh = new THREE.Mesh(handleGeo, handleMat);
      handleMesh.position.y = 4.2;
      yokeGroup.add(handleMesh);

      // Energize Trigger Switch
      const triggerGeo = new THREE.BoxGeometry(0.8, 0.4, 0.4);
      const triggerMat = new THREE.MeshBasicMaterial({ color: isYokeEnergized ? 0x22c55e : 0x18181b });
      const triggerMesh = new THREE.Mesh(triggerGeo, triggerMat);
      triggerMesh.position.set(0, 3.4, 0.7);
      yokeGroup.add(triggerMesh);

      // Magnetic Pole Legs (Left North Pole & Right South Pole)
      [-3.0, 3.0].forEach((xLeg, idx) => {
        // Vertical leg arm
        const legGeo = new THREE.BoxGeometry(1.2, 3.6, 1.4);
        const legMesh = new THREE.Mesh(legGeo, steelMaterial);
        legMesh.position.set(xLeg, 2.0, 0);
        yokeGroup.add(legMesh);

        // Articulated foot resting on plate
        const footGeo = new THREE.BoxGeometry(1.6, 0.4, 1.6);
        const footMesh = new THREE.Mesh(footGeo, polishedSteelMaterial);
        footMesh.position.set(xLeg, 0.2, 0);
        yokeGroup.add(footMesh);

        // Pole label (N / S)
        const poleLabelGeo = new THREE.BoxGeometry(0.6, 0.6, 0.02);
        const poleLabelMat = new THREE.MeshBasicMaterial({ color: idx === 0 ? 0x3b82f6 : 0xef4444 });
        const poleLabelMesh = new THREE.Mesh(poleLabelGeo, poleLabelMat);
        poleLabelMesh.position.set(xLeg, 2.5, 0.71);
        yokeGroup.add(poleLabelMesh);
      });

      mtGroup.add(yokeGroup);
      root.add(mtGroup);

      // -----------------------------------------------------------
      // Magnetic Flux Lines between Poles
      // -----------------------------------------------------------
      const fluxGroup = new THREE.Group();
      if (isYokeEnergized) {
        for (let i = -3; i <= 3; i++) {
          const zOffset = (i / 3) * 1.8;
          const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-2.8, 0.25, zOffset),
            new THREE.Vector3(0, 0.9, zOffset * 1.3),
            new THREE.Vector3(2.8, 0.25, zOffset)
          );
          const points = curve.getPoints(24);
          const fluxGeo = new THREE.BufferGeometry().setFromPoints(points);
          const fluxLineMat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.7
          });
          const fluxLine = new THREE.Line(fluxGeo, fluxLineMat);
          fluxGroup.add(fluxLine);
        }
      }
      root.add(fluxGroup);
      fluxLinesGroupRef.current = fluxGroup;

      // -----------------------------------------------------------
      // Ferromagnetic Particles Cluster around Crack
      // -----------------------------------------------------------
      const particlesGroup = new THREE.Group();
      if (areParticlesApplied) {
        // If yoke is energized AND crack is perpendicular (high flux leakage)
        const fluxLeakageStrength = isYokeEnergized ? Math.sin((crackAngleDeg * Math.PI) / 180) : 0.05;
        const particleCount = 450;
        const pGeo = new THREE.BufferGeometry();
        const pPositions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
          let px = 0;
          let pz = 0;

          if (Math.random() < fluxLeakageStrength * 0.85) {
            // Clustered tightly along the crack indication line!
            const t = (Math.random() - 0.5) * crackLength;
            const crackRad = ((crackAngleDeg - 90) * Math.PI) / 180;
            const spread = (Math.random() - 0.5) * 0.12 * (1.1 - fluxLeakageStrength);

            px = t * Math.cos(crackRad) - spread * Math.sin(crackRad);
            pz = t * Math.sin(crackRad) + spread * Math.cos(crackRad);
          } else {
            // Dispersed randomly on plate surface
            px = (Math.random() - 0.5) * 5.5;
            pz = (Math.random() - 0.5) * 4.0;
          }

          pPositions[i * 3] = px;
          pPositions[i * 3 + 1] = 0.03;
          pPositions[i * 3 + 2] = pz;
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
        const pMat = new THREE.PointsMaterial({
          color: isYokeEnergized && fluxLeakageStrength > 0.5 ? 0x22c55e : 0x1f2937, // Fluorescent green or black powder
          size: 0.12
        });
        const particlesMesh = new THREE.Points(pGeo, pMat);
        particlesGroup.add(particlesMesh);
      }
      root.add(particlesGroup);
      particlesGroupRef.current = particlesGroup;
    }
  }, [blockType, selectedStep, probeAngleDeg, isYokeEnergized, areParticlesApplied, crackAngleDeg, defectDetected]);

  // Update dynamic probe position and beam
  useEffect(() => {
    const probe = probeGroupRef.current;
    if (!probe) return;

    if (blockType === 'iiw_v1') {
      // Move probe based on preset
      if (probePreset === 'A') {
        // Position A: Normal beam on 25 mm step
        probe.position.set(4.5, 2.3 + 0.78, 0);
        probe.rotation.set(0, 0, 0);
      } else if (probePreset === 'B') {
        // Position B: Normal beam on 100 mm arc reflection surface
        probe.position.set(-1.0, 2.3 + 0.78, 0);
        probe.rotation.set(0, 0, 0);
      } else if (probePreset === 'C') {
        // Position C: Angle beam index verification
        probe.position.set(-1.8, 2.3 + 0.78, 0);
        probe.rotation.set(0, 0, (-probeAngleDeg * Math.PI) / 180 / 4);
      } else if (probePreset === 'D') {
        // Position D: Over 1.5mm SDH hole
        probe.position.set(2.5, 2.3 + 0.78, 0);
        probe.rotation.set(0, 0, 0);
      }
    } else if (blockType === 'angle_weld') {
      // Slide probe standoff distance from weld center (0)
      // probePositionMm maps e.g. 20 to 60 mm -> in scene units -2 to -6
      const xStandoff = -(probePositionMm / 10);
      probe.position.set(xStandoff, 0, 0);
    }
  }, [blockType, probePreset, probePositionMm, probeAngleDeg]);

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] bg-[#070a1a] rounded-2xl overflow-hidden border border-[#1e293b] select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Viewport Controls & Camera Hint Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>محاكاة ثلاثية الأبعاد تفاعلية 3D • اسحب للتدوير / التكبير</span>
      </div>

      {/* Block Type Badge */}
      <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-bold text-amber-400 pointer-events-none">
        {blockType === 'iiw_v1' && 'كتلة المعايرة القياسية IIW V1 (ISO 2400)'}
        {blockType === 'step_wedge' && 'كتلة الدرج المتدرجة 5-Step Wedge (ASTM E797)'}
        {blockType === 'angle_weld' && 'فحص اللحام بالزاوية والارتداد (AWS D1.1 / ASME Sec V)'}
        {blockType === 'mt_yoke' && 'الفحص بالشوكة الكهرومغناطيسية والجسيمات (ASME Sec V Art. 7)'}
      </div>

      {/* Beam Indicator Overlay */}
      {blockType === 'angle_weld' && (
        <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-sky-400 inline-block rounded" />
            <span className="text-slate-300">مسار الصوت الأول Leg 1 (مباشر)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-amber-400 inline-block rounded" />
            <span className="text-slate-300">مسار القفزة الثانية Leg 2 (مرتد من القاع)</span>
          </div>
        </div>
      )}
    </div>
  );
};
