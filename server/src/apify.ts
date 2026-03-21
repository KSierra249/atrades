import { ApifyClient } from 'apify-client';
import dotenv from "dotenv";

dotenv.config();

const apifyClient = new ApifyClient({
  token: `${process.env.APIFY_TOKEN}`,
});

export { apifyClient };