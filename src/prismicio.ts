import { createClient as baseCreateClient, type ClientConfig } from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import sm from "../slicemachine.config.json";
import { PRISMIC_REVALIDATE_SECONDS } from "./lib/prismic-cache";
import { buildPrismicRoutes } from "./lib/prismic-routes";

/**
 * The project's Prismic repository name.
 */
export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

/**
 * The project's Prismic route resolvers. This list determines a Prismic document's URL.
 */
const routes = buildPrismicRoutes();

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config - Configuration for the Prismic client.
 */
export function createClient(config: ClientConfig = {}) {
  const { fetchOptions: configFetchOptions, ...restConfig } = config;
  const client = baseCreateClient(sm.apiEndpoint || repositoryName, {
    ...restConfig,
    routes,
    /**
     * Production: ISR + on-demand purge via `revalidateTag("prismic")` (Prismic webhook).
     * Dev: always fresh. UID lookups use `prismicGetByUID` for a valid combined `q` param.
     */
    fetchOptions: {
      ...(process.env.NODE_ENV === "production"
        ? {
            next: {
              tags: ["prismic"],
              revalidate: PRISMIC_REVALIDATE_SECONDS,
            },
          }
        : { cache: "no-store" as const }),
      ...configFetchOptions,
    },
  });

  enableAutoPreviews({ client });

  return client;
}
