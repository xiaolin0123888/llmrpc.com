const { Resend } = require("resend");
const resend = new Resend("re_Y3kTpZ1m_NyucizNL2L8zXn4P1boWoMzt");
resend.emails.send({
  from: "noreply@llmrpc.com",
  to: "xfyy688@gmail.com",
  subject: "Test",
  html: "<strong>Test works!</strong>"
}).then(r => console.log(JSON.stringify(r))).catch(e => console.error(e.message));