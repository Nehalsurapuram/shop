import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductBrowser } from "@/components/product-browser";
import { NAV, productsInDepartment } from "@/lib/catalog";

export function generateStaticParams() {
  return NAV.map((top) => ({ slug: top.slug }));
}

export async function generateMetadata(props: PageProps<"/d/[slug]">) {
  const { slug } = await props.params;
  const department = NAV.find((t) => t.slug === slug);
  if (!department) return {};
  return {
    title: department.name,
    description: `Shop all ${department.name.toLowerCase()}.`,
  };
}

export default async function DepartmentPage(props: PageProps<"/d/[slug]">) {
  const { slug } = await props.params;
  const department = NAV.find((t) => t.slug === slug);
  if (!department) notFound();

  const products = productsInDepartment(slug);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <Breadcrumbs trail={[{ label: department.name }]} />

      <header className="py-8">
        <h1 className="text-2xl tracking-[0.12em] uppercase">{department.name}</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {department.children?.map((child) => (
            <Link
              key={child.slug}
              href={`/c/${child.slug}`}
              className="border border-line px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors hover:border-foreground"
            >
              {child.name}
            </Link>
          ))}
        </div>
      </header>

      <ProductBrowser products={products} />
    </div>
  );
}
