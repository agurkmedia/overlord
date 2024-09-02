<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

async function getUserId() {
  console.log('Attempting to get user session');
  const session = await getServerSession(authOptions);
  console.log('Session:', session);
  if (!session?.user?.id) {
    console.log('No user ID found in session');
    throw new Error('Unauthorized');
  }
  console.log('User ID:', session.user.id);
  return parseInt(session.user.id);
}

export async function GET(request: Request) {
  console.log('GET request received for shopping items');
  try {
    const userId = await getUserId();
    const shoppingItems = await prisma.shoppingItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    console.log('Shopping items fetched:', shoppingItems.length);
    return NextResponse.json(shoppingItems);
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  console.log('POST request received for shopping item');
  try {
    const userId = await getUserId();
    const { name, quantity } = await request.json();
    console.log('Received data:', { name, quantity });

    const newItem = await prisma.shoppingItem.create({
      data: { name, quantity, userId },
    });
    console.log('New shopping item created:', newItem);
    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  console.log('PATCH request received for shopping item');
  try {
    const userId = await getUserId();
    const { id, name, quantity, completed } = await request.json();
    console.log('Received data:', { id, name, quantity, completed });

    const updatedItem = await prisma.shoppingItem.updateMany({
      where: { id: Number(id), userId },
      data: { 
        ...(name !== undefined && { name }),
        ...(quantity !== undefined && { quantity }),
        ...(completed !== undefined && { completed }),
      },
    });
    console.log('Update result:', updatedItem);
    if (updatedItem.count === 0) {
      console.log('Item not found or unauthorized');
      return NextResponse.json({ error: 'Item not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error in PATCH:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  console.log('DELETE request received for shopping item');
  try {
    const userId = await getUserId();
    const { id } = await request.json();
    console.log('Received data:', { id });

    const deletedItem = await prisma.shoppingItem.deleteMany({
      where: { id: Number(id), userId },
    });
    console.log('Delete result:', deletedItem);
    if (deletedItem.count === 0) {
      console.log('Item not found or unauthorized');
      return NextResponse.json({ error: 'Item not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
=======
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const shoppingItems = await prisma.shoppingItem.findMany();
  return NextResponse.json(shoppingItems);
}

export async function POST(request: Request) {
  const { name, quantity } = await request.json();
  const newItem = await prisma.shoppingItem.create({
    data: { name, quantity },
  });
  return NextResponse.json(newItem);
}

export async function PATCH(request: Request) {
  const { id, name, quantity } = await request.json();
  const updatedItem = await prisma.shoppingItem.update({
    where: { id },
    data: { name, quantity },
  });
  return NextResponse.json(updatedItem);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await prisma.shoppingItem.delete({
    where: { id },
  });
  return NextResponse.json({ id });
>>>>>>> b3238c8eeff0561bcaeb0f06f18f9ef03691da46
}