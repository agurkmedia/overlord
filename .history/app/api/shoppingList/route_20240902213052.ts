
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const shoppingList = await prisma.shoppingList.findMany();
  return NextResponse.json(shoppingList);

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const shoppingList = await prisma.shoppingList.findMany();
  return NextResponse.json(shoppingList);

}