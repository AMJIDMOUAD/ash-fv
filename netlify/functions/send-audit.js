const nodemailer = require("nodemailer");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const params = new URLSearchParams(event.body);
    const name = params.get("name") || "";
    const business = params.get("business") || "";
    const email = params.get("email") || "";
    const phone = params.get("phone") || "";

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "ash8518@gmail.com",
        pass: "uusp valv sxpg oagw",
      },
    });

    await transporter.sendMail({
      from: "ash8518@gmail.com",
      to: "ash8518@gmail.com",
      subject: "New Free Audit Request - " + name + " (" + business + ")",
      text:
        "New Free Audit Request\n\n"
        + "Name: " + name + "\n"
        + "Business: " + business + "\n"
        + "Email: " + email + "\n"
        + "Phone: " + phone + "\n",
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
