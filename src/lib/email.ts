import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "바른발음 <noreply@bareunbareum.com>";

export async function sendVerificationEmail(email: string, code: string) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "[바른발음] 이메일 인증번호",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #FDFAF5;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 900; color: #3D3530; margin: 0;">바른발음 🐦</h1>
          <p style="color: #8B7E74; font-size: 14px; margin-top: 8px;">아이 발음 홈케어 서비스</p>
        </div>
        <div style="background: white; border-radius: 24px; padding: 32px; box-shadow: 0 4px 20px rgba(180,120,80,0.10);">
          <p style="color: #3D3530; font-size: 16px; margin: 0 0 24px;">안녕하세요!<br/>아래 인증번호를 입력해주세요.</p>
          <div style="background: #FFF5EE; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #8B7E74; font-size: 12px; margin: 0 0 8px;">인증번호 (5분 이내 입력)</p>
            <p style="color: #FFB38A; font-size: 40px; font-weight: 900; letter-spacing: 12px; margin: 0;">${code}</p>
          </div>
          <p style="color: #C4B5A8; font-size: 12px; margin: 0;">본인이 요청하지 않은 경우 이 메일을 무시하세요.</p>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
}
