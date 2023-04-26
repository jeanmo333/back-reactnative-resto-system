
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';


export interface dataMail {
  email:string
  name:string
  token:string
}


const emailRegister = async (data:dataMail) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST_GMAIL,
    port: process.env.EMAIL_PORT_GMAIL,
    secure:true,
    auth: {
      user: process.env.EMAIL_USER_GMAIL,
      pass: process.env.EMAIL_PASS_GMAIL,
    },
  }as SMTPTransport.Options);

  const { email, name, token } = data;

  //Enviar el email

  const info = await transporter.sendMail({
    from: "AMATEC - Administrador de ventas ",
    to: email,
    subject: "Comprueba tu cuenta en AMATEC",
    text: "Comprueba tu cuenta en AMATEC",
    html: `<p>Hola: ${name}, comprueba tu cuenta en AMATEC.</p>
        <p>Tu cuenta ya esta lista, solo debes comprobarla en el siguiente enlace:
        <a href="${process.env.FRONTEND_URL}/auth/confirmAccount/${token}">Comprobar Cuenta</a> </p>

        <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
    `,
  });

 // console.log("Mensaje enviado: %s", info.messageId);
};

export default emailRegister;
