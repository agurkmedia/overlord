import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const notes = [];
  const now = new Date();

  for (let day = 0; day < 10; day++) {
    const date = new Date(now);
    date.setDate(now.getDate() - day);

    for (let i = 0; i < 20; i++) {
      const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
      const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
      const content = `Note ${i + 1} for ${date.toISOString().split('T')[0]} at ${time}`;

      notes.push({
        date,
        time,
        content,
        completed: Math.random() > 0.5,
      });
    }
  }

  await prisma.calendarNote.createMany({
    data: notes,
  });

  console.log('Inserted notes successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });