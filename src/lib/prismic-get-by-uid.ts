import { filter, type Client, type PrismicDocument } from "@prismicio/client";

type GetByUidParams = Omit<Parameters<Client["getFirst"]>[0], "filters">;

/**
 * Prismic `getByUID` builds two separate `q` params. `buildQueryURL` wraps each
 * predicate in `[…]` again, producing `[[at(…)]]` — invalid. The API can then
 * behave as if only `document.type` matched, so `getFirst` returns the first
 * page of that type (e.g. `smartvalve` instead of `home`).
 *
 * Combining both predicates into a single filter yields one correct `q`:
 * `[[at(document.type,"…")][at(my.type.uid,"…")]]`
 *
 * @see https://prismic.io/docs/rest-api-technical-reference
 */
export function prismicUidPredicate(documentType: string, uid: string): string {
  return `${filter.at("document.type", documentType)}${filter.at(
    `my.${documentType}.uid`,
    uid,
  )}`;
}

export async function prismicGetByUID<TDocument extends PrismicDocument = PrismicDocument>(
  client: Client,
  documentType: string,
  uid: string,
  params?: GetByUidParams,
): Promise<TDocument> {
  const merged = prismicUidPredicate(documentType, uid);
  return client.getFirst({
    ...params,
    filters: [merged],
  }) as Promise<TDocument>;
}
