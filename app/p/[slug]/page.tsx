import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductDetail } from "@/components/product-detail";
import { ProductRail } from "@/components/product-rail";
import {
  CATEGORY_INDEX,
  NAV,
  PRODUCTS,
  getProduct,
  relatedProducts,
} from "@/lib/catalog";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — ${product.brand}`,
    description: product.description,
    openGraph: { images: [product.images[0]] },
  };
}

export default async function ProductPage(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = CATEGORY_INDEX[product.category];
  const parent = NAV.find((t) => t.name === category?.parent);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <Breadcrumbs
        trail={[
          ...(parent ? [{ label: parent.name, href: `/d/${parent.slug}` }] : []),
          ...(category
            ? [{ label: category.name, href: `/c/${product.category}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="py-8">
        <ProductDetail product={product} />
      </div>

      <ProductRail
        title="You may also like"
        products={relatedProducts(product)}
        href={`/c/${product.category}`}
      />
    </div>
  );
}
