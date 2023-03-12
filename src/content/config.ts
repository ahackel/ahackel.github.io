import { z, defineCollection } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    draft: z.boolean().optional(),
    title: z.string(),
    tags: z.array(z.string()),
    date: z.date(),
    description: z.string(),
    thumbnail: z.string(),
    url: z.string().optional()
  }),
});

const projects = defineCollection({
  schema: z.object({
    draft: z.boolean().optional(),
    title: z.string(),
    tags: z.array(z.string()).optional(),
    type: z.string(),
    date: z.date(),
    role: z.string(),
    developer: z.string().optional(),
    client: z.string().optional(),
    platforms: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    description: z.string(),
    thumbnail: z.string(),
    images: z.array(z.string()).optional()
  }),
});

export interface Post
{
  data: {
    draft?: boolean;
    title: string;
    description: string;
    thumbnail: string;
    date: Date;
    url?: string;
  };
  slug: string;
  collection: Collection;
}

export const collections = { blog, projects };
export type Collection = 'blog' | 'projects';