const nodemailer = require("nodemailer");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    let name = "", business = "", emailAddr = "", phone = "";

    if (event.headers["content-type"] === "application/json") {
      const d = JSON.parse(event.body);
      name = d.name || "";
      business = d.business || "";
      emailAddr = d.email || "";
      phone = d.phone || "";
    } else {
      const parts = (event.body || "").split("&");
      for (const p of parts) {
        const [k, v] = p.split("=").map(function(s) { return decodeURIComponent(s.replace(/\+/g, " ")); });
        if (k === "name") name = v || "";
        else if (k === "business") business = v || "";
        else if (k === "email") emailAddr = v || "";
        else if (k === "phone") phone = v || "";
      }
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "ash8518@gmail.com",
        pass: "ztwn usek upfo rbdg",
      },
    });

    await transporter.sendMail({
      from: "ash8518@gmail.com",
      to: "ash8518@gmail.com",
      subject: "New Free Audit Request - " + name + " (" + business + ")",
      text: "New Free Audit Request\n\nName: " + name + "\nBusiness: " + business + "\nEmail: " + emailAddr + "\nPhone: " + phone + "\n",
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
