import "../../styles/main/Home.css";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Layers3,
  Plus,
  ReceiptText,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import { Link } from "react-router-dom";

import Header from "../../sections/Header";
import Footer from "../../sections/Footer";
import CtaBanner from "../../sections/CTA";


const features = [
  {
    icon: Users,
    title: "Create groups",
    text: "Create a group for trips, apartments, dinners, projects, or anything you share with others.",
  },
  {
    icon: ReceiptText,
    title: "Add expenses",
    text: "Record who paid, what it was for, and how much everyone owes.",
  },
  {
    icon: Layers3,
    title: "Split automatically",
    text: "Payo calculates everyone's share so you don't have to do the math yourself.",
  },
  {
    icon: ShieldCheck,
    title: "Stay organized",
    text: "Keep expenses, balances, and settlements together in one simple place.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create a group",
    text: "Start a shared space for your friends, roommates, trip, or project.",
  },
  {
    number: "02",
    title: "Add your expenses",
    text: "Enter the expense and choose who participated.",
  },
  {
    number: "03",
    title: "Settle up",
    text: "See exactly who owes whom and keep everything organized.",
  },
];

function DashboardPreview() {
  return (
    <div className="dashboard-preview">
      <div className="dashboard-topbar">
        <div className="dashboard-brand">
          <span>
            <span>pay</span>
            <span className="payo-logo-o">o</span>
            <span className="payo-logo-text">.</span>
          </span>   
        </div>

        <div className="dashboard-avatar">JD</div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <span className="dashboard-label">YOUR OVERVIEW</span>
            <h3>Good morning, John</h3>
          </div>

          <button className="dashboard-add">
            <Plus size={15} />
            Add expense
          </button>
        </div>

        <div className="balance-grid">
          <div className="balance-card balance-main">
            <span>Total balance</span>
            <strong>€124.50</strong>
            <small className="positive">You are owed €124.50</small>
          </div>

          <div className="balance-card">
            <span>You owe</span>
            <strong>€42.00</strong>
            <small>3 people</small>
          </div>

          <div className="balance-card">
            <span>You're owed</span>
            <strong>€166.50</strong>
            <small>5 people</small>
          </div>
        </div>

        <div className="dashboard-lower">
          <div className="activity-card">
            <div className="card-heading">
              <span>Recent activity</span>
              <button>View all</button>
            </div>

            <div className="activity-row">
              <div className="activity-icon">
                <CreditCard size={16} />
              </div>

              <div className="activity-info">
                <strong>Apartment groceries</strong>
                <span>Today · Apartment</span>
              </div>

              <strong className="activity-price">€48.20</strong>
            </div>

            <div className="activity-row">
              <div className="activity-icon">
                <ReceiptText size={16} />
              </div>

              <div className="activity-info">
                <strong>Dinner at Noma</strong>
                <span>Yesterday · Weekend trip</span>
              </div>

              <strong className="activity-price">€86.00</strong>
            </div>

            <div className="activity-row">
              <div className="activity-icon">
                <WalletCards size={16} />
              </div>

              <div className="activity-info">
                <strong>Taxi</strong>
                <span>Yesterday · Weekend trip</span>
              </div>

              <strong className="activity-price">€24.50</strong>
            </div>
          </div>

          <div className="groups-card">
            <div className="card-heading">
              <span>Your groups</span>
              <button>See all</button>
            </div>

            <div className="group-item">
              <div className="group-icon group-green">W</div>
              <div>
                <strong>Weekend trip</strong>
                <span>6 members</span>
              </div>
              <ChevronRight size={16} />
            </div>

            <div className="group-item">
              <div className="group-icon group-blue">A</div>
              <div>
                <strong>Apartment</strong>
                <span>3 members</span>
              </div>
              <ChevronRight size={16} />
            </div>

            <div className="group-item">
              <div className="group-icon group-orange">F</div>
              <div>
                <strong>Football team</strong>
                <span>12 members</span>
              </div>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupsPreview() {
  return (
    <div className="groups-preview">
      <div className="groups-preview-header">
        <div>
          <span>GROUP</span>
          <h3>Weekend in Prizren</h3>
        </div>

        <div className="member-stack">
          <span>JD</span>
          <span>AM</span>
          <span>LK</span>
          <span>+3</span>
        </div>
      </div>

      <div className="group-total">
        <div>
          <span>Total expenses</span>
          <strong>€642.80</strong>
        </div>

        <div className="group-status">
          <Check size={14} />
          6 members
        </div>
      </div>

      <div className="expense-list">
        <div className="expense-item">
          <div className="expense-left">
            <div className="expense-icon">
              <ReceiptText size={17} />
            </div>

            <div>
              <strong>Hotel</strong>
              <span>Paid by Dren</span>
            </div>
          </div>

          <strong>€280.00</strong>
        </div>

        <div className="expense-item">
          <div className="expense-left">
            <div className="expense-icon">
              <CircleDollarSign size={17} />
            </div>

            <div>
              <strong>Restaurant</strong>
              <span>Paid by Arta</span>
            </div>
          </div>

          <strong>€186.50</strong>
        </div>

        <div className="expense-item">
          <div className="expense-left">
            <div className="expense-icon">
              <CreditCard size={17} />
            </div>

            <div>
              <strong>Transport</strong>
              <span>Paid by Luan</span>
            </div>
          </div>

          <strong>€176.30</strong>
        </div>
      </div>

      <div className="settlement-box">
        <div>
          <span>Suggested settlement</span>
          <strong>3 payments</strong>
        </div>

        <ArrowUpRight size={18} />
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="payo-home">
      <Header />

      <main>
        {/* HERO */}
        <section className="payo-hero">
          <div className="hero-inner">
            <motion.div
              className="hero-copy"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                SIMPLE SHARED EXPENSES
              </div>

              <h1>
                Split expenses.
                <br />
                <em>Keep things simple.</em>
              </h1>

              <p className="hero-description">
                Payo makes it easy to manage shared expenses, split bills,
                and keep track of who owes what.
              </p>

              <div className="hero-actions">
                <Link to="/register" className="hero-primary-button">
                  Get started
                  <ArrowUpRight size={17} />
                </Link>

                <a href="#how-it-works" className="hero-secondary-button">
                  See how it works
                  <ChevronRight size={16} />
                </a>
              </div>

              <div className="hero-note">
                <Check size={15} />
                Free to use · Built for groups
              </div>
            </motion.div>

            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </section>

        {/* INTRO STRIP */}
        <section className="payo-intro-strip">
          <div className="intro-inner">
            <span className="intro-label">MADE FOR SHARED LIFE</span>

            <p>
              From weekend trips to monthly rent, Payo keeps every shared
              expense clear and organized.
            </p>

            <div className="intro-arrow">
              <ArrowDownIcon />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="payo-section" id="features">
          <div className="section-container">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">WHAT YOU CAN DO</span>

                <h2>
                  Less calculating.
                  <br />
                  <em>More living.</em>
                </h2>
              </div>

              <p>
                Everything you need to manage shared money without spreadsheets,
                notes, or awkward calculations.
              </p>
            </div>

            <div className="feature-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.article
                    className="feature-card"
                    key={feature.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.08,
                    }}
                  >
                    <div className="feature-number">
                      0{index + 1}
                    </div>

                    <div className="feature-icon">
                      <Icon size={21} strokeWidth={1.7} />
                    </div>

                    <h3>{feature.title}</h3>

                    <p>{feature.text}</p>

                    <span className="feature-arrow">
                      <ArrowUpRight size={16} />
                    </span>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* PRODUCT SECTION */}
        <section className="product-section" id="how-it-works">
          <div className="section-container">
            <div className="product-grid">
              <motion.div
                className="product-copy"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="section-eyebrow">YOUR MONEY, ORGANIZED</span>

                <h2>
                  Know exactly
                  <br />
                  <em>where you stand.</em>
                </h2>

                <p>
                  Payo gives every group a clear overview of expenses,
                  balances, members, and settlements. No more wondering who
                  paid for dinner or how much you owe.
                </p>

                <div className="product-checks">
                  <div>
                    <span>
                      <Check size={14} />
                    </span>
                    Automatic balance calculations
                  </div>

                  <div>
                    <span>
                      <Check size={14} />
                    </span>
                    Shared group expense history
                  </div>

                  <div>
                    <span>
                      <Check size={14} />
                    </span>
                    Simple settlement overview
                  </div>
                </div>

                <Link to="/register" className="text-link">
                  Start using Payo
                  <ArrowUpRight size={16} />
                </Link>
              </motion.div>

              <motion.div
                className="product-visual"
                initial={{ opacity: 0, x: 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <GroupsPreview />
              </motion.div>
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section className="steps-section">
          <div className="section-container">
            <div className="steps-heading">
              <span className="section-eyebrow">HOW IT WORKS</span>

              <h2>
                Three steps.
                <br />
                <em>That's it.</em>
              </h2>
            </div>

            <div className="steps-grid">
              {steps.map((step, index) => (
                <motion.div
                  className="step"
                  key={step.number}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                >
                  <span className="step-number">{step.number}</span>

                  <div className="step-line" />

                  <h3>{step.title}</h3>

                  <p>{step.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* REUSABLE CTA */}
        <section className="cta-wrapper">
          <div className="section-container">
            <CtaBanner />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="m18 13-6 6-6-6" />
    </svg>
  );
}

export default Home;