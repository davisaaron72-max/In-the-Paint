// api/send-announcement-email.js
// POST { teamId, subject, body }
// Sends an email to every parent/coach on the team. Intended to be called
// after an "is_announcement" message is posted in Team Chat (Phase 2 wiring),
// or manually by a coach via a "Email this announcement" button.

const { createClient } = require('@supabase/supabase-js');
const { sendEmail } = require('./_sendEmail');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server-only, never exposed to the client
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { teamId, subject, body } = req.body;
  if (!teamId || !subject || !body) {
    return res.status(400).json({ error: 'teamId, subject, and body are required' });
  }

  // Pull every team member's email (coaches + parents). Players may not have
  // their own email on file, so this naturally skips them unless they do.
  const { data: members, error } = await supabaseAdmin
    .from('team_members')
    .select('users(email, full_name)')
    .eq('team_id', teamId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const recipients = members
    .map((m) => m.users?.email)
    .filter(Boolean);

  if (recipients.length === 0) {
    return res.status(200).json({ sent: 0, message: 'No email addresses on file for this team' });
  }

  try {
    await sendEmail({
      to: recipients,
      subject: `In The Paint — ${subject}`,
      html: `<p>${body}</p>`,
    });
    return res.status(200).json({ sent: recipients.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
