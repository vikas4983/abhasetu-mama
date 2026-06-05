import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../dbHelper';

export async function GET() {
  const db = readDb();
  return NextResponse.json({ status: 'success', products: db.products });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ status: 'error', message: 'Name, price, and category are required fields.' }, { status: 400 });
    }
    const db = readDb();
    const newProduct = {
      id: body.id || `p_${Date.now()}`,
      name: body.name,
      category: body.category,
      brand: body.brand || 'Generic',
      form: body.form || 'Tablets',
      price: Number(body.price),
      originalPrice: Number(body.originalPrice || body.price),
      discount: Number(body.discount || 0),
      rating: Number(body.rating || 5.0),
      image: body.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=150',
      description: body.description || '',
      salt: body.salt || ''
    };
    db.products.push(newProduct);
    writeDb(db);
    return NextResponse.json({ status: 'success', message: 'Product added successfully.', product: newProduct });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Invalid request body.' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ status: 'error', message: 'Product ID is required for editing.' }, { status: 400 });
    }
    const db = readDb();
    const idx = db.products.findIndex(p => p.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ status: 'error', message: 'Product not found.' }, { status: 404 });
    }
    db.products[idx] = {
      ...db.products[idx],
      ...body,
      price: Number(body.price),
      originalPrice: Number(body.originalPrice || body.price),
      discount: Number(body.discount || 0),
      rating: Number(body.rating || db.products[idx].rating)
    };
    writeDb(db);
    return NextResponse.json({ status: 'success', message: 'Product updated successfully.', product: db.products[idx] });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Invalid request body.' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'Product ID is required for deletion.' }, { status: 400 });
    }
    const db = readDb();
    const filtered = db.products.filter(p => p.id !== id);
    if (filtered.length === db.products.length) {
      return NextResponse.json({ status: 'error', message: 'Product not found.' }, { status: 404 });
    }
    db.products = filtered;
    writeDb(db);
    return NextResponse.json({ status: 'success', message: 'Product deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Invalid request.' }, { status: 400 });
  }
}
