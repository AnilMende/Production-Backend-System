import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
    //1. create a Transport
    const transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : process.env.EMAIL_USER,
            pass : process.env.EMAIL_PASSWORD
        }
    })

    //2.Compose your message -> Define the sender, receipient, subject and context
    const messageOptions = {
        from : `"Support Team" <${process.env.EMAIL_USER}>`,
        to : options.email,
        subject : options.subject,
        html : options.html
    }

    //3. send the EMail using the sendMail with messageOptions
    //call transporter.sendMail()
    await transporter.sendMail(messageOptions);

}