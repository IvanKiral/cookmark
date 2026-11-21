import { getEnv } from "~/server/env.ts";
export const getMediaBucket = (): R2Bucket | undefined => getEnv().MEDIA;
