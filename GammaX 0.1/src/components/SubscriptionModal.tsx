import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { X, Check, Lightning } from '@phosphor-icons/react'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { cn } from '@/lib/utils'

interface SubscriptionModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually')
    const [planType, setPlanType] = useState('individual')

    const plans = [
        {
            name: 'Plus',
            description: 'For extra AI power and removing Gamma branding',
            price: billingCycle === 'monthly' ? '10' : '8',
            priceDetail: billingCycle === 'monthly' ? '$10 USD per seat / month' : '96 US$ per seat, billed annually',
            buttonText: 'Upgrade to Plus',
            features: [
                'Unlimited AI creations*',
                '400 monthly credits',
                'Create up to 20 cards per prompt',
                'Remove Gamma branding',
                'Advanced AI image models'
            ],
            color: 'blue'
        },
        {
            name: 'Pro',
            description: 'For premium AI models, API, and more customization',
            price: billingCycle === 'monthly' ? '20' : '15',
            priceDetail: billingCycle === 'monthly' ? '$20 USD per seat / month' : '180 US$ per seat, billed annually',
            buttonText: 'Upgrade to Pro',
            popular: true,
            features: [
                'Unlimited AI creations*',
                'Unlimited AI (basic models)',
                '1,000 monthly credits (adv. models)',
                'Create up to 50 cards per prompt',
                'Premium AI image models',
                'Custom branding & fonts',
                'Detailed analytics & advanced sharing',
                'API access'
            ],
            color: 'indigo'
        },
        {
            name: 'Ultra',
            description: 'The ultimate AI experience with no limits',
            price: billingCycle === 'monthly' ? '100' : '90',
            priceDetail: billingCycle === 'monthly' ? '$100 USD per seat / month' : '1,080 US$ per seat, billed annually',
            buttonText: 'Upgrade to Ultra',
            introductory: true,
            features: [
                'Unlimited everything',
                'Unlimited monthly credits',
                'Create up to 100 cards per prompt',
                'Access to most advanced AI models',
                'Priority support',
                'Early access to new features'
            ],
            color: 'blue'
        }
    ]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-6xl bg-[#F8FAFC] rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden scale-[0.98]">
                <div className="flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-10 pb-4 text-center relative shrink-0">
                        <DialogTitle className="text-3xl font-black text-[#0F172A] tracking-tight">Choose the plan that's right for you</DialogTitle>
                        <button onClick={onClose} className="absolute right-10 top-10 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <X weight="bold" className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center mt-6 gap-6">
                            <Tabs value={planType} onValueChange={setPlanType} className="w-80">
                                <TabsList className="bg-white border border-slate-200 p-1.5 rounded-2xl h-14">
                                    <TabsTrigger value="individual" className="flex-1 rounded-xl text-sm font-black data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all">Individual</TabsTrigger>
                                    <TabsTrigger value="team" className="flex-1 rounded-xl text-sm font-black data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all">Team</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[12px] font-black text-emerald-600 uppercase tracking-widest">Save up to 28% with annual billing</p>
                                <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                                    <button
                                        onClick={() => setBillingCycle('monthly')}
                                        className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", billingCycle === 'monthly' ? "bg-slate-100 text-slate-900" : "text-slate-400")}
                                    >Pay monthly</button>
                                    <button
                                        onClick={() => setBillingCycle('annually')}
                                        className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", billingCycle === 'annually' ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-400")}
                                    >Pay annually</button>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-10 pb-12 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            {plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={cn(
                                        "bg-white rounded-[2rem] border-2 p-8 flex flex-col items-center text-center relative transition-transform hover:scale-[1.02]",
                                        plan.popular ? "border-blue-200 shadow-xl" : "border-slate-50"
                                    )}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 right-8 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Most popular</div>
                                    )}
                                    {plan.introductory && (
                                        <div className="absolute -top-3 right-8 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Introductory price</div>
                                    )}

                                    <h3 className="text-3xl font-black text-slate-900 mb-2">{plan.name}</h3>
                                    <p className="text-xs text-slate-500 font-bold mb-8 h-8 px-4 leading-relaxed">{plan.description}</p>

                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-4xl font-black text-slate-900">{plan.price} US$</span>
                                        <span className="text-slate-400 text-xs font-bold">/ seat / month</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mb-8">{plan.priceDetail}</p>

                                    <Button
                                        className={cn(
                                            "w-full h-12 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 mb-8",
                                            plan.popular ? "bg-gradient-to-r from-blue-900 to-blue-600 hover:from-blue-800 hover:to-blue-500 text-white shadow-blue-200" : "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-blue-50"
                                        )}
                                    >
                                        {plan.buttonText}
                                    </Button>

                                    <ul className="w-full space-y-3 text-left">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Lightning weight="fill" className="w-3 h-3 text-blue-600" />
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Highlights</span>
                                        </div>
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 group">
                                                {i < 2 ? (
                                                    <Lightning weight="fill" className="w-3 h-3 text-blue-600 mt-0.5 shrink-0" />
                                                ) : (
                                                    <Check weight="bold" className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                                                )}
                                                <span className={cn("text-[11px] leading-tight font-medium", i < 2 ? "text-slate-700 font-black" : "text-slate-600")}>
                                                    {feature}
                                                    {feature.includes('?') && <span className="ml-1 text-slate-300">ⓘ</span>}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 text-center space-y-6">
                            <p className="text-[10px] text-slate-400 font-bold italic tracking-wide">* Unlimited AI creations refers to everyday use under fair use. Premium features (Agent, advanced models, & API) require credits</p>

                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="bg-blue-600 p-2 rounded-xl">
                                        <div className="w-8 h-8 flex items-center justify-center font-black text-white">Γ</div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-black text-slate-900">We're a SOC 2 Type II compliant organization.</p>
                                        <p className="text-[10px] font-bold text-slate-400">Learn more at our <span className="text-blue-600 underline cursor-pointer">Trust Center</span> ↗</p>
                                    </div>
                                </div>
                                <p className="text-[11px] font-black text-slate-500 cursor-pointer hover:text-blue-600 transition-colors">Learn more about our paid plans</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
