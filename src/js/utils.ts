import type { Post } from "../content/config";

export function getTags(collection: any): string[] {
    // union the following array fields from collection: tools, tags if they exist:
    let result: string[] = [];
    result = result.concat(collection?.tags ?? []);
    result = result.concat(collection?.tools ?? []);
    result = result.concat(collection.platforms ?? []);

    if (collection?.role) result.push(collection.role);
    if (collection?.developer) result.push(collection.developer);
    if (collection?.publisher) result.push(collection.publisher);
    if (collection?.client) result.push(collection.client);
    if (collection?.date) result.push(collection.date.getFullYear().toString());
    if (collection?.type) result.push(collection.type);

    return result;
}

export function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

export function getSlugifiedTags(collection: any): string[] {
    return getTags(collection).map(slugify);
}

export function excludeDrafts(post: Post){
    return post.data.draft !== true;
}