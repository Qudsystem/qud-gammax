import { AnimationType } from './types'

export interface AnimationConfig {
  name: string
  description: string
  css: string
  duration: string
  easing: string
}

export const animationConfigs: Record<AnimationType, AnimationConfig> = {
  'fade-in': {
    name: 'Fade In',
    description: 'Smooth opacity transition',
    css: 'animate-fade-in',
    duration: '0.6s',
    easing: 'ease-out'
  },
  'slide-up': {
    name: 'Slide Up',
    description: 'Slide from bottom',
    css: 'animate-slide-up',
    duration: '0.5s',
    easing: 'ease-out'
  },
  'slide-down': {
    name: 'Slide Down',
    description: 'Slide from top',
    css: 'animate-slide-down',
    duration: '0.5s',
    easing: 'ease-out'
  },
  'slide-left': {
    name: 'Slide Left',
    description: 'Slide from right',
    css: 'animate-slide-left',
    duration: '0.5s',
    easing: 'ease-out'
  },
  'slide-right': {
    name: 'Slide Right',
    description: 'Slide from left',
    css: 'animate-slide-right',
    duration: '0.5s',
    easing: 'ease-out'
  },
  'zoom-in': {
    name: 'Zoom In',
    description: 'Scale up from center',
    css: 'animate-zoom-in',
    duration: '0.5s',
    easing: 'ease-out'
  },
  'zoom-out': {
    name: 'Zoom Out',
    description: 'Scale down to center',
    css: 'animate-zoom-out',
    duration: '0.5s',
    easing: 'ease-in'
  },
  'rotate-in': {
    name: 'Rotate In',
    description: 'Rotate and fade in',
    css: 'animate-rotate-in',
    duration: '0.7s',
    easing: 'ease-out'
  },
  'bounce': {
    name: 'Bounce',
    description: 'Bounce entrance',
    css: 'animate-bounce-in',
    duration: '1s',
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  'flip': {
    name: 'Flip',
    description: 'Flip card effect',
    css: 'animate-flip',
    duration: '0.6s',
    easing: 'ease-in-out'
  },
  'blur-in': {
    name: 'Blur In',
    description: 'Blur to clear',
    css: 'animate-blur-in',
    duration: '0.8s',
    easing: 'ease-out'
  },
  'scale-up': {
    name: 'Scale Up',
    description: 'Grow from small',
    css: 'animate-scale-up',
    duration: '0.5s',
    easing: 'ease-out'
  },
  'scale-down': {
    name: 'Scale Down',
    description: 'Shrink from large',
    css: 'animate-scale-down',
    duration: '0.5s',
    easing: 'ease-in'
  },
  'swing': {
    name: 'Swing',
    description: 'Pendulum swing',
    css: 'animate-swing',
    duration: '1s',
    easing: 'ease-in-out'
  },
  'pulse': {
    name: 'Pulse',
    description: 'Rhythmic scale',
    css: 'animate-pulse',
    duration: '2s',
    easing: 'ease-in-out'
  },
  'shake': {
    name: 'Shake',
    description: 'Horizontal shake',
    css: 'animate-shake',
    duration: '0.5s',
    easing: 'ease-in-out'
  },
  'wave': {
    name: 'Wave',
    description: 'Wave motion',
    css: 'animate-wave',
    duration: '1.5s',
    easing: 'ease-in-out'
  },
  'glow': {
    name: 'Glow',
    description: 'Glowing effect',
    css: 'animate-glow',
    duration: '2s',
    easing: 'ease-in-out'
  },
  'typewriter': {
    name: 'Typewriter',
    description: 'Text typing effect',
    css: 'animate-typewriter',
    duration: '3s',
    easing: 'steps(40, end)'
  },
  'reveal': {
    name: 'Reveal',
    description: 'Curtain reveal',
    css: 'animate-reveal',
    duration: '0.8s',
    easing: 'ease-out'
  },
  'rotate-360': {
    name: 'Rotate 360',
    description: 'Full rotation',
    css: 'animate-rotate-360',
    duration: '0.8s',
    easing: 'ease-in-out'
  },
  'bounce-left': {
    name: 'Bounce Left',
    description: 'Bounce from left',
    css: 'animate-bounce-left',
    duration: '1s',
    easing: 'ease-out'
  },
  'bounce-right': {
    name: 'Bounce Right',
    description: 'Bounce from right',
    css: 'animate-bounce-right',
    duration: '1s',
    easing: 'ease-out'
  },
  'elastic': {
    name: 'Elastic',
    description: 'Elastic bounce',
    css: 'animate-elastic',
    duration: '1s',
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  'rubber-band': {
    name: 'Rubber Band',
    description: 'Stretchy effect',
    css: 'animate-rubber-band',
    duration: '1s',
    easing: 'ease-in-out'
  },
  'jello': {
    name: 'Jello',
    description: 'Wobbly jello',
    css: 'animate-jello',
    duration: '1s',
    easing: 'ease-in-out'
  },
  'heart-beat': {
    name: 'Heart Beat',
    description: 'Pulsing heart',
    css: 'animate-heart-beat',
    duration: '1.3s',
    easing: 'ease-in-out'
  },
  'flash': {
    name: 'Flash',
    description: 'Quick flash',
    css: 'animate-flash',
    duration: '0.5s',
    easing: 'ease-in-out'
  },
  'wobble': {
    name: 'Wobble',
    description: 'Side to side wobble',
    css: 'animate-wobble',
    duration: '1s',
    easing: 'ease-in-out'
  },
  'tada': {
    name: 'Tada',
    description: 'Celebration effect',
    css: 'animate-tada',
    duration: '1s',
    easing: 'ease-in-out'
  },
  'flip-x': {
    name: 'Flip X',
    description: 'Horizontal flip',
    css: 'animate-flip-x',
    duration: '0.6s',
    easing: 'ease-in-out'
  },
  'flip-y': {
    name: 'Flip Y',
    description: 'Vertical flip',
    css: 'animate-flip-y',
    duration: '0.6s',
    easing: 'ease-in-out'
  },
  'light-speed-in': {
    name: 'Light Speed In',
    description: 'Fast entrance',
    css: 'animate-light-speed-in',
    duration: '0.5s',
    easing: 'ease-out'
  },
  'roll-in': {
    name: 'Roll In',
    description: 'Roll from left',
    css: 'animate-roll-in',
    duration: '1s',
    easing: 'ease-out'
  },
  'roll-out': {
    name: 'Roll Out',
    description: 'Roll to right',
    css: 'animate-roll-out',
    duration: '1s',
    easing: 'ease-in'
  },
  'zoom-in-down': {
    name: 'Zoom In Down',
    description: 'Zoom from top',
    css: 'animate-zoom-in-down',
    duration: '0.6s',
    easing: 'ease-out'
  },
  'zoom-in-up': {
    name: 'Zoom In Up',
    description: 'Zoom from bottom',
    css: 'animate-zoom-in-up',
    duration: '0.6s',
    easing: 'ease-out'
  },
  'zoom-out-down': {
    name: 'Zoom Out Down',
    description: 'Zoom to bottom',
    css: 'animate-zoom-out-down',
    duration: '0.6s',
    easing: 'ease-in'
  },
  'zoom-out-up': {
    name: 'Zoom Out Up',
    description: 'Zoom to top',
    css: 'animate-zoom-out-up',
    duration: '0.6s',
    easing: 'ease-in'
  },
  'slide-rotate': {
    name: 'Slide Rotate',
    description: 'Slide with rotation',
    css: 'animate-slide-rotate',
    duration: '0.7s',
    easing: 'ease-out'
  },
  'slide-fade-up': {
    name: 'Slide Fade Up',
    description: 'Slide up with fade',
    css: 'animate-slide-fade-up',
    duration: '0.6s',
    easing: 'ease-out'
  },
  'slide-fade-down': {
    name: 'Slide Fade Down',
    description: 'Slide down with fade',
    css: 'animate-slide-fade-down',
    duration: '0.6s',
    easing: 'ease-out'
  },
  'slide-fade-left': {
    name: 'Slide Fade Left',
    description: 'Slide left with fade',
    css: 'animate-slide-fade-left',
    duration: '0.6s',
    easing: 'ease-out'
  },
  'slide-fade-right': {
    name: 'Slide Fade Right',
    description: 'Slide right with fade',
    css: 'animate-slide-fade-right',
    duration: '0.6s',
    easing: 'ease-out'
  },
  'perspective-left': {
    name: 'Perspective Left',
    description: '3D perspective from left',
    css: 'animate-perspective-left',
    duration: '0.7s',
    easing: 'ease-out'
  },
  'perspective-right': {
    name: 'Perspective Right',
    description: '3D perspective from right',
    css: 'animate-perspective-right',
    duration: '0.7s',
    easing: 'ease-out'
  },
  'perspective-down': {
    name: 'Perspective Down',
    description: '3D perspective from top',
    css: 'animate-perspective-down',
    duration: '0.7s',
    easing: 'ease-out'
  },
  'perspective-up': {
    name: 'Perspective Up',
    description: '3D perspective from bottom',
    css: 'animate-perspective-up',
    duration: '0.7s',
    easing: 'ease-out'
  },
  'puff-in': {
    name: 'Puff In',
    description: 'Expand with blur',
    css: 'animate-puff-in',
    duration: '0.7s',
    easing: 'ease-out'
  },
  'puff-out': {
    name: 'Puff Out',
    description: 'Shrink with blur',
    css: 'animate-puff-out',
    duration: '0.7s',
    easing: 'ease-in'
  },
  'vanish': {
    name: 'Vanish',
    description: 'Disappear effect',
    css: 'animate-vanish',
    duration: '0.5s',
    easing: 'ease-out'
  },
  'fold-down': {
    name: 'Fold Down',
    description: 'Folding paper down',
    css: 'animate-fold-down',
    duration: '0.8s',
    easing: 'ease-out'
  },
  'unfold-up': {
    name: 'Unfold Up',
    description: 'Unfolding paper up',
    css: 'animate-unfold-up',
    duration: '0.8s',
    easing: 'ease-out'
  }
}

export const animationCSS = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-down {
  from { 
    opacity: 0;
    transform: translateY(-30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-left {
  from { 
    opacity: 0;
    transform: translateX(30px);
  }
  to { 
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-right {
  from { 
    opacity: 0;
    transform: translateX(-30px);
  }
  to { 
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes zoom-in {
  from { 
    opacity: 0;
    transform: scale(0.5);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes zoom-out {
  from { 
    opacity: 1;
    transform: scale(1.5);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes rotate-in {
  from { 
    opacity: 0;
    transform: rotate(-200deg) scale(0.5);
  }
  to { 
    opacity: 1;
    transform: rotate(0) scale(1);
  }
}

@keyframes bounce-in {
  0% { 
    opacity: 0;
    transform: scale(0.3);
  }
  50% { 
    opacity: 1;
    transform: scale(1.05);
  }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

@keyframes flip {
  from { 
    opacity: 0;
    transform: perspective(400px) rotateY(90deg);
  }
  to { 
    opacity: 1;
    transform: perspective(400px) rotateY(0);
  }
}

@keyframes blur-in {
  from { 
    opacity: 0;
    filter: blur(20px);
  }
  to { 
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes scale-up {
  from { 
    opacity: 0;
    transform: scale(0);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scale-down {
  from { 
    opacity: 0;
    transform: scale(2);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes swing {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-10deg); }
  60% { transform: rotate(5deg); }
  80% { transform: rotate(-5deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

@keyframes wave {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-10px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(10px); }
}

@keyframes glow {
  0%, 100% { 
    filter: drop-shadow(0 0 2px currentColor);
  }
  50% { 
    filter: drop-shadow(0 0 20px currentColor) drop-shadow(0 0 40px currentColor);
  }
}

@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes reveal {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

.animate-fade-in { animation: fade-in 0.6s ease-out; }
.animate-slide-up { animation: slide-up 0.5s ease-out; }
.animate-slide-down { animation: slide-down 0.5s ease-out; }
.animate-slide-left { animation: slide-left 0.5s ease-out; }
.animate-slide-right { animation: slide-right 0.5s ease-out; }
.animate-zoom-in { animation: zoom-in 0.5s ease-out; }
.animate-zoom-out { animation: zoom-out 0.5s ease-in; }
.animate-rotate-in { animation: rotate-in 0.7s ease-out; }
.animate-bounce-in { animation: bounce-in 1s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.animate-flip { animation: flip 0.6s ease-in-out; }
.animate-blur-in { animation: blur-in 0.8s ease-out; }
.animate-scale-up { animation: scale-up 0.5s ease-out; }
.animate-scale-down { animation: scale-down 0.5s ease-in; }
.animate-swing { animation: swing 1s ease-in-out; }
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
.animate-shake { animation: shake 0.5s ease-in-out; }
.animate-wave { animation: wave 1.5s ease-in-out infinite; }
.animate-glow { animation: glow 2s ease-in-out infinite; }
.animate-typewriter { 
  animation: typewriter 3s steps(40, end);
  overflow: hidden;
  white-space: nowrap;
}
.animate-reveal { animation: reveal 0.8s ease-out; }
`
