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
  console.log('GET request received');
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Query params:', { startDate, endDate });

    const whereClause: any = { userId };
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
      };
    }

    console.log('Where clause:', whereClause);

    const notes = await prisma.calendarNote.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });
    console.log('Notes fetched:', notes.length);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  console.log('POST request received');
  try {
    const userId = await getUserId();
    const { date, time, content } = await request.json();
    console.log('Received data:', { date, time, content });

    const newNote = await prisma.calendarNote.create({
      data: {
        date: new Date(date),
        time,
        content,
        userId,
      },
    });
    console.log('New note created:', newNote);
    return NextResponse.json(newNote);
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  console.log('PATCH request received');
  try {
    const userId = await getUserId();
    const { id, completed } = await request.json();
    console.log('Received data:', { id, completed });

    const updatedNote = await prisma.calendarNote.updateMany({
      where: { id: Number(id), userId },
      data: { completed },
    });
    console.log('Update result:', updatedNote);
    if (updatedNote.count === 0) {
      console.log('Note not found or unauthorized');
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error in PATCH:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  console.log('PUT request received');
  try {
    const userId = await getUserId();
    const { id, date, time, content } = await request.json();
    console.log('Received data:', { id, date, time, content });

    const updatedNote = await prisma.calendarNote.updateMany({
      where: { id: Number(id), userId },
      data: { date: new Date(date), time, content },
    });
    console.log('Update result:', updatedNote);
    if (updatedNote.count === 0) {
      console.log('Note not found or unauthorized');
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error in PUT:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  console.log('DELETE request received');
  try {
    const userId = await getUserId();
    const { id } = await request.json();
    console.log('Received data:', { id });

    const deletedNote = await prisma.calendarNote.deleteMany({
      where: { id: Number(id), userId },
    });
    console.log('Delete result:', deletedNote);
    if (deletedNote.count === 0) {
      console.log('Note not found or unauthorized');
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}