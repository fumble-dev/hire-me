import { Kafka, logLevel  } from "kafkajs";
import nodemailer from "nodemailer";

export const sendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.Kafka_Broker || "localhost:9092"],
      logLevel: logLevel.NOTHING,
    });

    const consumer = kafka.consumer({ groupId: "mail-service-group" });
    await consumer.connect();

    const topicName = "send-mail";

    await consumer.subscribe({ topic: topicName, fromBeginning: false });

    console.log("mail service consumer started listening for sending mail");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const { to, subject, html } = JSON.parse(
            message.value?.toString() || "{}"
          );

          const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: "Hire Heaven <no-reply>,",
            to,
            subject,
            html,
          });

          console.log(`Mail has been sent to ${to}`);
        } catch (error) {
          console.log("Failed to send mail", error);
        }
      },
    });
  } catch (error) {
    console.log("Failed to start kafka", error);
  }
};
