import { ProductBrowser } from "@/components/product-browser";
import { searchProducts } from "@/lib/catalog";

export const metadata = { title: "Search" };

export default async function SearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams;
  const query = typeof q === "string" ? q : "";
  const results = searchProducts(query);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
      <h1 className="text-xl tracking-[0.12em] uppercase">
        {query ? `Results for “${query}”` : "Search"}
      </h1>

      {query && results.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted">
          No products matched “{query}”. Try a different term.
        </p>
      ) : (
        <div className="mt-8">
          <ProductBrowser products={results} />
        </div>
      )}
    </div>
  );
}
