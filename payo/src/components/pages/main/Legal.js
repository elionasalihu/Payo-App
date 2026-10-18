import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { PayoWordmark } from "../auth/AuthLayout";

const CONTENT = {
  privacy: {
    eyebrow: "PRIVACY",
    title: (
      <>
        Privacy <em>policy.</em>
      </>
    ),
    sections: [
      [
        "What we store",
        "Your name, email address, and the groups, expenses and payments you and your group members add. Passwords are handled by Supabase Auth and are never visible to Payo.",
      ],
      [
        "Who can see it",
        "Only members of a group can see that group’s expenses, balances and members. Platform administrators can view data to keep the service running.",
      ],
      [
        "Deleting your data",
        "You can leave any group at any time. To delete your account entirely, contact the project team.",
      ],
    ],
  },
  terms: {
    eyebrow: "TERMS",
    title: (
      <>
        Terms of <em>use.</em>
      </>
    ),
    sections: [
      [
        "About Payo",
        "Payo is a university degree project for tracking shared expenses. It does not move money; it only records who paid what.",
      ],
      [
        "Your responsibility",
        "You are responsible for the accuracy of the expenses you add and for settling debts with other members outside the app.",
      ],
      ["No warranty", "Payo is provided as-is, without guarantees of availability or accuracy."],
    ],
  },
};

function Legal({ page }) {
  const c = CONTENT[page];
  return (
    <div className="auth-page not-found">
      <div className="auth-form-side">
        <div className="auth-form-top">
          <PayoWordmark />
        </div>
        <div className="auth-card legal-card">
          <span className="auth-eyebrow">{c.eyebrow}</span>
          <h1>{c.title}</h1>
          {c.sections.map(([h, p]) => (
            <section key={h} className="legal-section">
              <h2>{h}</h2>
              <p>{p}</p>
            </section>
          ))}
          <div className="auth-form">
            <Link to="/" className="auth-submit">
              <ArrowLeft size={16} /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Legal;
