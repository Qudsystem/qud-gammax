import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Basic shims for browser environment
if (typeof global === 'undefined') {
    window.global = window;
}
if (typeof process === 'undefined') {
    window.process = { env: {} } as any;
}

// Mock window.spark for local development
if (!window.spark) {
    window.spark = {
        llm: async (prompt: string, model: string, json?: boolean) => {
            console.log('Mock Spark LLM call:', { prompt, model, json });
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (json) {
                // Extract requested number of slides from prompt
                const slideMatch = prompt.match(/EXACTLY (\d+) slides/);
                const requestedSlides = slideMatch ? parseInt(slideMatch[1]) : 6;

                console.log(`Mocking generation of ${requestedSlides} slides...`);

                // Professional mock templates
                const mockThemes = [
                    {
                        title: "Future of AI in Enterprise",
                        desc: "How generative models are reshaping corporate strategy and operational efficiency.",
                        topics: [
                            "The Generative AI Landscape", "Strategic Integration Frameworks", "Upskilling the Workforce",
                            "Ethical AI and Governance", "Case Studies: Success Stories", "Future Roadmap 2025"
                        ]
                    },
                    {
                        title: "Sustainability and Green Innovation",
                        desc: "Strategic approaches to achieving net-zero emissions through technological breakthroughs.",
                        topics: [
                            "Current Environmental Challenges", "The Circular Economy Model", "Renewable Energy Breakthroughs",
                            "Measuring Impact: ESG Metrics", "Global Policy Compliance", "Our Vision for 2030"
                        ]
                    }
                ];

                const theme = mockThemes[Math.floor(Math.random() * mockThemes.length)];

                // Generate dynamic slides based on the selected theme
                const mockSlides = Array.from({ length: requestedSlides }, (_, i) => {
                    const topicIndex = i % theme.topics.length;
                    const topic = theme.topics[topicIndex];

                    let layout: any = 'bullets';
                    if (i === 0) layout = 'title';
                    else if (i === 1) layout = 'stats-grid';
                    else if (i % 8 === 0) layout = 'chart';
                    else if (i % 7 === 0) layout = 'flowchart';
                    else if (i % 6 === 0) layout = 'diagram';
                    else if (i % 5 === 0) layout = 'two-column';
                    else if (i % 4 === 0) layout = 'image-text';

                    const animations: any[] = ['fade', 'slide', 'zoom'];
                    const animation = animations[i % animations.length];

                    let flowchart, shapes, chart;

                    if (layout === 'chart') {
                        chart = {
                            type: 'bar',
                            data: [
                                { label: 'Q1 2024', value: 450 },
                                { label: 'Q2 2024', value: 680 },
                                { label: 'Q3 2024', value: 920 },
                                { label: 'Q4 2024', value: 1250 }
                            ]
                        };
                    }

                    if (layout === 'flowchart') {
                        flowchart = {
                            nodes: [
                                { id: '1', label: 'Analysis & Research', type: 'start' },
                                { id: '2', label: 'Prototype Design', type: 'process' },
                                { id: '3', label: 'User Validation', type: 'decision' },
                                { id: '4', label: 'Enterprise Scaling', type: 'process' },
                                { id: '5', label: 'Global Release', type: 'end' }
                            ],
                            edges: [
                                { fromIndex: 0, toIndex: 1 },
                                { fromIndex: 1, toIndex: 2 },
                                { fromIndex: 2, toIndex: 3, label: 'Approved' },
                                { fromIndex: 3, toIndex: 4 }
                            ]
                        };
                    }

                    if (layout === 'diagram') {
                        shapes = [
                            { type: 'hexagon', label: 'Data Input', color: '#10b981', intensity: 'glow' },
                            { type: 'triangle', label: 'Processing', color: '#3b82f6', intensity: 'solid' },
                            { type: 'diamond', label: 'Evaluation', color: '#f59e0b', intensity: 'soft' }
                        ];
                    }

                    const content = layout === 'stats-grid'
                        ? ['99.9% : System Uptime', '15.4M : Annual Revenue', '2.8s : Latency Reduc.', '94% : Cust. Satisfaction', '45% : Efficiency Gain', '12 : Global Hubs']
                        : layout === 'bullets'
                            ? [
                                `Comprehensive strategic alignment for ${topic.toLowerCase()} implementation.`,
                                `Leveraging advanced machine learning models for predictive analysis.`,
                                `Stakeholder engagement plan focused on transparency and ROI.`,
                                `Scalability framework for seamless global deployment across regions.`
                            ]
                            : [
                                `Detailed deep-dive into ${topic.toLowerCase()} optimization strategies.`,
                                `Focusing on high-impact areas where efficiency gains exceed 40%.`
                            ];

                    const icons: string[] = ['ChartLine', 'Gear', 'Cube', 'Users', 'Rocket', 'Shield', 'Globe', 'Lightning'];
                    const icon = icons[i % icons.length];

                    return {
                        id: `slide-${i + 1}`,
                        layout,
                        title: i === 0 ? theme.title : topic,
                        content,
                        notes: `Comprehensive expert notes for ${topic}. Include data on market trends and competitor benchmarks.`,
                        animation,
                        flowchart,
                        shapes,
                        chart,
                        icon,
                        ...(layout === 'image-text' ? { needsImage: true, imagePrompt: `hyper-realistic professional visualization of ${topic}, 8k resolution, cinematic lighting` } : {})
                    };
                });

                return JSON.stringify({
                    title: theme.title,
                    description: theme.desc,
                    slides: mockSlides
                });
            }
            return "A futuristic digital abstract visualization of artificial intelligence concepts, glowing blue and purple nodes.";
        }
    };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
