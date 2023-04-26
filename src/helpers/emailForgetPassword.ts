import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';


export interface dataMail {
    email:string
    name:string
    token:string
  }

const emailForgetPassword = async (datos:dataMail) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST_GMAIL,
    port: process.env.EMAIL_PORT_GMAIL,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER_GMAIL,
      pass: process.env.EMAIL_PASS_GMAIL,
    },
  } as SMTPTransport.Options);

  const { email, name, token } = datos;

  //Enviar el email

  const info = await transporter.sendMail({
    from: "AMATEC - Administrador de Ventas",
    to: email,
    subject: "Reestablece tu Password",
    text: "Reestablece tu Password",
    html: `<p>Hola: ${name}, has solicitado reestablecer tu password.</p>

        <p>Sigue el siguiente enlace para generar un nuevo password:
        <a href="${process.env.FRONTEND_URL}/auth/newPassword/${token}">Reestablecer Password</a> </p>

        <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
    `,
  });

 // console.log("Mensaje enviado: %s", info.messageId);
};

export default emailForgetPassword;