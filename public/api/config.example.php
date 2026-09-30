<?php
/**
 * Copy to config.local.php for local testing, or to ~/private/amyhiltonlaw-mail.php
 * on the server (outside public_html). Never commit real credentials.
 *
 * Mail transport: uses PHP mail() by default (like WordPress). Set smtp_host, smtp_user,
 * and smtp_pass to switch to authenticated SMTP — useful when mail() deliverability is poor.
 *
 * reCAPTCHA: leave recaptcha_secret empty until you have keys. When you add the secret here,
 * also set recaptchaSiteKey in src/config/site.ts (public site key).
 */
return [
    // ---- Lead routing ----
    'notify_to' => 'legal@amyhiltonlaw.com',
    'notify_bcc_enabled' => true,
    // Hidden copies on team notifications only (comma-separated string or array).
    'notify_bcc' => 'leads@amyhiltonlaw.com',

    // ---- Outbound identity ----
    'from_email' => 'noreply@amyhiltonlaw.com',
    'from_name' => 'Hilton Family Law',

    // ---- Email template placeholders ----
    'site_url' => 'https://amyhiltonlaw.com',
    'site_email' => 'legal@amyhiltonlaw.com',
    'site_phone' => '(925) 384-2086',
    'site_phone_href' => '+19253842086',
    'timezone' => 'America/Los_Angeles',

    // ---- reCAPTCHA v3 (optional until keys are ready) ----
    'recaptcha_secret' => '',
    'recaptcha_min_score' => 0.5,

    // ---- Abuse controls ----
    'rate_limit_seconds' => 60,
    'rate_limit_max' => 5,

    // ---- SMTP (optional; blank = PHP mail() on the host) ----
    'smtp_host' => '',
    'smtp_port' => 587,
    'smtp_user' => '',
    'smtp_pass' => '',

    // ---- Default autoreply when a form does not override send_autoreply ----
    'send_autoreply' => true,

    // ---- Per-form mail (form_type from hidden field) ----
    'forms' => [
        'contact' => [
            'source_label' => 'Contact form',
            'subject' => 'New contact form message — Hilton Family Law',
            'autoreply_subject' => 'We received your message — Hilton Family Law',
            'notification' => 'notification-contact.html',
            'autoreply' => 'autoreply-contact.html',
            'send_autoreply' => true,
            // Extra BCC for this form only (merged with notify_bcc when enabled).
            'bcc' => '',
        ],
    ],
];
