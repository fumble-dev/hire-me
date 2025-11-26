import "dotenv/config";
import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";

export const startSendMailConsumer = async function () {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });

    const consumer = kafka.consumer({ groupId: "mail-service-group" });
    await consumer.connect();

    await consumer.subscribe({
      topic: "send-mail",
      fromBeginning: false,
    });

    console.log("Mail service consumer started...");

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const { to, subject, html } = JSON.parse(
            message.value?.toString() || "{}"
          );

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: `"Hire Me" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
          });

          console.log(`Mail sent to ${to}`);
        } catch (error) {
          console.log("Failed to send mail:", error);
        }
      },
    });
  } catch (error) {
    console.log("Failed to start Kafka:", error);
  }
};
