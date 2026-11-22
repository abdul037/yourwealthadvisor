import { Link } from 'react-router-dom';
import { LegalPage, LegalSection } from '@/components/LegalPage';
import { LEGAL, legalValue } from '@/lib/legal';

const Privacy = () => {
  const entity = legalValue(LEGAL.entityName, 'legal entity name');
  const address = legalValue(LEGAL.entityAddress, 'registered address');
  const contact = legalValue(LEGAL.contactEmail, 'contact email');
  const backups = legalValue(LEGAL.backupRetention, 'backup retention period');

  const sections: LegalSection[] = [
    {
      heading: 'Who we are',
      body: (
        <p>
          {LEGAL.appName} is operated by {entity}, {address}. For anything in this policy, contact us
          at {contact}.
        </p>
      ),
    },
    {
      heading: 'What we collect',
      body: (
        <ul>
          <li>
            <strong>Account details.</strong> Your name and email address. If you sign in with Google,
            we receive your name, email address and profile picture from Google.
          </li>
          <li>
            <strong>Financial information you add.</strong> Income, expenses, budgets, debts, savings
            goals, assets, and any accounts and balances you enter.
          </li>
          <li>
            <strong>Things you share with other people.</strong> Split-expense groups, posts, comments,
            circles, challenges and friend connections.
          </li>
          <li>
            <strong>Usage information.</strong> Basic in-app activity (for example, which features you
            open) and clicks on partner links, so we can keep the app working and improve it.
          </li>
        </ul>
      ),
    },
    {
      heading: 'What we do not collect',
      body: (
        <p>
          {LEGAL.appName} does not ask for or store your online-banking passwords, and we do not sell
          your personal data.
        </p>
      ),
    },
    {
      heading: 'How we use your information',
      body: (
        <ul>
          <li>To provide the app: showing your balances, budgets, goals and history.</li>
          <li>
            To run the AI features. When you type or speak a transaction, ask the assistant a question,
            or request insights, the text you enter and a summary of the relevant financial data are
            sent to an AI provider to produce the result.
          </li>
          <li>To send emails you have asked for or that relate to your account, such as invitations, replies and digests.</li>
          <li>To keep the service secure and to fix problems.</li>
        </ul>
      ),
    },
    {
      heading: 'Who processes data for us',
      body: (
        <>
          <p>We use the following service providers. They process data only to provide their service to us.</p>
          <ul>
            <li><strong>Supabase</strong>: database, sign-in and hosting of the app's back end.</li>
            <li><strong>Google</strong>: Google sign-in, and Gemini AI models reached through the Lovable AI gateway.</li>
            <li><strong>Anthropic</strong>: the AI model behind the in-app assistant.</li>
            <li><strong>Resend</strong>: email delivery.</li>
          </ul>
          <p>These providers may process data outside your country of residence, including outside the UAE.</p>
        </>
      ),
    },
    {
      heading: 'How long we keep it',
      body: (
        <>
          <p>We keep your information for as long as you have an account.</p>
          <p>
            When you delete your account, your profile and personal financial records are deleted. In
            split-expense groups that other people still use, your entries stay so their balances remain
            correct, but your name and email are removed from them. Copies may remain in backups for up
            to {backups}.
          </p>
        </>
      ),
    },
    {
      heading: 'Your choices and rights',
      body: (
        <>
          <ul>
            <li><strong>See and correct</strong> your information at any time in the app.</li>
            <li><strong>Export</strong> your data using "Export Data" in the app's search menu.</li>
            <li>
              <strong>Delete your account</strong> and its data in the app under Settings, then Data,
              then Delete account.
            </li>
          </ul>
          <p>
            Depending on where you live, including under the UAE Personal Data Protection Law (Federal
            Decree-Law No. 45 of 2021), you may have further rights such as objecting to or restricting
            certain processing. To use them, contact us at {contact}.
          </p>
        </>
      ),
    },
    {
      heading: 'Security',
      body: (
        <p>
          Data is encrypted in transit, and database rules restrict each account to its own records. No
          system is perfectly secure, so please use a strong, unique password.
        </p>
      ),
    },
    {
      heading: 'Children',
      body: <p>{LEGAL.appName} is not intended for anyone under 18.</p>,
    },
    {
      heading: 'Changes to this policy',
      body: (
        <p>
          If we change this policy in a way that matters, we will update the date above and tell you in
          the app. See also our <Link to="/terms">Terms of Service</Link>.
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          This policy explains what information {LEGAL.appName} collects, why, who handles it for us,
          and the choices you have.
        </p>
      }
      sections={sections}
    />
  );
};

export default Privacy;
