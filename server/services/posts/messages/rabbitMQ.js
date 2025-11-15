import amqp from "amqplib";
import dotenv from "dotenv"
dotenv.config({quiet: true})

const connectMQ = async () => {
  try {
    return await amqp.connect(process.env.AMQP_URL_DOCKER);
  } catch (error) {
    console.log(error);
  }
};

const sendQueue = async (queueName, message) => {
  let conn, channel;
  try {
    conn = await connectMQ();
    channel = await conn.createChannel();

    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });
    console.log(`Sent to queue "${queueName}":`, message);
  } catch (error) {
    console.error(error);
  } finally {
    if (channel) await channel.close();
    if (conn) await conn.close();
  }
};

const consumeQueue = async (queueName, callback) => {
  try {
    const conn = await connectMQ();
    const channel = await conn.createChannel();

    await channel.assertQueue(queueName, { durable: true });

    await channel.consume(queueName, async (msg) => {
      if (msg) {
        const content = msg.content.toString();
        await callback(content);
        channel.ack(msg);
      }
    });
    console.log(`Consume on queue "${queueName}"`);
  } catch (error) {
    console.error(error);
  }
};

const publishMessage = async (exchangeName, message) => {
  let conn, channel;
  try {
    conn = await connectMQ();
    channel = await conn.createChannel();

    await channel.assertExchange(exchangeName, "fanout", { durable: true });

    channel.publish(exchangeName, "", Buffer.from(message), {
      persistent: true,
    });
    console.log(`Published to exchange "${exchangeName}":`, message);
  } catch (error) {
    console.error(error);
  } finally {
    if (channel) await channel.close();
    if (conn) await conn.close();
  }
};

const subscribeMessage = async (exchangeName, queueName, callback) => {
  try {
    const conn = await connectMQ();
    const channel = await conn.createChannel();

    await channel.assertExchange(exchangeName, "fanout", { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, "");

    await channel.consume(queueName, async (msg) => {
      if (msg) {
        const content = msg.content.toString();
        await callback(content);
        channel.ack(msg);
      }
    });

    console.log(
      `Subscribed to exchange "${exchangeName}" on queue "${queueName}"`
    );
  } catch (error) {
    console.error(error);
  }
};

const resetMQ = async (exchangeName, queues = []) => {
  let conn, channel;
  try {
    conn = await connectMQ();
    channel = await conn.createChannel();

    // Xóa exchange cũ (nếu có)
    await channel.deleteExchange(exchangeName).catch(() => {});
    // Tạo exchange mới (fanout)
    await channel.assertExchange(exchangeName, "fanout", { durable: true });

    for (const queueName of queues) {
      // Xóa queue cũ (nếu có)
      await channel.deleteQueue(queueName).catch(() => {});
      // Tạo queue mới
      await channel.assertQueue(queueName, { durable: true });
      // Bind queue với exchange
      await channel.bindQueue(queueName, exchangeName, "");
      console.log(
        `[✔] Queue "${queueName}" bound to exchange "${exchangeName}"`
      );
    }

    console.log(`[✔] Reset exchange "${exchangeName}" thành công`);
  } catch (err) {
    console.error("Reset MQ error:", err);
  } finally {
    if (channel) await channel.close();
    if (conn) await conn.close();
  }
};

export { sendQueue, consumeQueue, publishMessage, subscribeMessage, resetMQ };
