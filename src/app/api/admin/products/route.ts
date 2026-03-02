import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getProducts, setProducts, type Product } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = getProducts();
  return NextResponse.json(products, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const product: Product = await req.json();
    const products = getProducts();
    const maxId =
      products.length > 0
        ? Math.max(...products.map((p) => parseInt(p.id)))
        : 0;
    product.id = String(maxId + 1);
    products.push(product);
    setProducts(products);
    return NextResponse.json({ success: true, id: product.id });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const product: Product = await req.json();
    const products = getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx === -1)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    products[idx] = product;
    setProducts(products);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    let id: string;

    if (idParam) {
      id = idParam;
    } else {
      const body = await req.json();
      id = body.id;
    }

    const products = getProducts().filter((p) => p.id !== id);
    setProducts(products);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
