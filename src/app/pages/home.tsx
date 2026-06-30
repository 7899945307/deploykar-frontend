import { Link } from 'react-router';
import { Header } from '../components/header';
import { Button } from '../components/ui/button';
import { Zap, Globe, Shield, Clock, ArrowRight, Terminal, GitBranch, Layers } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center">

        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm mb-8"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>🚀 Auto-deploy is LIVE — powered by Cloudflare CDN</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.1] mb-6"
            >
              Deploy in seconds.<br />
              <span className="text-primary">Not lowdekebal bsdike.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed"
            >
              Deploy frontend, backend, and full-stack apps with one push.
              Automated builds, SSL, CDN, and scaling — all handled.
              <br /><br />
              <span className="text-emerald-400 font-semibold">✅ v2 - Auto-deploy is working! Pushed at {new Date().toISOString().slice(0,16)}</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <Link to="/get-started">
                <Button size="lg" className="h-12 px-8 text-base gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                  Start Deploying
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base hover:bg-muted transition-colors">
                  View Plans
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Deploy Pipeline Animation */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-2xl shadow-black/10 p-8 overflow-hidden relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-mono text-muted-foreground">production pipeline</span>
                </div>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}
                  className="text-xs font-mono text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                  ALL SYSTEMS GO
                </motion.span>
              </div>
              <div className="relative flex items-center justify-between gap-2">
                {[
                  { label: 'Build', sublabel: 'Compiling', delay: 0.8, gradient: 'from-orange-500 to-red-500' },
                  { label: 'Test', sublabel: '142 passed', delay: 1.4, gradient: 'from-yellow-500 to-orange-500' },
                  { label: 'Package', sublabel: 'Docker image', delay: 2.0, gradient: 'from-blue-500 to-cyan-500' },
                  { label: 'Deploy', sublabel: '12 regions', delay: 2.6, gradient: 'from-green-500 to-emerald-500' },
                  { label: 'Live', sublabel: '< 50ms', delay: 3.2, gradient: 'from-primary to-orange-400' },
                ].map((stage, i) => (
                  <div key={stage.label} className="flex items-center flex-1">
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: stage.delay, type: 'spring', stiffness: 200 }}
                      className="flex flex-col items-center gap-2 flex-1">
                      <motion.div
                        initial={{ boxShadow: '0 0 0 0 rgba(232, 93, 4, 0)' }}
                        animate={{ boxShadow: '0 0 20px 4px rgba(232, 93, 4, 0.2)' }}
                        transition={{ delay: stage.delay + 0.3, duration: 0.5 }}
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center shadow-lg`}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ delay: stage.delay + 0.5, type: 'spring' }}
                          className="text-white font-bold text-lg">✓</motion.div>
                      </motion.div>
                      <div className="text-center">
                        <div className="text-xs font-semibold text-foreground">{stage.label}</div>
                        <div className="text-[10px] text-muted-foreground">{stage.sublabel}</div>
                      </div>
                    </motion.div>
                    {i < 4 && (
                      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                        transition={{ delay: stage.delay + 0.4, duration: 0.4 }}
                        className="h-0.5 flex-1 bg-gradient-to-r from-primary/60 to-primary/20 origin-left mx-1 mt-[-20px]" />
                    )}
                  </div>
                ))}
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.8 }}
                className="mt-8 pt-6 border-t border-border grid grid-cols-4 gap-4">
                {[
                  { label: 'Build Time', value: '12s' },
                  { label: 'Bundle Size', value: '248kb' },
                  { label: 'Lighthouse', value: '98/100' },
                  { label: 'Response', value: '47ms' },
                ].map((metric) => (
                  <div key={metric.label} className="text-center">
                    <div className="text-lg font-bold text-foreground">{metric.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{metric.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid grid-cols-3 gap-8">
            {[{ value: '99.9%', label: 'Uptime SLA' }, { value: '2M+', label: 'Deployments' }, { value: '<3s', label: 'Avg Deploy Time' }].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="text-center">
                <div className="text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Everything you need to ship</h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">From push to production in seconds. No infrastructure headaches.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Terminal, title: 'One Command Deploy', desc: 'Push to Git or run one CLI command. We handle the rest.' },
            { icon: Globe, title: 'Global Edge Network', desc: '12+ regions. Your app loads fast everywhere.' },
            { icon: Shield, title: 'Security Built-in', desc: 'Auto SSL, DDoS protection, and SOC2 compliance.' },
            { icon: Clock, title: 'Zero Downtime', desc: 'Rolling deploys keep your app online during updates.' },
          ].map((feature, i) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                <feature.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Three steps. That's it.</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: GitBranch, title: 'Connect Repo', desc: 'Link your GitHub or GitLab repository.' },
              { step: '02', icon: Layers, title: 'Configure', desc: 'Pick your framework. We auto-detect settings.' },
              { step: '03', icon: Zap, title: 'Deploy', desc: 'Every push triggers a build. Instant preview URLs.' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative p-8 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
                <div className="text-7xl font-bold text-primary/10 absolute top-4 right-6 select-none">{item.step}</div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-12 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to deploy?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join thousands of developers shipping faster with Deploy<span className="text-primary">Kar</span>.</p>
            <Link to="/get-started">
              <Button size="lg" className="h-12 px-8 text-base gap-2 shadow-lg shadow-primary/20">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">© 2026 Deploy<span className="text-primary">Kar</span>. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
