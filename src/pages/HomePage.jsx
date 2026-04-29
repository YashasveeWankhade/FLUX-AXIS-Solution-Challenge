import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import './HomePage.css';

const CanvasRevealEffect = ({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  dotSize = 3,
  showGradient = true,
  reverse = false,
}) => {
  return (
    <div style={{ height: '100%', position: 'relative', width: '100%' }}>
      <div style={{ height: '100%', width: '100%' }}>
        <DotMatrix
          colors={colors}
          dotSize={dotSize}
          opacities={opacities}
          shader={`
            ${reverse ? 'u_reverse_active' : 'false'}_;
            animation_speed_factor_${animationSpeed.toFixed(1)}_;
          `}
          center={["x", "y"]}
        />
      </div>
      {showGradient && (
        <div className="home-bg-gradient-top" />
      )}
    </div>
  );
};

const DotMatrix = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  shader = "",
  center = ["x", "y"],
}) => {
  const uniforms = React.useMemo(() => {
    let colorsArray = [
      colors[0], colors[0], colors[0],
      colors[0], colors[0], colors[0],
    ];
    if (colors.length === 2) {
      colorsArray = [
        colors[0], colors[0], colors[0],
        colors[1], colors[1], colors[1],
      ];
    } else if (colors.length === 3) {
      colorsArray = [
        colors[0], colors[0], colors[1],
        colors[1], colors[2], colors[2],
      ];
    }
    return {
      u_colors: {
        value: colorsArray.map((color) => [
          color[0] / 255,
          color[1] / 255,
          color[2] / 255,
        ]),
        type: "uniform3fv",
      },
      u_opacities: {
        value: opacities,
        type: "uniform1fv",
      },
      u_total_size: {
        value: totalSize,
        type: "uniform1f",
      },
      u_dot_size: {
        value: dotSize,
        type: "uniform1f",
      },
      u_reverse: {
        value: shader.includes("u_reverse_active") ? 1 : 0,
        type: "uniform1i",
      },
    };
  }, [colors, opacities, totalSize, dotSize, shader]);

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;

        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }
        float map(float value, float min1, float max1, float min2, float max2) {
            return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }

        void main() {
            vec2 st = fragCoord.xy;
            ${
              center.includes("x")
                ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));"
                : ""
            }
            ${
              center.includes("y")
                ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));"
                : ""
            }

            float opacity = step(0.0, st.x);
            opacity *= step(0.0, st.y);

            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

            vec3 color = u_colors[int(show_offset * 6.0)];

            float animation_speed_factor = 0.5;
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);

            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

            float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
            float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);

            float current_timing_offset;
            if (u_reverse == 1) {
                current_timing_offset = timing_offset_outro;
                 opacity *= 1.0 - step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            } else {
                current_timing_offset = timing_offset_intro;
                 opacity *= step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            }

            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
        }`}
      uniforms={uniforms}
      maxFps={60}
    />
  );
};

const ShaderMaterial = ({ source, uniforms, maxFps = 60 }) => {
  const { size } = useThree();
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const timestamp = clock.getElapsedTime();
    const material = ref.current.material;
    const timeLocation = material.uniforms.u_time;
    timeLocation.value = timestamp;
  });

  const getUniforms = () => {
    const preparedUniforms = {};
    for (const uniformName in uniforms) {
      const uniform = uniforms[uniformName];
      switch (uniform.type) {
        case "uniform1f": preparedUniforms[uniformName] = { value: uniform.value, type: "1f" }; break;
        case "uniform1i": preparedUniforms[uniformName] = { value: uniform.value, type: "1i" }; break;
        case "uniform3f": preparedUniforms[uniformName] = { value: new THREE.Vector3().fromArray(uniform.value), type: "3f" }; break;
        case "uniform1fv": preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" }; break;
        case "uniform3fv": preparedUniforms[uniformName] = { value: uniform.value.map(v => new THREE.Vector3().fromArray(v)), type: "3fv" }; break;
        case "uniform2f": preparedUniforms[uniformName] = { value: new THREE.Vector2().fromArray(uniform.value), type: "2f" }; break;
      }
    }
    preparedUniforms["u_time"] = { value: 0, type: "1f" };
    preparedUniforms["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    return preparedUniforms;
  };

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
      precision mediump float;
      in vec2 coordinates;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main(){
        float x = position.x;
        float y = position.y;
        gl_Position = vec4(x, y, 0.0, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }
      `,
      fragmentShader: source,
      uniforms: getUniforms(),
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    });
  }, [size.width, size.height, source]);

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const Shader = ({ source, uniforms, maxFps = 60 }) => {
  return (
    <Canvas style={{ position: 'absolute', inset: 0, height: '100%', width: '100%' }}>
      <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
    </Canvas>
  );
};

