import { Link, useParams } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { Alert } from '@/components/ui';
import { demoAccount } from '@shared/demo';
import type { Role } from '@shared/types';

export function ForgotPassword() {
  const { role: roleParam } = useParams();
  const role = (['member', 'cr', 'executive'].includes(roleParam || '') ? roleParam : 'member') as Role;
  const demo = demoAccount(role);
  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden="true" />
      <div className="auth-container narrow">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-icon"><KeyRound size={24} /></div>
            <h1>Forgot password</h1>
            <p>Password reset is not available here. Please contact the Nafi IT team.</p>
          </div>
          <Alert type="info">
            No email is sent and no real account exists. Use the sample {role} account to explore the portal:
            <br /><br />
            <strong>{demo.identifierLabel}:</strong> <code>{demo.identifier}</code><br />
            <strong>Password:</strong> <code>{demo.password}</code>
          </Alert>
          <Link className="btn btn-primary btn-block" to={`/${role}/login`}><ArrowLeft size={16} /> Back to {role === 'cr' ? 'CR' : role} login</Link>
        </div>
      </div>
    </div>
  );
}
