const test = require("node:test");
const assert = require("node:assert/strict");
const { createMailer } = require("./mailer");

test("creates one Gmail transport and sends with MAIL_USER credentials", async () => {
  const calls = { transports: [], messages: [] };
  const fakeNodemailer = {
    createTransport(options) {
      calls.transports.push(options);
      return {
        sendMail: async (message) => {
          calls.messages.push(message);
          return { messageId: "test-message" };
        },
        verify: async () => true,
      };
    },
  };

  const mailer = createMailer(
    {
      MAIL_USER: "sender@gmail.com",
      MAIL_PASS: "abcd efgh ijkl mnop",
    },
    fakeNodemailer
  );

  const result = await mailer.sendMail({
    to: "customer@example.com",
    subject: "Test",
    text: "Hello",
  });

  assert.equal(mailer.isMailConfigured, true);
  assert.equal(calls.transports.length, 1);
  assert.equal(calls.transports[0].service, "gmail");
  assert.equal(calls.transports[0].auth.pass, "abcdefghijklmnop");
  assert.equal(calls.messages[0].from, '"ServiceSphere" <sender@gmail.com>');
  assert.equal(result.messageId, "test-message");
});

test("reports missing mail configuration instead of silently skipping", async () => {
  const mailer = createMailer({}, { createTransport: () => assert.fail() });

  assert.equal(mailer.isMailConfigured, false);
  await assert.rejects(
    mailer.sendMail({ to: "customer@example.com", subject: "Test" }),
    (error) => error.code === "MAIL_NOT_CONFIGURED"
  );
});
