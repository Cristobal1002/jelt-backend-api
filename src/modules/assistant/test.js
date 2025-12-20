import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const test = async () => {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: "Hola, ¿funciono?",
  });

  console.log(response.output_text);
};

test();