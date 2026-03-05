import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async (email, resetURL) => {
  await resend.emails.send({
    from: "Nodex Support <onboarding@resend.dev>",
    to: email,
    subject: "Reset Your Password for your Nodex account",
    html: `
<div style="margin:0;padding:0;background:#0b0b0f;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="margin-top:50px;border-radius:16px;overflow:hidden;
box-shadow:0 20px 50px rgba(0,0,0,0.45);text-align:center;
background:#ffffff;">

<tr>
<td style="background:linear-gradient(135deg,#000000,#1f1f2e,#3b3b98);padding:40px 30px;">
<img src="https://res.cloudinary.com/du2m9ntlf/image/upload/v1772715592/an7thoklw4rwlxg1w0iq.png"
alt="Nodex Logo" width="130"
style="display:block;margin:0 auto;margin-bottom:15px;" />

<p style="color:#aaa;font-size:13px;margin:0;">
Secure Account Recovery
</p>
</td>
</tr>

<tr>
<td style="padding:45px 45px 40px 45px;">

<h2 style="margin:0;font-size:28px;color:#111;letter-spacing:0.5px;">
Reset Your Password
</h2>

<p style="color:#666;font-size:15px;margin-top:15px;line-height:1.6;">
We received a request to reset your password for your
<b>Nodex</b> account.
Click the button below to create a new password.
</p>

<div style="margin:35px 0;">
<a href="${resetURL}"
style="background:linear-gradient(135deg,#6366f1,#8b5cf6);
color:white;
padding:15px 34px;
text-decoration:none;
border-radius:10px;
font-weight:bold;
font-size:15px;
display:inline-block;
box-shadow:0 8px 25px rgba(99,102,241,0.45);">
Reset Password
</a>
</div>

<p style="font-size:13px;color:#777;line-height:1.6;">
This link will expire in <b>10 minutes</b> for security reasons.
</p>

<p style="font-size:13px;color:#777;">
If you didn't request a password reset, you can safely ignore this email.
</p>

<div style="margin-top:25px;padding:12px;background:#f6f6f9;
border-radius:8px;font-size:12px;color:#666;word-break:break-all;">
${resetURL}
</div>

<hr style="border:none;border-top:1px solid #eee;margin:35px 0;" />

<p style="font-size:12px;color:#aaa;margin:0;">
© ${new Date().getFullYear()} Nodex — All rights reserved
</p>

</td>
</tr>

</table>

<div style="height:40px"></div>

</td>
</tr>
</table>
</div>
`,
  });
};