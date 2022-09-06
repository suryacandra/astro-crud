import { connectDb } from "../../../lib/connectDb";
import { getUser } from "@astro-auth/core";

export async function post({ request }) {
  const user = getUser({ server: request });
  if (!user) {
    return new Response(
      JSON.stringify({
        message: "Error",
      }),
      { status: 403 }
    );
  }
  const { title, desc } = await request.json();
  const client = await connectDb();
  const db = client.db("astro");
  const usersCollection = db.collection("data");
  const result = await usersCollection.insertOne({ title, desc });
  client.close();
  return new Response(
    JSON.stringify({
      message: "Data created successfully",
    }),
    { status: 200 }
  );
}

export async function get({ request }) {
    const user = getUser({ server: request });
    if (!user) {
      return;
    }
    const client = await connectDb();
    const db = client.db("astro");
    const usersCollection = db.collection("data");
    const result = await usersCollection.find({}).sort({ $natural: -1 }).toArray();
    client.close();
    return new Response(
      JSON.stringify({
       data: result,
      }),
      { status: 200 }
    );
  }

export async function del({ request }) {
  const user = getUser({ server: request });
  if (!user) {
    return;
  }
  const { title } = await request.json();
  const client = await connectDb();
  const db = client.db("astro");
  const usersCollection = db.collection("data");
  const result = await usersCollection.deleteOne({ title: {
    $eq: title
  } });
  client.close();
  return new Response(
    JSON.stringify({
      message: "Data deleted successfully",
    }),
    { status: 200 }
  );
}