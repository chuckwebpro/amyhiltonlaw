# Server-side form secrets (cPanel)

Form mail settings are **not** deployed with the site. On production, copy
`public/api/config.example.php` to:

```
~/private/amyhiltonlaw-mail.php
```

That path is resolved from `public/api/lib/mailer.php` (three levels above `api/lib`,
then `private/amyhiltonlaw-mail.php`).

Fill in `recaptcha_secret` when you have Google reCAPTCHA v3 keys, and set the matching
`recaptchaSiteKey` in `src/config/site.ts`.
