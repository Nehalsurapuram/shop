# Product photos

Drop your own product images here, then run:

```bash
npm run images
```

That regenerates `lib/product-images.ts`, which the catalog reads.

## How to organise files

Put each product's photos in a folder named after its **slug**:

```
public/products/
  women-dresses-tiered-maxi-dress/
    01.jpg
    02.jpg
    03.jpg
  men-shirts-oxford-button-down/
    front.jpg
    back.jpg
```

- The folder name must match the product slug exactly (that's the last part of the
  product URL, e.g. `/p/women-dresses-tiered-maxi-dress`).
- Filenames can be anything; images are used in sorted order (so `01`, `02`, `03`
  keeps them in sequence). The first image is the card thumbnail.
- Supported formats: `.jpg .jpeg .png .webp .avif .gif`.

Any product without a folder here keeps using the placeholder photography.

To list every slug you can create a folder for, see the keys in `lib/catalog.ts`
or ask and I'll print the full list.