function MiniNavbar() {
  return (
    <header className="home-mini-nav" style={{ borderRadius: '9999px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '16px 0' }}>
        <img src="/logo_pfp.png" alt="FluxAxis Logo" style={{ height: 120, objectFit: 'contain' }} />
      </div>
    </header>
  );
}

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeInputRefs = useRef([]);
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = e => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setStep("code");
    }
  };

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 500);
    }
  }, [step]);

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      if (value && index < 5) {
        codeInputRefs.current[index + 1]?.focus();
      }
      
      if (index === 5 && value) {
        const isComplete = newCode.every(digit => digit.length === 1);
        if (isComplete) {
          setReverseCanvasVisible(true);
          setTimeout(() => setInitialCanvasVisible(false), 50);
          setStep("loading");
          setTimeout(() => setStep("success"), 3000);
        }
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleBackClick = () => {
    setStep("email");
    setCode(["", "", "", "", "", ""]);
    setReverseCanvasVisible(false);
    setInitialCanvasVisible(true);
  };

  return (
    <div className="home-container" style={{ cursor: 'none' }}>
      <motion.div
        className="home-cursor-tracer"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.5
        }}
      />
      <div className="home-bg-layer">
        {initialCanvasVisible && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <CanvasRevealEffect
              animationSpeed={3}
              colors={[[62, 229, 160], [63, 108, 143]]}
              dotSize={6}
              reverse={false}
            />
          </div>
        )}
        
        {reverseCanvasVisible && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <CanvasRevealEffect
              animationSpeed={4}
              colors={[[62, 229, 160], [63, 108, 143]]}
              dotSize={6}
              reverse={true}
            />
          </div>
        )}
        
        <div className="home-bg-gradient-radial" />
      </div>
      
      <div className="home-content-layer">
        <MiniNavbar />

        <div className="home-main-area">
          <div className="home-form-container">
            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.div 
                  key="email-step"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ marginBottom: '24px' }}>
                    <h1 className="home-title">FluxAxis Command Center</h1>
                    <p className="home-subtitle">Operator Authentication</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button className="home-btn-auth">
                      <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>G</span>
                      <span>Authenticate via Secure Identity</span>
                    </button>
                    
                    <div className="home-divider">
                      <div className="home-divider-line" />
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>or</span>
                      <div className="home-divider-line" />
                    </div>
                    
                    <form onSubmit={handleEmailSubmit}>
                      <div className="home-input-wrap">
                        <input 
                          type="email" 
                          placeholder="operator@fluxaxis.io"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="home-input"
                          required
                        />
                        <button type="submit" className="home-submit-btn">
                          <span style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            →
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  <p className="home-footer-text">
                    By authenticating, you agree to the <Link to="#" className="home-footer-link">Operational Directives</Link>, <Link to="#" className="home-footer-link">Security Policies</Link>, and <Link to="#" className="home-footer-link">Privacy Protocol</Link>.
                  </p>
                </motion.div>
              ) : step === "code" ? (
                <motion.div 
                  key="code-step"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ marginBottom: '24px' }}>
                    <h1 className="home-title">Secure transmission received</h1>
                    <p className="home-subtitle">Input operational clearance code</p>
                  </div>
                  
                  <div style={{ width: '100%', marginBottom: '24px' }}>
                    <div className="home-code-container">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {code.map((digit, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                              <input
                                ref={(el) => { codeInputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleCodeChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className="home-code-input"
                                style={{ caretColor: 'transparent' }}
                              />
                              {!digit && (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                  <span style={{ fontSize: '1.25rem', color: '#fff' }}>0</span>
                                </div>
                              )}
                            </div>
                            {i < 5 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.25rem' }}>|</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <motion.p 
                      style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.875rem' }}
                      whileHover={{ scale: 1.02, color: 'rgba(255,255,255,0.7)' }}
                    >
                      Resend transmission
                    </motion.p>
                  </div>
                  
                  <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
                    <motion.button 
                      onClick={handleBackClick}
                      style={{ borderRadius: '9999px', background: '#fff', color: '#000', fontWeight: 500, padding: '12px 32px', width: '30%', border: 'none', cursor: 'pointer' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Abort
                    </motion.button>
                    <motion.button 
                      style={{ 
                        flex: 1, borderRadius: '9999px', fontWeight: 500, padding: '12px', transition: 'all 0.3s',
                        background: code.every(d => d !== "") ? '#fff' : '#111',
                        color: code.every(d => d !== "") ? '#000' : 'rgba(255,255,255,0.5)',
                        border: code.every(d => d !== "") ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        cursor: code.every(d => d !== "") ? 'pointer' : 'not-allowed'
                      }}
                      disabled={!code.every(d => d !== "")}
                    >
                      Verify
                    </motion.button>
                  </div>
                </motion.div>
              ) : step === "loading" ? (
                <motion.div 
                  key="loading-step"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ marginBottom: '24px' }}>
                    <h1 className="home-title">Authenticating...</h1>
                    <p className="home-subtitle">Verifying operational clearance</p>
                  </div>
                  
                  <div className="flux-loader">
                    <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                    <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                    <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                    <div className="circle"><div className="dot"></div><div className="outline"></div></div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="success-step"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ marginBottom: '24px' }}>
                    <h1 className="home-title">Clearance verified</h1>
                    <p className="home-subtitle">Access granted to FluxAxis</p>
                  </div>
                  
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    style={{ padding: '40px 0' }}
                  >
                    <div style={{ margin: '0 auto', width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(to bottom right, #fff, rgba(255,255,255,0.7))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '32px', height: '32px', color: '#000' }} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </motion.div>
                  
                  <motion.button 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={() => navigate('/network')}
                    style={{ width: '100%', borderRadius: '9999px', background: '#fff', color: '#000', fontWeight: 500, padding: '12px', border: 'none', cursor: 'pointer' }}
                  >
                    Initialize Command Center
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
