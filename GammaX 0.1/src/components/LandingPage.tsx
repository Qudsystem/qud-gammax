import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { GoogleLogo, CaretDown, Globe } from '@phosphor-icons/react'

interface LandingPageProps {
    onStart: () => void
}

export function LandingPage({ onStart }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-white flex overflow-hidden font-sans">
            {/* Top Navigation / Language Selector */}
            <div className="absolute top-8 left-8 z-50 flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <Globe weight="bold" className="text-slate-400 w-4 h-4" />
                <span className="text-sm font-bold text-slate-600">English</span>
                <CaretDown weight="bold" className="text-slate-400 w-3 h-3" />
            </div>

            {/* Left side: Form */}
            <div className="flex-1 flex flex-col justify-center px-12 lg:px-32 z-10 bg-[#f8fbff] relative">
                {/* Subtle background glow */}
                <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px]" />

                <div className="max-w-md w-full mx-auto relative z-10">
                    <h1 className="text-[2.75rem] font-black text-[#1e293b] mb-4 tracking-tight leading-tight">Sign up</h1>
                    <p className="text-[#64748b] mb-10 text-lg font-medium leading-relaxed">Get started for free. No credit card required.</p>

                    <Button
                        variant="outline"
                        className="w-full h-[54px] text-md font-bold flex gap-3 border-slate-200/60 bg-white hover:bg-slate-50 rounded-2xl shadow-sm text-slate-700 transition-all active:scale-[0.98]"
                        onClick={onStart}
                    >
                        <GoogleLogo weight="bold" className="w-6 h-6 text-blue-600" />
                        Continue with Google
                    </Button>

                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200/40"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#f8fbff] px-4 text-slate-400 font-black tracking-widest">or</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-600 ml-1">Email</label>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                className="h-[54px] rounded-2xl border-slate-200/80 bg-white focus:ring-2 focus:ring-blue-500/20 text-md font-medium px-5"
                            />
                        </div>
                        <Button
                            className="w-full h-[54px] text-lg font-black bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
                            onClick={onStart}
                        >
                            Continue
                        </Button>
                    </div>

                    <p className="mt-10 text-center text-[13px] text-slate-400 leading-relaxed font-medium">
                        Already have an account? <span className="text-blue-600 font-bold hover:underline cursor-pointer">Sign in</span>
                        <br />
                        <span className="block mt-2">
                            By signing up for Gamma you acknowledge that you agree to Gamma's <span className="font-bold underline cursor-pointer">Terms of Service</span> and <span className="font-bold underline cursor-pointer">Privacy Policy</span>.
                        </span>
                    </p>

                    {/* Branding */}
                    <div className="mt-20 flex flex-col items-center">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[22px] font-black tracking-tighter text-[#1e293b]">GAMMA</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">© 2025 Gamma Tech, Inc.</p>
                    </div>
                </div>
            </div>

            {/* Right side: Collage (Tilted) */}
            <div className="hidden lg:flex flex-[1.2] bg-white relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[#f1f5f9]/30" />

                <motion.div
                    initial={{ rotate: 15, x: 100, opacity: 0 }}
                    animate={{ rotate: 15, x: 0, opacity: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-8 p-12"
                >
                    {[1, 2, 3, 4].map((col) => (
                        <motion.div
                            key={col}
                            animate={{ y: [0, (col % 2 === 0 ? -80 : 80), 0] }}
                            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                            className={`flex flex-col gap-8 will-change-transform ${col % 2 === 0 ? '-translate-y-32' : col % 3 === 0 ? '-translate-y-16' : ''}`}
                        >
                            {[1, 2, 3, 4, 5].map((item) => (
                                <motion.div
                                    key={item}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="w-[280px] aspect-[1.6/1] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden relative cursor-pointer group"
                                >
                                    <img
                                        src={`https://picsum.photos/seed/${(col + item) % 2 === 0 ? 'presentation' : 'website'}-${col}-${item}/560/350`}
                                        alt="Collage"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10 pointer-events-none" />
                                </motion.div>
                            ))}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Decorative floating elements */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-20 w-48 h-48 bg-purple-100/50 rounded-full blur-3xl animate-pulse delay-700" />
            </div>
        </div>
    )
}
