import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductBrowser } from "@/components/product-browser";
import { CATEGORY_INDEX, NAV, productsIn } from "@/lib/catalog";

export function generateStaticParams() {
  return Object.keys(CATEGORY_INDEX).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/c/[slug]">) {
  const { slug } = await props.params;
  const category = CATEGORY_INDEX[slug];
  if (!category) return {};
  return {
    title: `${category.name} — ${category.parent}`,
    description: `Shop ${category.name.toLowerCase()} for ${category.parent.toLowerCase()}.`,
  };
}

export default async function CategoryPage(props: PageProps<"/c/[slug]">) {
  const { slug } = await props.params;
  const category = CATEGORY_INDEX[slug];
  if (!category) notFound();

  const products = productsIn(slug);
  const parent = NAV.find((t) => t.name === category.parent);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <Breadcrumbs
        trail={[
          { label: category.parent, href: parent ? `/d/${parent.slug}` : undefined },
          { label: category.name },
        ]}
      />

      <header className="py-8">
        <h1 className="text-2xl tracking-[0.12em] uppercase">{category.name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {products.length} pieces in {category.name.toLowerCase()}, picked for
          the season.
        </p>
      </header>

      <ProductBrowser products={products} />
    </div>
  );
}
