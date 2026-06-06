import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import {
  ArrowRight,
  CalendarDays,
  PiggyBank,
  Users2,
  Sparkles,
  MapPin,
  Plane,
  Compass,
  Globe2,
  Heart,
  Star,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'

const HERO =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80'

const SIDE_PHOTOS = [
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=900&q=80',
]

const DESTINATIONS = [
  {
    name: 'Kyoto',
    country: 'Japan',
    img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
    tag: 'Cultural',
  },
  {
    name: 'Santorini',
    country: 'Greece',
    img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    tag: 'Beach',
  },
  {
    name: 'Banff',
    country: 'Canada',
    img: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80',
    tag: 'Mountains',
  },
  {
    name: 'Marrakech',
    country: 'Morocco',
    img: 'https://images.unsplash.com/photo-1597211833712-5e41faa202ea?auto=format&fit=crop&w=1200&q=80',
    tag: 'Adventure',
  },
  {
    name: 'Reykjavik',
    country: 'Iceland',
    img: 'https://images.unsplash.com/photo-1539066319993-f0a87b48aaef?auto=format&fit=crop&w=1200&q=80',
    tag: 'Nature',
  },
  {
    name: 'Lisbon',
    country: 'Portugal',
    img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80',
    tag: 'City',
  },
]

const TESTIMONIALS = [
  {
    name: 'Mira K.',
    role: 'Planned Tokyo with 6 friends',
    quote:
      'Wanderly turned a 27-message group chat into one shared itinerary. The budget split alone saved our friendship.',
  },
  {
    name: 'Diego R.',
    role: 'Solo backpacker, 14 countries',
    quote:
      'The AI recommendations were eerily good. Found a cevicheria in Lima I would have missed in three lifetimes.',
  },
  {
    name: 'Priya S.',
    role: 'Bachelorette trip organizer',
    quote:
      'Every bride should be required to use this. Live sharing meant zero "wait where are we meeting?" texts.',
  },
]

function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Logo dark className="text-white" />
      </motion.div>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center gap-2"
      >
        <Link
          to="/login"
          className="rounded-full border border-white/40 bg-white/0 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          log in
        </Link>
        <Link
          to="/signup"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink-900 transition hover:bg-white/90"
        >
          sign up
        </Link>
      </motion.nav>
    </header>
  )
}

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} className="relative h-[92vh] min-h-[600px] w-full overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <img
          src={HERO}
          alt="Mountain lake"
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
      </motion.div>

      <Header />

      <motion.div
        className="absolute -left-10 top-32 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-20 top-48 h-96 w-96 rounded-full bg-dolly-400/25 blur-3xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full flex-col justify-end px-6 pb-14 pt-28 md:px-16 md:pb-20 lg:pb-28"
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
          }}
          className="max-w-3xl"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur sm:text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">new · collaborative trip planning, made simple</span>
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="lower font-display text-[3rem] font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl xl:text-8xl"
          >
            make travel
            <br />
            wander
            <span className="bg-gradient-to-r from-brand-300 via-dolly-400 to-saffron-300 bg-clip-text text-transparent">
              ful
            </span>
            <span className="text-brand-300">.</span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-sm text-white/85 sm:text-base lg:text-lg"
          >
            Plan trips with friends, split costs without the awkward math, and discover places
            that actually fit your vibe — all in one place.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900 shadow-glow transition hover:translate-y-[-1px] hover:shadow-2xl"
            >
              explore now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              I already have an account
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 grid max-w-2xl grid-cols-3 gap-4 text-white sm:gap-10 lg:mt-12"
        >
          {[
            { v: '120k+', l: 'trips planned' },
            { v: '94%', l: 'on-budget' },
            { v: '4.9★', l: 'avg rating' },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-2xl font-bold sm:text-3xl">{s.v}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-white/70">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/70"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em]"
        >
          scroll
          <span className="block h-8 w-[1px] bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function FeaturesBlock() {
  return (
    <section className="relative bg-white px-6 py-24 md:px-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.3fr]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="relative grid grid-cols-2 gap-3"
        >
          <motion.img
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            src={SIDE_PHOTOS[0]}
            alt="Mountain reflection"
            className="aspect-[3/4] w-full rounded-3xl object-cover shadow-card"
          />
          <motion.img
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            src={SIDE_PHOTOS[1]}
            alt="Kinkaku-ji temple"
            className="mt-10 aspect-[3/4] w-full rounded-3xl object-cover shadow-card"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -right-4 top-12 hidden rounded-2xl bg-white px-4 py-3 shadow-card sm:block"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-caper-100 text-caper-700">
                <Plane className="h-3.5 w-3.5" />
              </span>
              <div>
                <div className="font-semibold">Flight booked</div>
                <div className="text-ink-900/50">LAX → TPE · $612</div>
              </div>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -left-3 bottom-6 hidden rounded-2xl bg-white px-4 py-3 shadow-card sm:block"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-dolly-100 text-dolly-700">
                <Heart className="h-3.5 w-3.5" />
              </span>
              <div>
                <div className="font-semibold">5 friends invited</div>
                <div className="text-ink-900/50">Kyoto, May 2026</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lower font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl"
          >
            trip planning &mdash; <span className="text-brand-600">made simple.</span>
          </motion.h2>
          <p className="mt-4 max-w-xl text-ink-900/65">
            Everything you need to go from "we should do a trip" to standing at the gate together
            — in one calm, beautiful workspace.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={<CalendarDays className="h-5 w-5" />}
              title="easy planning"
              text="plan your trip itinerary with the help of our personalized recommendations."
            />
            <FeatureCard
              icon={<PiggyBank className="h-5 w-5" />}
              title="budget tracking"
              text="stay on top of your finances with our built-in tracker, including shared expenses."
              accent
            />
            <FeatureCard
              icon={<Users2 className="h-5 w-5" />}
              title="live sharing"
              text="share live schedules with your travel companions — making sure everyone is aligned on plans."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, text, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -4 }}
      className={`group rounded-2xl p-5 transition ${
        accent
          ? 'bg-gradient-to-br from-brand-50 to-brand-100 ring-1 ring-brand-200'
          : 'bg-brand-50/60 ring-1 ring-brand-100'
      }`}
    >
      <div className="mb-4 inline-grid h-9 w-9 place-items-center rounded-lg bg-white text-brand-600 shadow-sm transition group-hover:scale-105">
        {icon}
      </div>
      <h3 className="lower font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-ink-900/60">{text}</p>
    </motion.div>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'create your trip',
      text: 'Pick a name, dates, and destination. Wanderly preps a clean workspace in seconds.',
      icon: <Compass className="h-5 w-5" />,
    },
    {
      n: '02',
      title: 'invite your crew',
      text: 'Share a link. Everyone joins, edits, and votes — no spreadsheets, no group chat scroll.',
      icon: <Users2 className="h-5 w-5" />,
    },
    {
      n: '03',
      title: 'build the itinerary',
      text: 'Drag activities onto the calendar. Pull from AI picks tailored to your taste.',
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      n: '04',
      title: 'travel together',
      text: 'Live updates, real-time budget splits, and one source of truth on the road.',
      icon: <Globe2 className="h-5 w-5" />,
    },
  ]
  return (
    <section className="relative overflow-hidden bg-ink-900 px-6 py-24 text-white md:px-16">
      <div className="absolute inset-0 -z-0 opacity-50">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-saffron-400/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-brand-300">how it works</p>
          <h2 className="lower mt-3 font-display text-4xl font-extrabold leading-tight md:text-5xl">
            from "let's do this" to <span className="text-brand-300">"we're here"</span>.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="card-dark relative overflow-hidden p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display text-sm font-bold tracking-widest text-brand-300">
                  {s.n}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white">
                  {s.icon}
                </span>
              </div>
              <h3 className="lower font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-white/65">{s.text}</p>
              <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Destinations() {
  return (
    <section className="bg-sand px-6 py-24 md:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-brand-700">trending</p>
            <h2 className="lower mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              where wanderers <span className="text-brand-600">are headed</span>.
            </h2>
          </motion.div>
          <Link
            to="/signup"
            className="hidden items-center gap-2 text-sm font-semibold text-ink-900 hover:text-brand-700 sm:inline-flex"
          >
            view all destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((d, i) => (
            <motion.article
              key={d.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="group relative isolate overflow-hidden rounded-3xl shadow-card"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <motion.img
                  src={d.img}
                  alt={d.name}
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/70">{d.country}</div>
                  <h3 className="lower font-display text-2xl font-bold">{d.name}</h3>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium uppercase tracking-wider backdrop-blur">
                  {d.tag}
                </span>
              </div>
              <div className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow-card transition group-hover:opacity-100">
                <MapPin className="h-4 w-4" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="bg-white px-6 py-24 md:px-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10 max-w-2xl"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-brand-700">loved by groups</p>
          <h2 className="lower mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            real wanderers, <span className="text-brand-600">real trips.</span>
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-ink-900/5 bg-brand-50/40 p-6 shadow-sm"
            >
              <div className="flex gap-1 text-saffron-400">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-ink-900/85">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-300 to-brand-700"
                  aria-hidden
                />
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-ink-900/60">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="relative overflow-hidden bg-ink-900 px-6 py-24 text-white md:px-16">
      <div className="absolute inset-0 opacity-60">
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=80"
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/70 to-ink-900/30" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <h2 className="lower font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            your next trip is <span className="text-brand-300">one click away.</span>
          </h2>
          <p className="mt-4 max-w-xl text-white/75">
            Free forever for groups up to 10. No credit card. Just open the app and go.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-ink-900 shadow-glow transition hover:translate-y-[-1px]"
            >
              start planning <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              log in
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-ink-900 px-6 pb-10 text-white/70 md:px-16">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
        <Logo dark className="text-white" />
        <div className="text-xs">
          © {new Date().getFullYear()} Wanderly · INF124 · UCI · made with care
        </div>
        <div className="flex gap-5 text-xs">
          <a href="#" className="hover:text-white">about</a>
          <a href="#" className="hover:text-white">privacy</a>
          <a href="#" className="hover:text-white">contact</a>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <main className="overflow-x-hidden bg-white">
      <Hero />
      <FeaturesBlock />
      <HowItWorks />
      <Destinations />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
