import React, { useEffect, useRef, useState } from 'react';

export interface PrismFoldBackgroundProps {
  variant?: 'hero' | 'ambient' | 'workspace' | 'static';
  intensity?: 'subtle' | 'medium' | 'strong';
  interactive?: boolean;
  className?: string;
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_intensity;
  uniform float u_variant; // 0.0: hero, 1.0: ambient, 2.0: workspace, 3.0: static

  // 2D Rotation
  mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  // Multi-frequency glass fold height function
  float foldHeight(vec2 p, float t, vec2 m) {
    vec2 pos = p;

    // Subtle cursor displacement
    pos += m * 0.18;

    // Primary crystalline glass fold plane
    pos = rotate2D(0.38 + t * 0.015) * pos;
    float h1 = sin(pos.x * 2.2 + pos.y * 1.4 + t * 0.25);

    // Secondary intersecting fold
    vec2 p2 = rotate2D(-0.62 - t * 0.018) * (p - vec2(0.3, -0.2));
    p2 = abs(p2) - 0.45;
    float h2 = cos(p2.x * 3.1 - p2.y * 2.4 - t * 0.2);

    // Tertiary subtle micro-facet
    vec2 p3 = rotate2D(1.15) * pos;
    float h3 = sin(p3.x * 5.0 + t * 0.3) * 0.35;

    return h1 * 0.5 + h2 * 0.35 + h3 * 0.15;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect * 2.0;

    float t = u_time * 0.45;
    if (u_variant > 2.5) {
      t = 1.6; // Static composition
    }

    // Normal calculation via finite differences
    float eps = 0.006;
    float hCenter = foldHeight(p, t, u_mouse);
    float hX = foldHeight(p + vec2(eps, 0.0), t, u_mouse);
    float hY = foldHeight(p + vec2(0.0, eps), t, u_mouse);

    vec3 normal = normalize(vec3((hX - hCenter) / eps, (hY - hCenter) / eps, 1.2));

    // View vector and light vectors
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 lightDir1 = normalize(vec3(-0.4 + u_mouse.x * 0.6, 0.6 + u_mouse.y * 0.5, 0.9));
    vec3 lightDir2 = normalize(vec3(0.7, -0.5, 0.6));

    // Fresnel reflectance for optical glass: F0 + (1-F0)*(1 - cos(theta))^4
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);

    // Specular highlights catching crystal fold edges
    vec3 halfVec1 = normalize(lightDir1 + viewDir);
    float spec1 = pow(max(dot(normal, halfVec1), 0.0), 32.0);

    vec3 halfVec2 = normalize(lightDir2 + viewDir);
    float spec2 = pow(max(dot(normal, halfVec2), 0.0), 18.0);

    // Subtle chromatic dispersion across acute facets
    float disp = 0.018 * u_intensity;
    float redRefract   = foldHeight(p + normal.xy * disp * 0.8, t, u_mouse);
    float greenRefract = foldHeight(p, t, u_mouse);
    float blueRefract  = foldHeight(p - normal.xy * disp * 1.2, t, u_mouse);

    // Deep obsidian background palette (#050505 to #0D0D0D)
    vec3 baseVoid = vec3(0.02, 0.022, 0.026);
    vec3 deepSlate = vec3(0.035, 0.038, 0.044);
    vec3 color = mix(baseVoid, deepSlate, uv.y * 0.6 + 0.2);

    // CampusLab Precision Teal accent (#14B8A6 = rgb(0.078, 0.722, 0.651))
    vec3 tealTint = vec3(0.08, 0.72, 0.65);
    vec3 glassEdge = vec3(0.85, 0.92, 0.98);

    // Modulate lighting by intensity
    float facetShading = (blueRefract - redRefract) * 1.5;
    
    // Add refractive glass depth
    color += tealTint * (fresnel * 0.22 + facetShading * 0.12) * u_intensity;
    color += glassEdge * (spec1 * 0.35 + spec2 * 0.15) * u_intensity;

    // Soft ambient glass glow
    float softGlow = smoothstep(0.7, 0.1, length(p * 0.45));
    color += tealTint * softGlow * 0.04 * u_intensity;

