import { Link } from 'react-router-dom';
import { LegalPage, LegalSection } from '@/components/LegalPage';
import { LEGAL, legalValue } from '@/lib/legal';

const Terms = () => {
  const entity = legalValue(LEGAL.entityName, 'legal entity name');
  const contact = legalValue(LEGAL.contactEmail, 'contact email');
  const law = legalValue(LEGAL.governingLaw, 'governing law');

  const sections: LegalSection[] = [
    {
      heading: 'The service',
      body: (
        <p>
          {LEGAL.appName} is a personal finance app operated by {entity}. It helps you record and
          understand your income, spending, budgets, debts, savings and assets, and share expenses
          with other people.
        </p>
      ),
    },
    {
      heading: 'Not financial advice',
      body: (
        <p>
          {LEGAL.appName} gives you information and tools. It is not a bank, broker or licensed
          financial adviser, and nothing in the app is investment, tax or legal advice. Decisions you
          make with your money are your own; consider speaking to a qualified professional.
        </p>
      ),
    },
    {
      heading: 'AI features',
      body: (
        <p>
          Some features use artificial intelligence to categorise transactions, read what you type or
          say, and suggest insights. AI output can be wrong or incomplete. Check anything important
          before relying on it.
        </p>
      ),
    },
    {
      heading: 'Your account',
      body: (
        <ul>
          <li>You must be at least 18 to use {LEGAL.appName}.</li>
          <li>Keep your sign-in details private. You are responsible for activity on your account.</li>
          <li>The figures in the app are only as accurate as the information you provide.</li>
        </ul>
      ),
    },
    {
      heading: 'Community and shared features',
      body: (
        <>
          <p>When you post, comment, join circles or share expenses with others, you agree not to:</p>
          <ul>
            <li>post anything unlawful, abusive, misleading or that infringes someone else's rights;</li>
            <li>promote financial products or schemes, or present yourself as a licensed adviser;</li>
            <li>share other people's personal or financial information without their permission.</li>
          </ul>
          <p>We may remove content or suspend accounts that break these rules.</p>
        </>
      ),
    },
    {
      heading: 'Plans and payments',
      body: (
        <p>
          The core app is free. Where paid plans are offered, the price, billing period and renewal
          terms are shown before you buy, and payment is taken by the app store or payment provider
          named at checkout. You can cancel a paid plan at any time; access continues until the end of
          the period already paid for.
        </p>
      ),
    },
    {
      heading: 'Acceptable use',
      body: (
        <p>
          Do not misuse the service: no attempts to access other people's data, to disrupt or overload
          the app, to reverse-engineer it, or to use it for unlawful purposes.
        </p>
      ),
    },
    {
      heading: 'Ending your account',
      body: (
        <p>
          You can delete your account at any time in the app under Settings, then Data, then Delete
          account. We may suspend or close an account that breaks these terms. Our{' '}
          <Link to="/privacy">Privacy Policy</Link> explains what happens to your data.
        </p>
      ),
    },
    {
      heading: 'Availability and liability',
      body: (
        <>
          <p>
            We work to keep {LEGAL.appName} available and accurate, but the service is provided "as
            is", without guarantees that it will be uninterrupted or error-free.
          </p>
          <p>
            To the extent the law allows, we are not liable for financial losses or decisions made
            using the app, or for indirect or consequential losses. Nothing in these terms limits
            liability that cannot be limited by law.
          </p>
        </>
      ),
    },
    {
      heading: 'Changes to these terms',
      body: (
        <p>
          We may update these terms. If a change is significant we will tell you in the app before it
          takes effect. Continuing to use the app after that means you accept the updated terms.
        </p>
      ),
    },
    {
      heading: 'Governing law and contact',
      body: (
        <p>
          These terms are governed by {law}. Questions about them can be sent to {contact}.
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <p>
          These terms are the agreement between you and {entity} for using {LEGAL.appName}. By creating
          an account or using the app, you agree to them.
        </p>
      }
      sections={sections}
    />
  );
};

export default Terms;
