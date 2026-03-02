import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getProductsAsync, setProductsAsync, type Product } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getProductsAsync();
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
    const products = await getProductsAsync();
    const maxId =
      products.length > 0
        ? Math.max(...products.map((p) => parseInt(p.id)))
        : 0;
    product.id = String(maxId + 1);
    products.push(product);
    await setProductsAsync(products);
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
    const products = await getProductsAsync();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx === -1)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    products[idx] = product;
    await setProductsAsync(products);
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

    const products = (await getProductsAsync()).filter((p) => p.id !== id);
    await setProductsAsync(products);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