    // Vignette falloff to preserve central readability
    float dist = length(uv - 0.5);
    float vignette = smoothstep(0.95, 0.25, dist);
    color *= mix(0.55, 1.0, vignette);

    // Contrast clamp to ensure dark SaaS backdrop
    color = clamp(color, 0.0, 0.75);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const PrismFoldBackground: React.FC<PrismFoldBackgroundProps> = ({
  variant = 'hero',
  intensity = 'medium',
  interactive = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Map intensity string to numerical scalar
  const intensityMap: Record<string, number> = {
    subtle: 0.35,
    medium: 0.65,
    strong: 1.0,
  };
  const numericIntensity = intensityMap[intensity] ?? 0.65;

  const variantMap: Record<string, number> = {
    hero: 0.0,
    ambient: 1.0,
    workspace: 2.0,
    static: 3.0,
  };
  const numericVariant = variantMap[variant] ?? 0.0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReducedMotion = mediaQuery.matches;

    // Initialize WebGL context
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
        powerPreference: 'low-power',
      }) || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    } catch {
      gl = null;
    }

    if (!gl) {
      console.warn('[PrismFoldBackground] WebGL unsupported, falling back to CSS.');
      setWebGlSupported(false);
      return;
    }

    // Compile Shader helper
    const createShader = (glCtx: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('[PrismFold Shader Error]', glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) {
      setWebGlSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setWebGlSupported(false);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[PrismFold Program Error]', gl.getProgramInfoLog(program));
      setWebGlSupported(false);
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');
    const uVariant = gl.getUniformLocation(program, 'u_variant');

    gl.uniform1f(uIntensity, numericIntensity);
    gl.uniform1f(uVariant, isReducedMotion ? 3.0 : numericVariant);

    // Smooth cursor interpolation state (damped lerp)
    let targetMouseX = 0.0;
    let targetMouseY = 0.0;
    let currentMouseX = 0.0;
    let currentMouseY = 0.0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || isReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMouseX = (x - 0.5) * 2.0;
      targetMouseY = (y - 0.5) * 2.0;
    };

    if (interactive && !isReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Responsive sizing with Device Pixel Ratio cap (1.5 max for performance)
    let animationFrameId: number;
    let isVisible = true;
    let startTime = performance.now();

    const resize = () => {
      if (!canvas || !container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(container.clientWidth, 320);
      const height = Math.max(container.clientHeight, 200);

      const targetWidth = Math.floor(width * dpr);
      const targetHeight = Math.floor(height * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        gl?.viewport(0, 0, targetWidth, targetHeight);
        gl?.uniform2f(uRes, targetWidth, targetHeight);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);
    resize();

    // Viewport intersection observer to pause rendering when offscreen
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    intersectionObserver.observe(container);

    // Main animation loop
    const render = (now: number) => {
      if (!gl) return;

      if (isVisible) {
        // Damped cursor interpolation
        const lerpFactor = 0.045;
        currentMouseX += (targetMouseX - currentMouseX) * lerpFactor;
        currentMouseY += (targetMouseY - currentMouseY) * lerpFactor;

        const elapsedTime = (now - startTime) * 0.001;
        gl.uniform1f(uTime, elapsedTime);
        gl.uniform2f(uMouse, currentMouseX, currentMouseY);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      if (!isReducedMotion && numericVariant !== 3.0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (isReducedMotion || numericVariant === 3.0) {
      // Single static render
      render(startTime);
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    // Cleanup resources on unmount
    return () => {
      if (interactive && !isReducedMotion) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [interactive, numericIntensity, numericVariant]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
    >
      {webGlSupported ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full block opacity-90 transition-opacity duration-700"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        // Elegant CSS procedural gradient fallback if WebGL is disabled
        <div className="w-full h-full bg-gradient-to-b from-[#080B10] via-[#050505] to-[#0D0E12] opacity-80" />
      )}

      {/* Atmospheric dark contrast veil to maintain 100% text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505]/80 pointer-events-none" />
    </div>
  );
};

export default PrismFoldBackground;
