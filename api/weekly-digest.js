// api/weekly-digest.js
// Triggered automatically by Vercel Cron (see vercel.json) every Sunday morning.
// Builds a simple HTML digest per team: upcoming week's schedule + top stat leaders,
// and emails it to every coach/parent with an email on file.

const { createClient } = require('@supabase/supabase-js');
const { sendEmail } = require('./_sendEmail');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  // Vercel Cron sends a GET request with this header — reject anything else
  // to prevent the endpoint being triggered by randoms hitting the URL.
  if (req.headers['x-vercel-cron'] !== '1' && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: teams, error: teamsError } = await supabaseAdmin.from('teams').select('id, name');
  if (teamsError) return res.status(500).json({ error: teamsError.message });

  const now = new Date();
  const weekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let totalSent = 0;

  for (const team of teams) {
    const { data: events } = await supabaseAdmin
      .from('schedule_events')
      .select('*')
      .eq('team_id', team.id)
      .gte('start_time', now.toISOString())
      .lte('start_time', weekOut.toISOString())
      .order('start_time', { ascending: true });

    const { data: members } = await supabaseAdmin
      .from('team_members')
      .select('users(email)')
      .eq('team_id', team.id);

    const recipients = (members || []).map((m) => m.users?.email).filter(Boolean);
    if (recipients.length === 0) continue;

    const scheduleHtml = (events || []).length
      ? events.map((e) => `<li>${new Date(e.start_time).toLocaleDateString()} — ${e.opponent || e.event_type} @ ${e.location_name || 'TBD'}</li>`).join('')
      : '<li>No games or practices scheduled this week.</li>';

    const html = `
      <h2>${team.name} — This Week</h2>
      <h3>Upcoming Schedule</h3>
      <ul>${scheduleHtml}</ul>
      <p>Open the app for full stats, chat, and the latest team photos.</p>
    `;

    try {
      await sendEmail({
        to: recipients,
        subject: `In The Paint — ${team.name} Weekly Digest`,
        html,
      });
      totalSent += recipients.length;
    } catch (err) {
      console.error(`Failed to send digest for team ${team.id}:`, err.message);
    }
  }

  return res.status(200).json({ totalSent });
};
