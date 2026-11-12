import { motion } from 'framer-motion'
import { Plus, Fire, Briefcase, ChartLineUp } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

export function TemplatesView() {
    const categories = [
        {
            id: 'popular',
            label: 'Popular',
            description: "What's hot at Gamma right now 🔥",
            icon: Fire,
            templates: [
                { id: '1', title: 'Marketing Strategy', type: 'Presentation', color: 'bg-emerald-900' },
                { id: '2', title: 'Startup Pitch Deck', type: 'Deck Template', color: 'bg-slate-800' },
                { id: '3', title: 'Project Kickoff', type: 'Template', color: 'bg-rose-900' },
            ]
        },
        {
            id: 'projects',
            label: 'Projects & Collaboration',
            description: "Templates to help you run your business ⚡",
            icon: Briefcase,
            templates: [
                { id: '4', title: 'Six Hats Brainstorming', type: 'Workshop', color: 'bg-blue-50' },
                { id: '5', title: 'New Teammate Welcome', type: 'Onboarding', color: 'bg-slate-100' },
                { id: '6', title: 'Go to Market Strategy', type: 'Plan', color: 'bg-white' },
                { id: '7', title: 'Hiring Plan', type: 'HR', color: 'bg-indigo-50' },
            ]
        },
        {
            id: 'sales',
            label: 'Sales & Marketing',
            description: "Templates to help you grow your business 🌲",
            icon: ChartLineUp,
            templates: [
                { id: '8', title: 'Quarterly Marketing Strategy', type: 'Report', color: 'bg-emerald-950' },
                { id: '9', title: 'Brand Partnership Proposal', type: 'Proposal', color: 'bg-indigo-900' },
                { id: '10', title: 'Startup Pitch Deck', type: 'Sales', color: 'bg-slate-900' },
                { id: '11', title: 'Company Fact Sheet', type: 'Doc', color: 'bg-orange-50' },
                { id: '12', title: 'Deal Review', type: 'Review', color: 'bg-slate-200' },
            ]
        }
    ]

    return (
        <div className="p-12 max-w-[1600px] mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Briefcase weight="fill" className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-sm">Templates</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Templates</h1>
                <p className="text-slate-500 mt-2 font-medium">Start with our built-in templates, or create your own to match your team's workflows</p>
            </div>

            <div className="flex items-center justify-between mb-12">
                <Tabs defaultValue="standard">
                    <TabsList className="bg-slate-100/50 p-1 rounded-xl h-11 border border-slate-100">
                        <TabsTrigger value="custom" className="px-6 rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600">Custom</TabsTrigger>
                        <TabsTrigger value="standard" className="px-6 rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600">Standard</TabsTrigger>
                        <TabsTrigger value="archived" className="px-6 rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600">Archived</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-black gap-2 shadow-lg shadow-blue-200">
                    <Plus weight="bold" />
                    Add a gamma <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] uppercase">PRO</span>
                </Button>
            </div>

            <div className="space-y-16">
                {categories.map((cat) => (
                    <section key={cat.id}>
                        <div className="mb-6">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">{cat.label}</h2>
                            <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-wider">{cat.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {cat.templates.map((tpl, i) => (
                                <motion.div
                                    key={tpl.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[1.4/1] bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group-hover:shadow-2xl group-hover:-translate-y-2 transition-all relative">
                                        <div className={`h-[65%] w-full ${tpl.color} flex flex-col p-6 text-white relative overflow-hidden`}>
                                            <div className="text-[10px] font-black opacity-40 mb-1">G1</div>
                                            <h3 className="text-lg font-black leading-tight max-w-[120px]">{tpl.title}</h3>
                                            <div className="absolute top-4 right-4 text-[10px] font-black uppercase opacity-40">Company</div>

                                            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 blur-2xl rounded-full" />
                                        </div>
                                        <div className="p-5 flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-900 line-clamp-1">{tpl.title}</span>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus weight="bold" className="w-4 h-4 text-blue-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}
