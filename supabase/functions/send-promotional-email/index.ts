import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PROMO_TEMPLATES = [
  {
    subject: "🎬 Hot Releases This Week — Don't Miss Out!",
    body: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%); color: #e0e0e0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #8b5cf6, #ec4899, #3b82f6); padding: 3px;">
        <div style="background: #0a0a1a; padding: 32px; text-align: center;">
          <h1 style="font-size: 28px; margin: 0 0 8px; background: linear-gradient(90deg, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🎬 WatchVerse</h1>
          <p style="color: #a0a0b0; margin: 0;">Your entertainment universe awaits</p>
        </div>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #fff; font-size: 22px;">This Week's Must-Watch Releases!</h2>
        <p style="color: #c0c0d0; line-height: 1.6;">New blockbusters and binge-worthy series just dropped. Your personalized dashboard has fresh recommendations waiting for you.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://watchversea.lovable.app" style="display: inline-block; background: linear-gradient(90deg, #8b5cf6, #ec4899); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Check Your Dashboard →</a>
        </div>
        <p style="color: #808090; font-size: 12px; text-align: center; margin-top: 32px;">You're receiving this because you enabled notifications on WatchVerse.</p>
      </div>
    </div>`
  },
  {
    subject: "⚡ Your Watchlist Is Waiting — New Content Added!",
    body: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%); color: #e0e0e0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6); padding: 3px;">
        <div style="background: #0a0a1a; padding: 32px; text-align: center;">
          <h1 style="font-size: 28px; margin: 0 0 8px; background: linear-gradient(90deg, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">⚡ WatchVerse</h1>
          <p style="color: #a0a0b0; margin: 0;">We've got something for you</p>
        </div>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #fff; font-size: 22px;">Fresh Picks Just For You!</h2>
        <p style="color: #c0c0d0; line-height: 1.6;">Based on your taste, we've found some incredible new content you'll love. Movies, series, and soon — games!</p>
        <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="color: #c4b5fd; margin: 0;">🎯 <strong>Pro Tip:</strong> Enable notifications to never miss a release date!</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://watchversea.lovable.app" style="display: inline-block; background: linear-gradient(90deg, #3b82f6, #06b6d4); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Explore Now →</a>
        </div>
        <p style="color: #808090; font-size: 12px; text-align: center; margin-top: 32px;">You're receiving this because you enabled notifications on WatchVerse.</p>
      </div>
    </div>`
  },
  {
    subject: "🌟 You Haven't Visited in a While — See What's New!",
    body: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%); color: #e0e0e0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #f59e0b, #ec4899, #8b5cf6); padding: 3px;">
        <div style="background: #0a0a1a; padding: 32px; text-align: center;">
          <h1 style="font-size: 28px; margin: 0 0 8px; background: linear-gradient(90deg, #f59e0b, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🌟 WatchVerse</h1>
          <p style="color: #a0a0b0; margin: 0;">We miss you!</p>
        </div>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #fff; font-size: 22px;">A Lot Has Changed Since You Left!</h2>
        <p style="color: #c0c0d0; line-height: 1.6;">New releases, trending content, and exciting updates are waiting. Come back and see what your personalized feed has in store!</p>
        <div style="display: flex; gap: 12px; justify-content: center; margin: 20px 0; flex-wrap: wrap;">
          <span style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); padding: 8px 16px; border-radius: 20px; font-size: 13px; color: #c4b5fd;">🎬 New Movies</span>
          <span style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); padding: 8px 16px; border-radius: 20px; font-size: 13px; color: #93c5fd;">📺 New Series</span>
          <span style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); padding: 8px 16px; border-radius: 20px; font-size: 13px; color: #fcd34d;">🎮 Games Soon</span>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://watchversea.lovable.app" style="display: inline-block; background: linear-gradient(90deg, #f59e0b, #ec4899); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Come Back →</a>
        </div>
        <p style="color: #808090; font-size: 12px; text-align: center; margin-top: 32px;">You're receiving this because you enabled notifications on WatchVerse.</p>
      </div>
    </div>`
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth check: require valid user with admin role, OR anon key from cron
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    // Allow cron calls with anon key
    if (token !== anonKey) {
      // Verify as user token and check admin role
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').single();
      if (!roles) {
        return new Response(JSON.stringify({ error: 'Admin role required' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fetch all active subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('notification_subscribers')
      .select('email, name')
      .eq('is_active', true);

    if (fetchError) throw fetchError;
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: 'No active subscribers' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Pick a random template
    const template = PROMO_TEMPLATES[Math.floor(Math.random() * PROMO_TEMPLATES.length)];

    let sentCount = 0;
    const errors: string[] = [];

    for (const sub of subscribers) {
      try {
        const personalizedBody = template.body.replace(
          'Your entertainment universe awaits',
          sub.name ? `Hey ${sub.name}, your entertainment universe awaits` : 'Your entertainment universe awaits'
        );

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'WatchVerse <onboarding@resend.dev>',
            to: [sub.email],
            subject: template.subject,
            html: personalizedBody,
          }),
        });

        if (res.ok) {
          sentCount++;
        } else {
          const errData = await res.text();
          errors.push(`Failed for ${sub.email}: ${errData}`);
        }
      } catch (emailErr) {
        errors.push(`Error for ${sub.email}: ${emailErr}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        total: subscribers.length,
        errors: errors.length > 0 ? errors : undefined 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Promotional email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
