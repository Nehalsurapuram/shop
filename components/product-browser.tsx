"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";
import { ChevronDownIcon, CloseIcon } from "./icons";

type Sort = "featured" | "price-asc" | "price-desc" | "rating" | "discount";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Customer rating" },
  { value: "discount", label: "Discount" },
];

const PRICE_BANDS = [
  { label: "Under ₹1,000", min: 0, max: 999 },
  { label: "₹1,000 – ₹1,999", min: 1000, max: 1999 },
  { label: "₹2,000 – ₹3,499", min: 2000, max: 3499 },
  { label: "₹3,500 & above", min: 3500, max: Infinity },
];

function toggle(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function ProductBrowser({ products }: { products: Product[] }) {
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [bands, setBands] = useState<string[]>([]);
  const [saleOnly, setSaleOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allSizes = useMemo(
    () => [...new Set(products.flatMap((p) => p.sizes))],
    [products],
  );
  const allColors = useMemo(
    () => [...new Set(products.flatMap((p) => p.colors))].sort(),
    [products],
  );

  const visible = useMemo(() => {
    const filtered = products.filter((p) => {
      if (saleOnly && !p.compareAt) return false;
      if (sizes.length && !p.sizes.some((s) => sizes.includes(s))) return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c))) return false;
      if (bands.length) {
        const inBand = PRICE_BANDS.filter((b) => bands.includes(b.label)).some(
          (b) => p.price >= b.min && p.price <= b.max,
        );
        if (!inBand) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "discount":
        sorted.sort(
          (a, b) =>
            (b.compareAt ? 1 - b.price / b.compareAt : 0) -
            (a.compareAt ? 1 - a.price / a.compareAt : 0),
        );
        break;
    }
    return sorted;
  }, [products, sizes, colors, bands, saleOnly, sort]);

  const activeCount =
    sizes.length + colors.length + bands.length + (saleOnly ? 1 : 0);

  function clearAll() {
    setSizes([]);
    setColors([]);
    setBands([]);
    setSaleOnly(false);
  }

  const filterPanel = (
    <div className="space-y-8">
      <FilterGroup title="Price">
        {PRICE_BANDS.map((band) => (
          <Checkbox
            key={band.label}
            label={band.label}
            checked={bands.includes(band.label)}
            onChange={() => setBands((b) => toggle(b, band.label))}
          />
        ))}
        <Checkbox
          label="On sale only"
          checked={saleOnly}
          onChange={() => setSaleOnly((s) => !s)}
        />
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSizes((s) => toggle(s, size))}
              aria-pressed={sizes.includes(size)}
              className={`min-w-11 border px-3 py-2 text-xs transition-colors ${
                sizes.includes(size)
                  ? "border-foreground bg-foreground text-white"
                  : "border-line hover:border-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Colour">
        {allColors.map((color) => (
          <Checkbox
            key={color}
            label={color}
            checked={colors.includes(color)}
            onChange={() => setColors((c) => toggle(c, color))}
          />
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="lg:flex lg:gap-10">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs tracking-[0.16em] uppercase">Filters</h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted underline underline-offset-4"
            >
              Clear all
            </button>
          )}
        </div>
        {filterPanel}
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-4">
          <p className="text-xs text-muted">
            {visible.length} {visible.length === 1 ? "product" : "products"}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="border border-line px-4 py-2 text-xs tracking-[0.1em] uppercase lg:hidden"
            >
              Filters{activeCount > 0 && ` (${activeCount})`}
            </button>

            <label className="relative flex items-center gap-2 text-xs">
              <span className="hidden text-muted sm:inline">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="appearance-none border border-line py-2 pr-8 pl-4 text-xs tracking-[0.1em] uppercase outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-2 size-4" />
            </label>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-muted">
              Nothing matches those filters.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 text-xs tracking-[0.14em] uppercase underline underline-offset-4"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((product, i) => (
              <ProductCard key={product.slug} product={product} priority={i < 4} />
            ))}
          </div>
        )}
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-background">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
              <h2 className="text-xs tracking-[0.16em] uppercase">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="-mr-2 p-2"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{filterPanel}</div>
            <div className="flex shrink-0 gap-3 border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 border border-line py-3 text-xs tracking-[0.14em] uppercase"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-1 bg-foreground py-3 text-xs tracking-[0.14em] text-white uppercase"
              >
                Show {visible.length}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs tracking-[0.14em] uppercase">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted hover:text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-black"
      />
      {label}
    </label>
  );
}
