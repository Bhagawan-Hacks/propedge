/**
 * Notification Service for PropEdge
 * Integrates with Resend free tier or Supabase Auth SMTP, with fallback mock logging
 */

interface BreachAlertPayload {
  toEmail: string;
  accountNumber: string;
  ruleName: string;
  breachValue: number;
}

interface PhasePassPayload {
  toEmail: string;
  accountNumber: string;
  newPhase: string;
  profitPct: number;
}

interface PayoutAlertPayload {
  toEmail: string;
  accountNumber: string;
  amount: number;
  status: string;
}

export async function sendBreachNotification({ toEmail, accountNumber, ruleName, breachValue }: BreachAlertPayload) {
  const subject = `[PropEdge Alert] Rule Breach Detected on Account ${accountNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0b0e14; color: #f1f5f9; padding: 24px; border-radius: 8px;">
      <h2 style="color: #ef4444;">Account Evaluation Notice</h2>
      <p>Dear Trader,</p>
      <p>Our automated risk engine detected a compliance limit event on your simulated challenge account <strong>${accountNumber}</strong>.</p>
      <div style="background-color: #1a1625; border: 1px solid #7f1d1d; padding: 12px; border-radius: 6px; margin: 16px 0;">
        <p style="margin: 0; color: #fca5a5;"><strong>Breached Rule:</strong> ${ruleName}</p>
        <p style="margin: 4px 0 0 0; color: #fca5a5;"><strong>Recorded Value:</strong> $${breachValue.toFixed(2)}</p>
      </div>
      <p>In accordance with firm rules, all active positions have been closed and the account is now locked. You may review your full trading journal and analytics in your dashboard.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 24px;">PropEdge Simulation Platform — Educational Demonstration Only</p>
    </div>
  `;

  return await dispatchEmail(toEmail, subject, html);
}

export async function sendPhasePassNotification({ toEmail, accountNumber, newPhase, profitPct }: PhasePassPayload) {
  const subject = `🎉 Congratulations! Phase Passed on Account ${accountNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0b0e14; color: #f1f5f9; padding: 24px; border-radius: 8px;">
      <h2 style="color: #10b981;">Evaluation Target Achieved!</h2>
      <p>Dear Trader,</p>
      <p>Congratulations! You have successfully achieved your profit target of <strong>+${profitPct.toFixed(2)}%</strong> on account <strong>${accountNumber}</strong> while adhering to all drawdown limits.</p>
      <div style="background-color: #064e3b; border: 1px solid #059669; padding: 12px; border-radius: 6px; margin: 16px 0;">
        <p style="margin: 0; color: #a7f3d0;"><strong>Advanced To:</strong> ${newPhase.toUpperCase()}</p>
      </div>
      <p>Your new allocation is now ready in your trading terminal.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 24px;">PropEdge Simulation Platform — Educational Demonstration Only</p>
    </div>
  `;

  return await dispatchEmail(toEmail, subject, html);
}

export async function sendPayoutNotification({ toEmail, accountNumber, amount, status }: PayoutAlertPayload) {
  const subject = `[PropEdge] Payout Request Update: ${status}`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0b0e14; color: #f1f5f9; padding: 24px; border-radius: 8px;">
      <h2 style="color: #3b82f6;">Payout Request ${status}</h2>
      <p>Dear Trader,</p>
      <p>Your simulated 80% profit split withdrawal request for <strong>$${amount.toFixed(2)}</strong> from account <strong>${accountNumber}</strong> has been marked as <strong>${status}</strong> by firm administration.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 24px;">PropEdge Simulation Platform — Educational Demonstration Only</p>
    </div>
  `;

  return await dispatchEmail(toEmail, subject, html);
}

async function dispatchEmail(to: string, subject: string, html: string) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && !resendApiKey.includes('mock') && resendApiKey.startsWith('re_')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'PropEdge Simulator <notifications@propedge.demo>',
          to: [to],
          subject: subject,
          html: html,
        }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Resend email dispatch error:', e);
    }
  }

  // Graceful simulation log in development & test environments
  console.log(`[SIMULATED EMAIL DISPATCH] To: ${to} | Subject: "${subject}"`);
  return { simulated: true, to, subject };
}

